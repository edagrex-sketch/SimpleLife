package com.vidasimple.ui.tasks

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.Task
import com.vidasimple.domain.model.TaskPriority
import com.vidasimple.domain.model.Profile
import com.vidasimple.domain.model.getColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(
    innerPadding: PaddingValues, 
    viewModel: TasksViewModel = viewModel(),
    spacesViewModel: com.vidasimple.ui.spaces.SpacesViewModel = viewModel()
) {
    val pendingTasks   = viewModel.pendingTasks
    val completedTasks = viewModel.completedTasks
    val context = LocalContext.current
    var showAddDialog     by remember { mutableStateOf(false) }
    var showVoiceSheet   by remember { mutableStateOf(false) }
    var showSpaceDialog  by remember { mutableStateOf(false) }
    var showDeleteSpaceDialog by remember { mutableStateOf(false) }
    var completedExpanded by remember { mutableStateOf(false) }
    var selectedFilter   by remember { mutableStateOf(TaskPriority.NONE) }

    // Initialize spaces once, after auth is ready
    LaunchedEffect(Unit) { spacesViewModel.initialize() }

    // Sync TasksViewModel with the space selected in SpacesViewModel
    val currentSpaceId = spacesViewModel.selectedSpaceId
    LaunchedEffect(currentSpaceId) { viewModel.selectSpace(currentSpaceId) }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) showVoiceSheet = true
    }

    val background = MaterialTheme.colorScheme.background

    LaunchedEffect(viewModel.message) {
        viewModel.message?.let {
            android.widget.Toast.makeText(context, it, android.widget.Toast.LENGTH_SHORT).show()
            viewModel.clearMessage()
        }
    }
    LaunchedEffect(spacesViewModel.message) {
        spacesViewModel.message?.let { msg ->
            android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_SHORT).show()
            spacesViewModel.clearMessage()
        }
    }

    Scaffold(
        containerColor = background,
        floatingActionButton = {
            Row(
                modifier = Modifier.padding(bottom = innerPadding.calculateBottomPadding() + 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Voice FAB
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .shadow(12.dp, CircleShape, spotColor = TealAccent.copy(alpha = 0.4f))
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientTeal))
                        .clickable { 
                            val permissionCheckResult = androidx.core.content.ContextCompat.checkSelfPermission(context, android.Manifest.permission.RECORD_AUDIO)
                            if (permissionCheckResult == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                                showVoiceSheet = true
                            } else {
                                permissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Mic, null, tint = Color.White, modifier = Modifier.size(24.dp))
                }

                // Main FAB
                PremiumFAB(
                    onClick = { showAddDialog = true }
                )
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = innerPadding.calculateBottomPadding() + 80.dp)
        ) {
            // ── Header ───────────────────────────────────────────────────
            item {
                TasksHeader(viewModel = viewModel)
            }

            // ── Space Selector ───────────────────────────────────────────
            item {
                com.vidasimple.ui.spaces.SpaceSelectorBar(
                    spaces          = spacesViewModel.spaces,
                    selectedSpaceId = spacesViewModel.selectedSpaceId,
                    activeMembers   = spacesViewModel.activeMembers,
                    onSpaceSelected = { spacesViewModel.selectSpace(it) },
                    onCreateClick   = { showSpaceDialog = true },
                    onDeleteClick   = { showDeleteSpaceDialog = true }
                )
            }

            if (spacesViewModel.selectedSpaceId != null) {
                item {
                    com.vidasimple.ui.spaces.SpaceActivityPanel(
                        activities = spacesViewModel.activeActivities,
                        members    = spacesViewModel.activeMembers
                    )
                }
            }

            // ── Filter chips ─────────────────────────────────────────────
            item {
                PremiumFilterBar(
                    selected = selectedFilter,
                    onSelect = {
                        selectedFilter = it
                        viewModel.setFilter(it)
                    }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // ── Progress summary ──────────────────────────────────────────
            item {
                TasksProgressCard(
                    pending   = pendingTasks.size,
                    completed = completedTasks.size
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // ── Pending tasks ─────────────────────────────────────────────
            if (pendingTasks.isEmpty()) {
                item {
                    EmptyStateCard(
                        title    = "¡Sin pendientes!",
                        subtitle = "Añade tareas con el botón +",
                        icon     = Icons.Default.TaskAlt,
                        color    = VioletPrimary
                    )
                }
            } else {
                itemsIndexed(
                    items = pendingTasks,
                    key = { _, task -> task.id ?: task.title }
                ) { index, task ->
                    AdvancedTaskItem(
                        task     = task,
                        index    = index,
                        profiles = (viewModel.profiles + spacesViewModel.activeMembers).distinctBy { it.id },
                        onComplete = { viewModel.toggleTaskDone(task) },
                        onDelete   = { viewModel.deleteTask(task) }
                    )
                }
            }

            // ── Completed tasks toggle ────────────────────────────────────
            if (completedTasks.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    CompletedToggleHeader(
                        count    = completedTasks.size,
                        expanded = completedExpanded,
                        onClick  = { completedExpanded = !completedExpanded }
                    )
                }

                if (completedExpanded) {
                    itemsIndexed(
                        items = completedTasks,
                        key = { _, task -> task.id ?: task.title }
                    ) { index, task ->
                        AdvancedTaskItem(
                            task     = task,
                            index    = index,
                            profiles = (viewModel.profiles + spacesViewModel.activeMembers).distinctBy { it.id },
                            onComplete = { viewModel.toggleTaskDone(task) },
                            onDelete   = { viewModel.deleteTask(task) }
                        )
                    }
                }
            }
        }

        if (showAddDialog) {
            PremiumTaskBottomSheet(
                members   = spacesViewModel.activeMembers,
                onDismiss = { showAddDialog = false },
                onConfirm = { title: String, priority: TaskPriority, assignedToId: String? ->
                    viewModel.addTask(title, priority, assignedToId = assignedToId)
                    showAddDialog = false
                }
            )
        }

        if (showVoiceSheet) {
            VoiceTaskBottomSheet(
                onDismiss = { showVoiceSheet = false },
                onTaskParsed = { title, priority, dueDate ->
                    if (dueDate != null) {
                        viewModel.addTaskWithDate(title, priority, dueDate)
                    } else {
                        viewModel.addTask(title, priority)
                    }
                    showVoiceSheet = false
                }
            )
        }

        if (showSpaceDialog) {
            com.vidasimple.ui.spaces.CreateSpaceDialog(
                onDismiss = { showSpaceDialog = false },
                onCreate  = { name -> spacesViewModel.createSpace(name) },
                onJoin    = { code -> spacesViewModel.joinSpace(code) },
                isLoading = spacesViewModel.isLoading
            )
        }

        if (showDeleteSpaceDialog) {
            val selectedSpace = spacesViewModel.spaces.firstOrNull { it.id == spacesViewModel.selectedSpaceId }
            if (selectedSpace != null) {
                com.vidasimple.ui.spaces.DeleteSpaceConfirmDialog(
                    spaceName = selectedSpace.name,
                    onDismiss = { showDeleteSpaceDialog = false },
                    onConfirm = {
                        spacesViewModel.deleteSpace(selectedSpace.id!!) {
                            showDeleteSpaceDialog = false
                        }
                    },
                    isLoading = spacesViewModel.isLoading
                )
            }
        }

        // InviteCode banner appears after space creation
        spacesViewModel.lastCreatedInviteCode?.let { code ->
            val createdSpace = spacesViewModel.spaces.firstOrNull { it.inviteCode == code }
            com.vidasimple.ui.spaces.InviteCodeBanner(
                inviteCode = code,
                spaceName  = createdSpace?.name ?: "Nuevo espacio",
                onDismiss  = { spacesViewModel.clearInviteCode() }
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  TASKS HEADER
// ═══════════════════════════════════════════════════════════
@Composable
fun TasksHeader(viewModel: TasksViewModel) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(listOf(Color(0xFF4F46E5), Color(0xFF7C3AED)))
                )
        )

        // Decorative circle
        Box(
            modifier = Modifier
                .size(180.dp)
                .offset(x = 200.dp, y = (-30).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )

        // Bottom fade
        val isDark = MaterialTheme.colorScheme.background == DarkBg
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, if (isDark) DarkBg else LightBg)
                    )
                )
        )

        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .statusBarsPadding()
                .padding(horizontal = 28.dp)
        ) {
            Text(
                "Mis Tareas",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                letterSpacing = (-0.5).sp
            )
            Text(
                "${viewModel.pendingTasks.size} pendientes · ${viewModel.completedTasks.size} completadas",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.75f),
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  PREMIUM FAB
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumFAB(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .shadow(16.dp, RoundedCornerShape(20.dp), spotColor = VioletPrimary.copy(alpha = 0.4f))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(GradientViolet))
            .clickable { onClick() }
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Nueva Tarea", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  FILTER CHIPS
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumFilterBar(selected: TaskPriority, onSelect: (TaskPriority) -> Unit) {
    val filters = listOf(
        TaskPriority.NONE   to "Todas",
        TaskPriority.HIGH   to "Alta",
        TaskPriority.MEDIUM to "Media",
        TaskPriority.LOW    to "Baja"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        filters.forEach { (priority, label) ->
            val isSelected = selected == priority
            val color      = if (priority == TaskPriority.NONE) VioletPrimary else priority.getColor()

            val scale by animateFloatAsState(
                targetValue = if (isSelected) 1.05f else 1f,
                animationSpec = spring(stiffness = Spring.StiffnessMedium),
                label = "chipScale"
            )

            Surface(
                modifier = Modifier
                    .scale(scale)
                    .clip(RoundedCornerShape(14.dp))
                    .clickable { onSelect(priority) }
                    .shadow(
                        elevation = if (isSelected) 4.dp else 0.dp,
                        shape     = RoundedCornerShape(14.dp),
                        spotColor = color.copy(alpha = 0.3f)
                    ),
                color = if (isSelected) color else MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(14.dp),
                border = if (isSelected) null else androidx.compose.foundation.BorderStroke(
                    1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                )
            ) {
                Text(
                    text = label,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 9.dp),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  PROGRESS CARD
// ═══════════════════════════════════════════════════════════
@Composable
fun TasksProgressCard(pending: Int, completed: Int) {
    val total    = pending + completed
    val progress = if (total > 0) completed.toFloat() / total.toFloat() else 0f
    val percent  = (progress * 100).toInt()

    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(900, easing = FastOutSlowInEasing),
        label = "tasksProgress"
    )

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .shadow(6.dp, RoundedCornerShape(24.dp), spotColor = VioletPrimary.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "$completed de $total completadas",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        "Progreso del día",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Circular percentage badge
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientViolet)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "$percent%",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            LinearProgressIndicator(
                progress   = animatedProgress,
                modifier   = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(8.dp)),
                color      = VioletPrimary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant,
                strokeCap  = StrokeCap.Round
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  ADVANCED TASK ITEM — Swipe-to-delete inspired design
// ═══════════════════════════════════════════════════════════
@Composable
fun AdvancedTaskItem(
    task: Task,
    index: Int,
    profiles: List<Profile>,
    onComplete: () -> Unit,
    onDelete: () -> Unit
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    AnimatedVisibility(
        visible = visible,
        enter   = slideInHorizontally(tween(350, delayMillis = index * 60)) { it / 3 }
                + fadeIn(tween(350, delayMillis = index * 60))
    ) {
        val isDone = task.isDone == true
        val priorityColor = task.priority.getColor()
        val interactionSource = remember { MutableInteractionSource() }

        var pressed by remember { mutableStateOf(false) }
        val scale by animateFloatAsState(
            targetValue = if (pressed) 0.97f else 1f,
            animationSpec = spring(dampingRatio = 0.55f, stiffness = Spring.StiffnessMediumLow),
            label = "itemScale"
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 5.dp)
                .scale(scale)
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        elevation    = if (isDone) 1.dp else 5.dp,
                        shape        = RoundedCornerShape(22.dp),
                        spotColor    = priorityColor.copy(alpha = 0.12f)
                    )
                    .clickable(
                        interactionSource = interactionSource,
                        indication        = null,
                        onClick           = {
                            pressed = true
                            onComplete()
                            pressed = false
                        }
                    ),
                shape = RoundedCornerShape(22.dp),
                color = if (isDone)
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                else
                    MaterialTheme.colorScheme.surface
            ) {
                Row(
                    modifier = Modifier.padding(start = 0.dp, end = 12.dp, top = 14.dp, bottom = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left priority strip
                    Box(
                        modifier = Modifier
                            .width(5.dp)
                            .height(44.dp)
                            .clip(RoundedCornerShape(topEnd = 4.dp, bottomEnd = 4.dp))
                            .background(
                                if (isDone) MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                                else priorityColor
                            )
                    )

                    Spacer(modifier = Modifier.width(14.dp))

                    // Checkbox
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(
                                if (isDone) Brush.linearGradient(GradientViolet)
                                else Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                            )
                            .border(
                                2.dp,
                                if (isDone) VioletPrimary else priorityColor.copy(alpha = 0.8f),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isDone) {
                            Icon(
                                Icons.Default.Check,
                                null,
                                tint = Color.White,
                                modifier = Modifier.size(15.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    // Text content
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = task.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = if (isDone)
                                MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            else
                                MaterialTheme.colorScheme.onSurface,
                            textDecoration = if (isDone) TextDecoration.LineThrough else null,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Assignee avatar bubble or "General" tag
                            val assignee = if (task.assignedToId != null) profiles.firstOrNull { it.id == task.assignedToId } else null
                            if (assignee != null) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(VioletPrimary.copy(alpha = 0.08f))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    val name = assignee.name ?: assignee.email ?: "Miembro"
                                    val initial = name.firstOrNull()?.toString()?.uppercase() ?: "?"
                                    
                                    Box(
                                        modifier = Modifier
                                            .size(16.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)))),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = initial,
                                            color = Color.White,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = name,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = VioletPrimary
                                    )
                                }
                            } else {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = priorityColor.copy(alpha = 0.1f)
                                ) {
                                    Text(
                                        text = "General",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = priorityColor,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                    )
                                }
                            }
                            
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "· ${task.priority.label}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                            
                            // Show who completed the task if it's a shared group
                            if (isDone && task.completedById != null) {
                                val completedByUser = profiles.firstOrNull { it.id == task.completedById }
                                if (completedByUser != null) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = SuccessGreen.copy(alpha = 0.12f)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                Icons.Default.CheckCircle,
                                                null,
                                                tint = SuccessGreen,
                                                modifier = Modifier.size(10.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = completedByUser.name ?: completedByUser.email ?: "Terminado",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = SuccessGreen
                                             )
                                         }
                                     }
                                 }
                             }
                        }
                    }

                    // Delete
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            Icons.Default.Close,
                            null,
                            tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  COMPLETED HEADER TOGGLE
