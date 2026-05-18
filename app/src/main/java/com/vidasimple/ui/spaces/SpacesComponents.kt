package com.vidasimple.ui.spaces

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ClipboardManager
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.Space
import com.vidasimple.domain.model.Profile
import com.vidasimple.data.supabase.SupabaseManager
import io.github.jan.supabase.gotrue.auth


// ═══════════════════════════════════════════════════════════════
//  SPACE SELECTOR BAR — horizontal pill chips
// ═══════════════════════════════════════════════════════════════
@Composable
fun SpaceSelectorBar(
    spaces: List<Space>,
    selectedSpaceId: String?,
    activeMembers: List<Profile> = emptyList(),
    onSpaceSelected: (String?) -> Unit,
    onCreateClick: () -> Unit,
    onDeleteClick: (() -> Unit)? = null
) {
    val selectedSpace = spaces.firstOrNull { it.id == selectedSpaceId }
    val clipboard = LocalClipboardManager.current
    var copied by remember(selectedSpaceId) { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            contentPadding = PaddingValues(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Personal space chip
            item {
                SpaceChip(
                    name       = "Personal",
                    isSelected = selectedSpaceId == null,
                    onClick    = { onSpaceSelected(null) },
                    icon       = Icons.Default.Person
                )
            }

            // Shared spaces
            items(spaces) { space ->
                SpaceChip(
                    name       = space.name,
                    isSelected = selectedSpaceId == space.id,
                    onClick    = { onSpaceSelected(space.id) },
                    icon       = Icons.Default.Groups
                )
            }

            // Add / join button
            item {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .shadow(4.dp, CircleShape, spotColor = VioletPrimary.copy(alpha = 0.3f))
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientViolet))
                        .clickable { onCreateClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Crear o unirse a espacio",
                        tint     = Color.White,
                        modifier = Modifier.size(20.dp)
                     )
                }
            }
        }

        // Persistent, copyable invite code pill and member avatars for the selected shared space
        if (selectedSpace != null && !selectedSpace.inviteCode.isNullOrBlank()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(VioletPrimary.copy(alpha = 0.08f))
                        .clickable {
                            clipboard.setText(AnnotatedString(selectedSpace.inviteCode))
                            copied = true
                        }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.VpnKey,
                        contentDescription = null,
                        tint = VioletPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Código: ",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = selectedSpace.inviteCode,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = VioletPrimary,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        imageVector = if (copied) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copiar código",
                        tint = if (copied) SuccessGreen else VioletPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    if (copied) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "¡Copiado!",
                            fontSize = 11.sp,
                            color = SuccessGreen,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Member avatars and Delete option for the owner
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Member avatars overlapping
                    if (activeMembers.isNotEmpty()) {
                        MemberAvatarsRow(members = activeMembers)
                    }

                    // Delete button (only for owner)
                    val currentUserId = remember { SupabaseManager.client.auth.currentUserOrNull()?.id }
                    val isOwner = selectedSpace.ownerId == currentUserId
                    if (isOwner && onDeleteClick != null) {
                        IconButton(
                            onClick = onDeleteClick,
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFFEE2E2))
                        ) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "Eliminar espacio",
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DeleteSpaceConfirmDialog(
    spaceName: String,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
    isLoading: Boolean = false
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(24.dp, RoundedCornerShape(28.dp), spotColor = Color.Red.copy(alpha = 0.2f))
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Warning Icon Header
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFEE2E2)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.DeleteForever,
                        null,
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "¿Eliminar Espacio?",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    "Estás a punto de eliminar el espacio compartido '$spaceName'. Esta acción no se puede deshacer.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp, bottom = 24.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Cancelar", fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = onConfirm,
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Eliminar", fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MemberAvatarsRow(members: List<Profile>) {
    Row(
        horizontalArrangement = Arrangement.spacedBy((-8).dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val displayMembers = members.take(3)
        val remainingCount = members.size - displayMembers.size

        displayMembers.forEachIndexed { i, member ->
            val name = member.name ?: member.email ?: "?"
            val initial = name.firstOrNull()?.toString()?.uppercase() ?: "?"
            val bgGradient = when (i % 3) {
                0 -> Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)))
                1 -> Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)))
                else -> Brush.linearGradient(listOf(Color(0xFF10B981), Color(0xFF047857)))
            }

            Box(
                modifier = Modifier
                    .size(28.dp)
                    .shadow(2.dp, CircleShape)
                    .clip(CircleShape)
                    .background(bgGradient),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = initial,
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }

        if (remainingCount > 0) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .shadow(2.dp, CircleShape)
                    .clip(CircleShape)
                    .background(Color(0xFFE2E8F0)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "+$remainingCount",
                    color = Color(0xFF475569),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun SpaceActivityPanel(
    activities: List<com.vidasimple.domain.model.SpaceActivity>,
    members: List<Profile>
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.History,
                        contentDescription = null,
                        tint = VioletPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Actividad del Espacio",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = VioletPrimary.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = activities.size.toString(),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = VioletPrimary,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(
                    modifier = Modifier
                        .padding(top = 12.dp)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (activities.isEmpty()) {
                        Text(
                            text = "No hay actividad reciente en este espacio",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp)
                        )
                    } else {
                        activities.take(8).forEach { act ->
                            val user = members.firstOrNull { it.id == act.userId }
                            val userName = user?.name ?: user?.email ?: "Alguien"
                            val actionText = when (act.action) {
                                "task_created" -> "creó la tarea"
                                "task_completed" -> "completó la tarea"
                                "task_assigned" -> "asignó la tarea"
                                "expense_added" -> "añadió el gasto"
                                else -> "modificó el espacio"
                            }
                            val icon = when (act.action) {
                                "task_created" -> Icons.Default.AddTask
                                "task_completed" -> Icons.Default.CheckCircle
                                "task_assigned" -> Icons.Default.Person
                                "expense_added" -> Icons.Default.Receipt
                                else -> Icons.Default.Edit
                            }
                            val iconColor = when (act.action) {
                                "task_completed" -> SuccessGreen
                                "expense_added" -> Color(0xFF10B981) // TealAccent / Emerald
                                else -> VioletPrimary
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    tint = iconColor,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = AnnotatedString.Builder().apply {
                                            append(userName)
                                            addStyle(androidx.compose.ui.text.SpanStyle(fontWeight = FontWeight.Bold), 0, userName.length)
                                            append(" $actionText ")
                                            val startEntity = length
                                            append(act.entityTitle ?: "General")
                                            addStyle(androidx.compose.ui.text.SpanStyle(fontWeight = FontWeight.SemiBold, color = VioletPrimary), startEntity, length)
                                        }.toAnnotatedString(),
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  SPACE CHIP
// ═══════════════════════════════════════════════════════════════
@Composable
fun SpaceChip(
    name: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    val containerColor = if (isSelected) VioletPrimary else MaterialTheme.colorScheme.surfaceVariant
    val contentColor   = if (isSelected) Color.White   else MaterialTheme.colorScheme.onSurfaceVariant

    Surface(
        modifier      = Modifier
            .shadow(if (isSelected) 8.dp else 2.dp, RoundedCornerShape(20.dp),
                spotColor = VioletPrimary.copy(alpha = if (isSelected) 0.3f else 0f))
            .clickable { onClick() },
        shape         = RoundedCornerShape(20.dp),
        color         = containerColor,
        tonalElevation = if (isSelected) 4.dp else 0.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 9.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = contentColor, modifier = Modifier.size(15.dp))
            Spacer(modifier = Modifier.width(7.dp))
            Text(
                name,
                fontSize   = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color      = contentColor
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  CREATE / JOIN SPACE DIALOG — Premium full-screen bottom sheet
// ═══════════════════════════════════════════════════════════════
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateSpaceDialog(
    onDismiss: () -> Unit,
    onCreate: (String) -> Unit,
    onJoin: (String) -> Unit,
    isLoading: Boolean = false
) {
    var spaceName   by remember { mutableStateOf("") }
    var inviteCode  by remember { mutableStateOf("") }
    var mode        by remember { mutableStateOf(0) }   // 0=Crear, 1=Unirme
    var nameError   by remember { mutableStateOf(false) }
    var codeError   by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(24.dp, RoundedCornerShape(32.dp), spotColor = VioletPrimary.copy(alpha = 0.2f))
        ) {
            Column(modifier = Modifier.padding(28.dp)) {

                // ── Icon header ──────────────────────────────────
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientViolet))
                        .align(Alignment.CenterHorizontally),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (mode == 0) Icons.Default.GroupAdd else Icons.Default.Login,
                        null, tint = Color.White,
                        modifier = Modifier.size(30.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "Espacios Compartidos",
                    style     = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    modifier  = Modifier.align(Alignment.CenterHorizontally)
                )
                Text(
                    "Colabora con familia o amigos en tiempo real",
                    fontSize  = 13.sp,
                    color     = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier  = Modifier.padding(top = 4.dp, bottom = 20.dp).align(Alignment.CenterHorizontally)
                )

                // ── Tabs ─────────────────────────────────────────
                TabRow(
                    selectedTabIndex = mode,
                    containerColor   = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    indicator = { positions ->
                        Box(
                            Modifier
                                .tabIndicatorOffset(positions[mode])
                                .height(3.dp)
                                .background(VioletPrimary, RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp))
                        )
                    },
                    divider = {},
                    modifier = Modifier.clip(RoundedCornerShape(12.dp))
                ) {
                    Tab(selected = mode == 0, onClick = { mode = 0; nameError = false; codeError = false }) {
                        Row(
                            modifier = Modifier.padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                            Text("Crear", fontWeight = FontWeight.SemiBold)
                        }
                    }
                    Tab(selected = mode == 1, onClick = { mode = 1; nameError = false; codeError = false }) {
                        Row(
                            modifier = Modifier.padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Login, null, modifier = Modifier.size(16.dp))
                            Text("Unirme", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ── Form ─────────────────────────────────────────
                AnimatedContent(targetState = mode, label = "spaceMode") { tab ->
                    if (tab == 0) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                "Nombre del espacio",
                                fontSize   = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color      = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            OutlinedTextField(
                                value         = spaceName,
                                onValueChange = { spaceName = it; nameError = false },
                                placeholder   = { Text("Ej: Familia García, Roomies, Pareja") },
                                leadingIcon   = { Icon(Icons.Default.Groups, null) },
                                isError       = nameError,
                                supportingText = if (nameError) ({ Text("El nombre es requerido") }) else null,
                                modifier      = Modifier.fillMaxWidth(),
                                shape         = RoundedCornerShape(16.dp),
                                singleLine    = true,
                                colors        = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor   = VioletPrimary,
                                    focusedLabelColor    = VioletPrimary
                                ),
                                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
                            )
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = VioletPrimary.copy(alpha = 0.08f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.Info, null, tint = VioletPrimary, modifier = Modifier.size(16.dp))
                                    Text(
                                        "Se generará un código de invitación automáticamente",
                                        fontSize = 12.sp,
                                        color    = VioletPrimary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                "Código de invitación",
                                fontSize   = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color      = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            OutlinedTextField(
                                value         = inviteCode,
                                onValueChange = { inviteCode = it.uppercase().take(6); codeError = false },
                                placeholder   = { Text("XXXXXX") },
                                leadingIcon   = { Icon(Icons.Default.VpnKey, null) },
                                isError       = codeError,
                                supportingText = if (codeError) ({ Text("Ingresa el código de 6 letras") }) else null,
                                modifier      = Modifier.fillMaxWidth(),
                                shape         = RoundedCornerShape(16.dp),
                                singleLine    = true,
                                colors        = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = VioletPrimary,
                                    focusedLabelColor  = VioletPrimary
                                ),
                                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters)
                            )
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = TealAccent.copy(alpha = 0.08f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.Share, null, tint = TealAccent, modifier = Modifier.size(16.dp))
                                    Text(
                                        "Pide el código al creador del espacio",
                                        fontSize = 12.sp,
                                        color    = TealAccent,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // ── Buttons ──────────────────────────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick  = onDismiss,
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape    = RoundedCornerShape(16.dp)
                    ) {
                        Text("Cancelar", fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            if (mode == 0) {
                                if (spaceName.isBlank()) { nameError = true; return@Button }
                                onCreate(spaceName)
                                onDismiss()
                            } else {
                                if (inviteCode.length < 6) { codeError = true; return@Button }
                                onJoin(inviteCode)
                                onDismiss()
                            }
                        },
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape    = RoundedCornerShape(16.dp),
                        colors   = ButtonDefaults.buttonColors(containerColor = VioletPrimary),
                        enabled  = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                color    = Color.White,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                if (mode == 0) "Crear Espacio" else "Unirme",
                                fontWeight = FontWeight.Bold,
                                color      = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  INVITE CODE BANNER — shows after space creation
// ═══════════════════════════════════════════════════════════════
@Composable
fun InviteCodeBanner(
    inviteCode: String,
    spaceName: String,
    onDismiss: () -> Unit
) {
    val clipboard = LocalClipboardManager.current
    var copied by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape    = RoundedCornerShape(28.dp),
            color    = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(20.dp, RoundedCornerShape(28.dp), spotColor = VioletPrimary.copy(alpha = 0.25f))
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(70.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientViolet)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.CheckCircle, null, tint = Color.White, modifier = Modifier.size(36.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "¡Espacio creado!",
                    style      = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black
                )
                Text(
                    spaceName,
                    fontSize = 15.sp,
                    color    = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )

                Text(
                    "Comparte este código de invitación",
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color      = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Code display
                Surface(
                    shape    = RoundedCornerShape(20.dp),
                    color    = VioletPrimary.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            inviteCode,
                            fontSize   = 32.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 8.sp,
                            color      = VioletPrimary
                        )
                        IconButton(
                            onClick = {
                                clipboard.setText(AnnotatedString(inviteCode))
                                copied = true
                            }
                        ) {
                            Icon(
                                if (copied) Icons.Default.CheckCircle else Icons.Default.ContentCopy,
                                null,
                                tint = if (copied) SuccessGreen else VioletPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    "Tus colaboradores lo usan en 'Unirme'",
                    fontSize = 12.sp,
                    color    = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick  = onDismiss,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape    = RoundedCornerShape(16.dp),
                    colors   = ButtonDefaults.buttonColors(containerColor = VioletPrimary)
                ) {
                    Text("¡Entendido!", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }
    }
}
