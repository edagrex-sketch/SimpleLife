package com.vidasimple.ui.profile

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Task
import com.vidasimple.workers.InsightsWorker
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.functions.functions
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class ProfileViewModel(application: android.app.Application) : androidx.lifecycle.AndroidViewModel(application) {
    var notificationsEnabled = mutableStateOf(true)
        private set

    var darkModeEnabled = mutableStateOf(false)
        private set

    var insightsEnabled = mutableStateOf(true)
        private set

    var userName = mutableStateOf("Usuario VidaSimple")
        private set

    var userEmail = mutableStateOf("email@ejemplo.com")
        private set

    var streak = mutableStateOf(0)
        private set

    var completedTasksCount = mutableStateOf(0)
        private set

    var statusMessage = mutableStateOf<String?>(null)
        private set

    init {
        loadUserProfile()
        refreshData()
        insightsEnabled.value = InsightsWorker.isEnabled(getApplication())
    }

    fun refreshData() {
        calculateStreakAndStats()
    }

    private fun loadUserProfile() {
        val user = SupabaseManager.client.auth.currentUserOrNull()
        user?.let {
            userEmail.value = it.email ?: "email@ejemplo.com"
            val metadata = it.userMetadata
            val name = metadata?.get("name")?.toString()?.removeSurrounding("\"") 
                ?: metadata?.get("full_name")?.toString()?.removeSurrounding("\"")
            
            if (!name.isNullOrBlank() && name != "null") {
                userName.value = name
            } else {
                userName.value = it.email?.substringBefore("@")?.replaceFirstChar { c -> c.uppercase() } ?: "Usuario"
            }
        }
    }

    private fun calculateStreakAndStats() {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return
        
        viewModelScope.launch {
            try {
                val allTasks = SupabaseManager.client.from("tasks")
                    .select {
                        filter {
                            eq("user_id", userId)
                        }
                    }
                    .decodeList<Task>()
                
                val completedTasks = allTasks.filter { it.isDone == true }
                completedTasksCount.value = completedTasks.size
                
                if (completedTasks.isEmpty()) {
                    streak.value = 0
                    com.vidasimple.data.widget.WidgetCacheHelper.updateStreak(getApplication(), 0)
                    return@launch
                }

                val completedDates = completedTasks.mapNotNull { it.dueDate }
                    .map { LocalDate.parse(it) }
                    .distinct()
                    .sortedDescending()

                if (completedDates.isEmpty()) {
                    streak.value = 0
                    com.vidasimple.data.widget.WidgetCacheHelper.updateStreak(getApplication(), 0)
                    return@launch
                }

                var currentStreak = 0
                var checkDate = LocalDate.now()

                if (!completedDates.contains(checkDate)) {
                    checkDate = checkDate.minusDays(1)
                }

                for (date in completedDates) {
                    if (date == checkDate) {
                        currentStreak++
                        checkDate = checkDate.minusDays(1)
                    } else if (date.isBefore(checkDate)) {
                        break
                    }
                }

                streak.value = currentStreak
                com.vidasimple.data.widget.WidgetCacheHelper.updateStreak(getApplication(), currentStreak)

            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun toggleNotifications(enabled: Boolean) {
        notificationsEnabled.value = enabled
    }

    fun toggleDarkMode(enabled: Boolean) {
        darkModeEnabled.value = enabled
    }

    fun toggleInsights(enabled: Boolean) {
        insightsEnabled.value = enabled
        InsightsWorker.setEnabled(getApplication(), enabled)
        statusMessage.value = if (enabled) "Briefing diario activado ☀️" else "Briefing diario desactivado"
    }

    fun signOut(onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                SupabaseManager.client.auth.signOut()
                onSuccess()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun sendTestNotification() {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: return
        val userId = user.id
        
        viewModelScope.launch {
            try {
                statusMessage.value = "Enviando prueba..."
                SupabaseManager.client.functions.invoke("send-notification", buildJsonObject {
                    put("title", "¡Prueba de VidaSimple!")
                    put("body", "Esta es una notificación de prueba para despertar tu dispositivo 🚀")
                    put("user_id", userId)
                })
                statusMessage.value = "Notificación enviada con éxito"
            } catch (e: Exception) {
                e.printStackTrace()
                statusMessage.value = "Error al enviar notificación"
            }
        }
    }

    fun clearStatusMessage() {
        statusMessage.value = null
    }
}
