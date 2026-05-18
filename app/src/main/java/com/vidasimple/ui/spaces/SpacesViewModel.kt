package com.vidasimple.ui.spaces

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Space
import com.vidasimple.domain.model.Profile
import com.vidasimple.domain.model.SpaceMember
import com.vidasimple.domain.model.SpaceActivity
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import kotlinx.coroutines.launch

class SpacesViewModel : ViewModel() {

    private val _spaces = mutableStateListOf<Space>()
    // Spaces shown in selector (excludes Personal — that is represented by null ID)
    val spaces: List<Space> get() = _spaces

    var selectedSpaceId by mutableStateOf<String?>(null)
        private set
        
    val activeMembers = mutableStateListOf<Profile>()
    val activeActivities = mutableStateListOf<SpaceActivity>()

    var isLoading by mutableStateOf(false)
        private set

    var message by mutableStateOf<String?>(null)
        private set

    // The last created/fetched space's invite code so the UI can show it
    var lastCreatedInviteCode by mutableStateOf<String?>(null)
        private set

    fun clearMessage() { message = null }
    fun clearInviteCode() { lastCreatedInviteCode = null }

    // Call this after auth is confirmed (from the screen using LaunchedEffect)
    fun initialize() {
        if (SupabaseManager.client.auth.currentUserOrNull() != null) {
            fetchSpaces()
        }
    }

    fun fetchSpaces() {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return
        isLoading = true
        viewModelScope.launch {
            try {
                // Fetch spaces where user is owner OR member
                // The RLS policy already filters for us, so .select() returns the right rows
                val fetched = SupabaseManager.client.from("spaces")
                    .select()
                    .decodeList<Space>()

                _spaces.clear()
                _spaces.addAll(fetched)
            } catch (e: Exception) {
                e.printStackTrace()
                message = "Error al cargar espacios"
            } finally {
                isLoading = false
            }
        }
    }

    fun createSpace(name: String) {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: run {
            message = "Inicia sesión para crear un espacio"
            return
        }
        if (name.isBlank()) { message = "El nombre no puede estar vacío"; return }

        isLoading = true
        viewModelScope.launch {
            try {
                // Generate a unique 6-char uppercase invite code
                val inviteCode = (1..6).map {
                    ('A'..'Z').random()
                }.joinToString("")

                val newSpace = Space(
                    name      = name.trim(),
                    ownerId   = user.id,
                    inviteCode = inviteCode
                )

                val inserted = SupabaseManager.client.from("spaces")
                    .insert(newSpace) { select() }
                    .decodeSingle<Space>()

                // Auto-join the creator as member
                SupabaseManager.client.from("space_members").insert(
                    mapOf("space_id" to inserted.id, "user_id" to user.id)
                )

                _spaces.add(inserted)
                lastCreatedInviteCode = inserted.inviteCode
                message = "¡Espacio '${inserted.name}' creado!"

                // Auto-select the new space
                selectedSpaceId = inserted.id
            } catch (e: Exception) {
                e.printStackTrace()
                message = "Error al crear: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun joinSpace(inviteCode: String) {
        if (SupabaseManager.client.auth.currentUserOrNull() == null) {
            message = "Inicia sesión para unirte"
            return
        }
        if (inviteCode.isBlank()) { message = "Ingresa un código"; return }

        isLoading = true
        viewModelScope.launch {
            try {
                // Call the secure RPC function to check the code and join the user atomically
                val joinedSpace = SupabaseManager.client.postgrest.rpc(
                    "join_space_by_code",
                    mapOf("entered_code" to inviteCode.trim().uppercase())
                ).decodeSingle<Space>()

                // Check if already a member in local state
                val already = _spaces.any { it.id == joinedSpace.id }
                if (!already) {
                    _spaces.add(joinedSpace)
                }

                selectedSpaceId = joinedSpace.id
                message = "¡Te uniste a '${joinedSpace.name}'!"
            } catch (e: Exception) {
                e.printStackTrace()
                val errMsg = e.message ?: ""
                message = when {
                    errMsg.contains("Código inválido") -> "Código inválido, revísalo"
                    errMsg.contains("Inicia sesión") -> "Inicia sesión para unirte"
                    else -> "Error al unirse: Código inválido o ya eres miembro"
                }
            } finally {
                isLoading = false
            }
        }
    }

    fun fetchSpaceMembersAndActivity(spaceId: String) {
        viewModelScope.launch {
            try {
                // 1. Fetch space members
                val members = SupabaseManager.client.from("space_members")
                    .select { filter { eq("space_id", spaceId) } }
                    .decodeList<SpaceMember>()
                
                // 2. Fetch profiles for these members
                val memberIds = members.map { it.userId }
                if (memberIds.isNotEmpty()) {
                    val memberProfiles = SupabaseManager.client.from("profiles")
                        .select {
                            filter {
                                isIn("id", memberIds)
                            }
                        }.decodeList<Profile>()
                    activeMembers.clear()
                    activeMembers.addAll(memberProfiles)
                } else {
                    activeMembers.clear()
                }

                // 3. Fetch recent activity (limit 20)
                val activities = SupabaseManager.client.from("space_activity")
                    .select {
                        filter { eq("space_id", spaceId) }
                        order("created_at", Order.DESCENDING)
                        limit(20)
                    }.decodeList<SpaceActivity>()
                activeActivities.clear()
                activeActivities.addAll(activities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun deleteSpace(spaceId: String, onSuccess: () -> Unit = {}) {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: run {
            message = "Inicia sesión para realizar esta acción"
            return
        }
        val space = _spaces.firstOrNull { it.id == spaceId } ?: return
        if (space.ownerId != user.id) {
            message = "Solo el creador puede eliminar este espacio"
            return
        }

        isLoading = true
        viewModelScope.launch {
            try {
                // 1. Update calendar events of this space to set space_id = NULL
                // because calendar_events_space_id_fkey has NO ACTION delete rule
                SupabaseManager.client.from("calendar_events").update(
                    mapOf("space_id" to null)
                ) {
                    filter {
                        eq("space_id", spaceId)
                    }
                }

                // 2. Delete the space itself
                // foreign keys with ON DELETE CASCADE will automatically clean space_members and space_activity
                // foreign keys with ON DELETE SET NULL will set space_id = NULL on tasks and expenses
                SupabaseManager.client.from("spaces").delete {
                    filter {
                        eq("id", spaceId)
                    }
                }

                _spaces.removeAll { it.id == spaceId }
                selectedSpaceId = null
                message = "Espacio eliminado exitosamente"
                onSuccess()
            } catch (e: Exception) {
                e.printStackTrace()
                message = "Error al eliminar: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun selectSpace(spaceId: String?) {
        selectedSpaceId = spaceId
        if (spaceId != null) {
            fetchSpaceMembersAndActivity(spaceId)
        } else {
            activeMembers.clear()
            activeActivities.clear()
        }
    }
}