// ═══════════════════════════════════════════════════════════
@Composable
fun CompletedToggleHeader(count: Int, expanded: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
            .clickable { onClick() }
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(SuccessGreen.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.CheckCircle, null, tint = SuccessGreen, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            "Completadas ($count)",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Icon(
            if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
            null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// ═══════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════
@Composable
fun EmptyStateCard(title: String, subtitle: String, icon: ImageVector, color: Color) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = color.copy(alpha = 0.6f), modifier = Modifier.size(36.dp))
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(
            title,
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            subtitle,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 40.dp)
        )
    }
}
// ═══════════════════════════════════════════════════════════
//  VOICE TASK BOTTOM SHEET
// ═══════════════════════════════════════════════════════════
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceTaskBottomSheet(
    onDismiss: () -> Unit,
    onTaskParsed: (String, TaskPriority, String?) -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var isListening by remember { mutableStateOf(false) }
    var transcript by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    
    val voiceHelper = remember {
        VoiceRecognitionHelper(
            context = context,
            onResult = { 
                transcript = it
                isListening = false
            },
            onError = { 
                error = it
                isListening = false
            },
            onReady = { isListening = true }
        )
    }

    LaunchedEffect(Unit) {
        voiceHelper.startListening()
    }

    ModalBottomSheet(
        onDismissRequest = {
            voiceHelper.stopListening()
            onDismiss()
        },
        dragHandle = { BottomSheetDefaults.DragHandle(color = Color(0xFFE2E8F0)) },
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "Nueva Tarea por Voz",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            // Pulse animation for mic
            val infiniteTransition = rememberInfiniteTransition()
            val scale by infiniteTransition.animateFloat(
                initialValue = 1f,
                targetValue = if (isListening) 1.2f else 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(800, easing = LinearOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                )
            )

            Box(
                modifier = Modifier
                    .size(100.dp)
                    .scale(scale)
                    .clip(CircleShape)
                    .background(
                        if (isListening) Brush.linearGradient(GradientTeal)
                        else Brush.linearGradient(listOf(Color.Gray.copy(alpha = 0.1f), Color.Gray.copy(alpha = 0.1f)))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (isListening) Icons.Default.Mic else Icons.Default.MicNone,
                    null,
                    tint = if (isListening) Color.White else Color.Gray,
                    modifier = Modifier.size(42.dp)
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            if (isListening) {
                Text(
                    "Escuchando...",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TealAccent
                )
            } else if (transcript.isNotEmpty()) {
                val parsed = remember(transcript) { VoiceTaskParser.parse(transcript) }
                
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Entendí:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "\"${transcript}\"",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 16.dp), color = Color.LightGray.copy(alpha = 0.2f))
                        
                        // Parsed details
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(parsed.priority.getColor().copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Flag, null, tint = parsed.priority.getColor(), modifier = Modifier.size(16.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(parsed.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(
                                    "Prioridad ${parsed.priority.label}" + 
                                    (if (parsed.dueDate != null) " • Para el ${parsed.dueDate}" else ""),
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                Button(
                    onClick = { onTaskParsed(parsed.title, parsed.priority, parsed.dueDate) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealAccent)
                ) {
                    Text("Confirmar y Crear", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
                
                TextButton(onClick = { 
                    transcript = ""
                    voiceHelper.startListening() 
                }) {
                    Text("Intentar de nuevo", color = Color.Gray)
                }
            } else if (error != null) {
                Text(error!!, color = Color.Red, fontSize = 14.sp)
                TextButton(onClick = { 
                    error = null
                    voiceHelper.startListening() 
                }) {
                    Text("Reintentar")
                }
            } else {
                Text("Dime algo como:", fontSize = 14.sp, color = Color.Gray)
                Text(
                    "\"Recordar pagar la luz mañana urgente\"",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
