package com.vidasimple.ui.home

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.Task
import com.vidasimple.domain.model.getColor
import com.vidasimple.ui.expenses.ExpensesViewModel
import com.vidasimple.ui.profile.ProfileViewModel
import com.vidasimple.ui.tasks.TasksViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun HomeScreen(
    innerPadding: PaddingValues,
    tasksViewModel: TasksViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel(),
    expensesViewModel: ExpensesViewModel = viewModel(),
    spacesViewModel: com.vidasimple.ui.spaces.SpacesViewModel = viewModel()
) {
    val background   = MaterialTheme.colorScheme.background
    val isDark       = background == DarkBg
    
    var showAICoach by remember {
        mutableStateOf(
            if (com.vidasimple.MainActivity.triggerAICoachDirectly) {
                com.vidasimple.MainActivity.triggerAICoachDirectly = false
                true
            } else {
                false
            }
        )
    }

    val context = androidx.compose.ui.platform.LocalContext.current
    LaunchedEffect(
        tasksViewModel.pendingTasks.size,
        expensesViewModel.totalExpensesToday,
        expensesViewModel.totalSpent,
        expensesViewModel.limit,
        profileViewModel.streak.value
    ) {
        val topTasks = tasksViewModel.pendingTasks.take(3)
        val taskTitles = topTasks.map { it.title ?: "" }
        val taskPriorities = topTasks.map { it.priority?.label ?: "Media" }

        com.vidasimple.data.widget.WidgetCacheHelper.updateCache(
            context = context,
            pendingTasksCount = tasksViewModel.pendingTasks.size,
            totalSpentToday = expensesViewModel.totalExpensesToday,
            totalSpentMonth = expensesViewModel.totalSpent,
            budgetLimit = expensesViewModel.limit,
            streak = profileViewModel.streak.value,
            taskTitles = taskTitles,
            taskPriorities = taskPriorities
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(background)
            .padding(bottom = innerPadding.calculateBottomPadding()),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // ── Hero Header ──────────────────────────────────────────────────
        item {
            HeroHeader(
                name        = profileViewModel.userName.value,
                streak      = profileViewModel.streak.value,
                isDark      = isDark
            )
        }

        // ── Quick Stats Row ─────────────────────────────────────────────
        item {
            QuickStatsRow(
                tasksPending  = tasksViewModel.pendingTasks.size,
                tasksTotal    = (tasksViewModel.pendingTasks + tasksViewModel.completedTasks).size,
                expensesTotal = expensesViewModel.totalExpensesToday,
                expensesLimit = expensesViewModel.limit
            )
        }

        // ── Section: Today's Priorities ─────────────────────────────────
        item {
            SectionHeader(
                title    = "Prioridades de Hoy",
                subtitle = "${tasksViewModel.pendingTasks.size} pendientes"
            )
        }

        if (tasksViewModel.pendingTasks.isEmpty()) {
            item { AllDoneCard() }
        } else {
            itemsIndexed(tasksViewModel.pendingTasks.take(4)) { idx, task ->
                AnimatedTaskCard(
                    task      = task,
                    index     = idx,
                    onToggle  = { tasksViewModel.toggleTaskDone(task) }
                )
            }
        }

        // ── Section: AI Coach Premium ───────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(8.dp))
            AICoachCard(onStartClick = { showAICoach = true })
        }

        // ── Section: Daily Quote ────────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(8.dp))
            DailyQuoteCard()
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    if (showAICoach) {
        AICoachBottomSheet(
            tasksViewModel = tasksViewModel,
            expensesViewModel = expensesViewModel,
            onDismiss = { showAICoach = false }
        )
    }
}

// ═══════════════════════════════════════════════════════════
//  HERO HEADER — Full-bleed gradient with user greeting
// ═══════════════════════════════════════════════════════════
@Composable
fun HeroHeader(name: String, streak: Int, isDark: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp)
    ) {
        // Background gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            VioletDark,
                            VioletPrimary,
                            VioletLight
                        )
                    )
                )
        )

        // Decorative circles (inspired by pattern-based UI libs)
        Box(
            modifier = Modifier
                .size(220.dp)
                .offset(x = 160.dp, y = (-40).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )
        Box(
            modifier = Modifier
                .size(140.dp)
                .offset(x = 200.dp, y = 80.dp)
                .clip(CircleShape)
                .background(TealAccent.copy(alpha = 0.15f))
        )

        // Bottom fade to background
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color.Transparent,
                            if (isDark) DarkBg else LightBg
                        )
                    )
                )
        )

        // Content
        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .statusBarsPadding()
                .padding(horizontal = 28.dp, vertical = 16.dp)
        ) {
            // Date chip
            val today = LocalDate.now()
            val fmt   = DateTimeFormatter.ofPattern("EEEE, d MMM", Locale("es", "ES"))
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color.White.copy(alpha = 0.15f)
            ) {
                Text(
                    text     = today.format(fmt).replaceFirstChar { it.uppercase() },
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color    = Color.White.copy(alpha = 0.9f),
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text       = "¡Hola, ${name.split(" ").first()}!",
                style      = MaterialTheme.typography.displayMedium,
                color      = Color.White
            )
            Text(
                text     = "Estás construyendo algo grandioso. 🚀",
                fontSize = 15.sp,
                color    = Color.White.copy(alpha = 0.75f),
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Streak badge
            if (streak > 0) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFF97316).copy(alpha = 0.2f))
                        .border(1.dp, Color(0xFFF97316).copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(
                        Icons.Default.LocalFireDepartment,
                        contentDescription = null,
                        tint   = Color(0xFFFBBF24),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "$streak días de racha",
                        fontSize   = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color      = Color(0xFFFBBF24)
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  QUICK STATS — Inspired by MPAndroidChart-style data cards
// ═══════════════════════════════════════════════════════════
@Composable
fun QuickStatsRow(
    tasksPending: Int,
    tasksTotal: Int,
    expensesTotal: Double,
    expensesLimit: Double
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        TasksStatCard(
            pending = tasksPending,
            total   = tasksTotal,
            modifier = Modifier.weight(1f)
        )
        ExpensesStatCard(
            spent   = expensesTotal,
            limit   = expensesLimit,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun TasksStatCard(pending: Int, total: Int, modifier: Modifier = Modifier) {
    val completed = (total - pending).coerceAtLeast(0)
    val progress  = if (total > 0) completed.toFloat() / total.toFloat() else 0f

    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(800, easing = FastOutSlowInEasing),
        label = "taskProgress"
    )
    val cardShape = MaterialTheme.shapes.large

    Surface(
        modifier  = modifier
            .shadow(6.dp, cardShape, spotColor = VioletPrimary.copy(alpha = 0.12f))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f), cardShape)
            .bounceClick { /* Interactividad sutil */ },
        shape     = cardShape,
        color     = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Brush.linearGradient(GradientViolet)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.CheckCircle, null, tint = Color.White, modifier = Modifier.size(20.dp))
                }
                Text(
                    text = "${(progress * 100).toInt()}%",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = VioletLight
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "$pending",
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "tareas pendientes",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress     = animatedProgress,
                modifier     = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color        = VioletPrimary,
                trackColor   = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
                strokeCap    = StrokeCap.Round
            )
        }
    }
}

@Composable
fun ExpensesStatCard(spent: Double, limit: Double, modifier: Modifier = Modifier) {
    val progress = (spent / limit).coerceIn(0.0, 1.0).toFloat()
    val isOver   = progress >= 0.9f
    val color    = if (isOver) ErrorRed else SuccessGreen
    val cardShape = MaterialTheme.shapes.large

    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(800, easing = FastOutSlowInEasing),
        label = "expProgress"
    )

    Surface(
        modifier  = modifier
            .shadow(6.dp, cardShape, spotColor = color.copy(alpha = 0.12f))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f), cardShape)
            .bounceClick { /* Interactividad sutil */ },
        shape     = cardShape,
        color     = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Brush.linearGradient(GradientGreen)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.AccountBalanceWallet, null, tint = Color.White, modifier = Modifier.size(20.dp))
                }
                if (isOver) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = ErrorRed.copy(alpha = 0.12f)
                    ) {
                        Text(
                            "¡Límite!",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ErrorRed,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "$${String.format("%.0f", spent)}",
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "de $${limit.toInt()} gastados",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress   = animatedProgress,
                modifier   = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color      = color,
                trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
                strokeCap  = StrokeCap.Round
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION HEADER
// ═══════════════════════════════════════════════════════════
@Composable
fun SectionHeader(title: String, subtitle: String? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            if (!subtitle.isNullOrEmpty()) {
                Text(
                    text = subtitle,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        // Gradient accent bar
        Box(
            modifier = Modifier
                .size(width = 4.dp, height = 36.dp)
                .clip(CircleShape)
                .background(Brush.verticalGradient(GradientViolet))
        )
    }
}

// ═══════════════════════════════════════════════════════════
//  ANIMATED TASK CARD — Inspired by RecyclerView Animators
// ═══════════════════════════════════════════════════════════
@Composable
fun AnimatedTaskCard(task: Task, index: Int, onToggle: () -> Unit) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    AnimatedVisibility(
        visible = visible,
        enter   = slideInVertically(
            animationSpec = tween(400, delayMillis = index * 80, easing = FastOutSlowInEasing)
        ) { it / 2 } + fadeIn(tween(400, delayMillis = index * 80))
    ) {
        val isDone = task.isDone == true
        val cardShape = MaterialTheme.shapes.medium // Standardized 12.dp

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 5.dp)
                .shadow(
                    elevation    = if (isDone) 1.dp else 4.dp,
                    shape        = cardShape,
                    spotColor    = VioletPrimary.copy(alpha = 0.08f)
                )
                .border(
                    width = 1.dp,
                    color = if (isDone) Color.Transparent else MaterialTheme.colorScheme.outline.copy(alpha = 0.1f),
                    shape = cardShape
                )
                .bounceClick { onToggle() },
            shape = cardShape,
            color = if (isDone)
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
            else
                MaterialTheme.colorScheme.surface
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Priority color strip + checkbox
                val priorityColor = task.priority.getColor()

                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(
                            if (isDone) Brush.linearGradient(GradientViolet)
                            else Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                        )
                        .border(
                            width = 2.dp,
                            brush = if (isDone)
                                Brush.linearGradient(GradientViolet)
                            else
                                Brush.linearGradient(listOf(priorityColor.copy(alpha = 0.8f), priorityColor.copy(alpha = 0.8f))),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isDone) {
                        Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(14.dp))
                    }
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = if (isDone)
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        else
                            MaterialTheme.colorScheme.onSurface,
                        textDecoration = if (isDone) TextDecoration.LineThrough else null,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (!task.project.isNullOrEmpty()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(priorityColor)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = task.project!!,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // Priority badge
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = priorityColor.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = task.priority.label,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = priorityColor,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  ALL DONE CARD
// ═══════════════════════════════════════════════════════════
@Composable
fun AllDoneCard() {
    val cardShape = MaterialTheme.shapes.large
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .shadow(4.dp, cardShape, spotColor = SuccessGreen.copy(alpha = 0.12f))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f), cardShape),
        shape = cardShape,
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(GradientGreen)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.DoneAll, null, tint = Color.White, modifier = Modifier.size(26.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text("¡Todo al día! 🎉", style = MaterialTheme.typography.titleMedium, color = SuccessGreen)
                Text(
                    "No tienes tareas pendientes hoy",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  DAILY QUOTE CARD — Premium inspirational banner
// ═══════════════════════════════════════════════════════════
@Composable
fun DailyQuoteCard() {
    val quotes = listOf(
        "\"El progreso siempre es mejor que la perfección.\"",
        "\"Un día a la vez, un paso a la vez.\"",
        "\"Cada tarea completada es una victoria.\"",
        "\"Tu futuro es creado por lo que haces hoy.\""
    )
    val quote = remember { quotes.random() }
    val cardShape = MaterialTheme.shapes.large

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(cardShape)
            .background(Brush.linearGradient(listOf(Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF14B8A6))))
            .padding(24.dp)
    ) {
        // Decorative circle
        Box(
            modifier = Modifier
                .size(120.dp)
                .offset(x = 200.dp, y = (-40).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )

        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.FormatQuote,
                    null,
                    tint = Color.White.copy(alpha = 0.7f),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Frase del día",
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.7f),
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.sp
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = quote,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                lineHeight = 24.sp
            )
        }
    }
}


