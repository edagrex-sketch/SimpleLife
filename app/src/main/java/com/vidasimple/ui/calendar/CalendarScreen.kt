package com.vidasimple.ui.calendar

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.CalendarEvent
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(
    innerPadding: PaddingValues,
    viewModel: CalendarViewModel = viewModel(),
    spacesViewModel: com.vidasimple.ui.spaces.SpacesViewModel = viewModel()
) {
    val selectedDate by viewModel.selectedDate
    val currentMonth by viewModel.currentMonth
    val events = viewModel.events
    val isLoading = viewModel.isLoading

    val context = LocalContext.current
    var showAddDialog by remember { mutableStateOf(false) }
    var showSpaceDialog by remember { mutableStateOf(false) }
    var showDeleteSpaceDialog by remember { mutableStateOf(false) }

    // Init Spaces
    LaunchedEffect(Unit) {
        spacesViewModel.initialize()
    }

    // Sync active space
    val currentSpaceId = spacesViewModel.selectedSpaceId
    LaunchedEffect(currentSpaceId) {
        viewModel.selectSpace(currentSpaceId)
    }

    val background = MaterialTheme.colorScheme.background
    val isDark = background == DarkBg

    Scaffold(
        containerColor = background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = VioletPrimary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .padding(bottom = innerPadding.calculateBottomPadding() + 16.dp)
                    .shadow(12.dp, CircleShape, spotColor = VioletPrimary.copy(alpha = 0.4f))
            ) {
                Icon(Icons.Default.Add, contentDescription = "Agregar Evento", modifier = Modifier.size(24.dp))
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = innerPadding.calculateBottomPadding() + 80.dp)
        ) {
            // Header
            item {
                CalendarHeader(currentMonth = currentMonth, isDark = isDark)
            }

            // Collaborative Spaces Bar
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

            // Month Navigator
            item {
                MonthNavigator(
                    currentMonth = currentMonth,
                    onPrevious = { viewModel.previousMonth() },
                    onNext = { viewModel.nextMonth() }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Days of Week Row
            item {
                DaysOfWeekRow()
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Calendar Grid
            item {
                PremiumCalendarGrid(
                    currentMonth = currentMonth,
                    selectedDate = selectedDate,
                    events = events,
                    onDateSelect = { viewModel.selectDate(it) }
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Selected Day Card info
            item {
                SelectedDayCard(selectedDate = selectedDate)
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Events List for selected day
            val dayEvents = events.filter { it.eventDate == selectedDate.toString() }
            if (dayEvents.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp),
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    ) {
                        Row(
                            modifier = Modifier.padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.EventNote,
                                null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                "Sin eventos programados para este día",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            } else {
                items(dayEvents, key = { it.id ?: "" }) { event ->
                    EventCard(
                        event = event,
                        onDeleteClick = { viewModel.deleteEvent(event.id ?: "") }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }

    // Space Management dialog
    if (showSpaceDialog) {
        com.vidasimple.ui.spaces.CreateSpaceDialog(
            onDismiss = { showSpaceDialog = false },
            onCreate = { name -> spacesViewModel.createSpace(name) },
            onJoin = { code -> spacesViewModel.joinSpace(code) },
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

    // Add Event Dialog
    if (showAddDialog) {
        AddEventDialog(
            selectedDate = selectedDate,
            onDismiss = { showAddDialog = false },
            onSave = { title, desc, startTime, endTime, category, color ->
                viewModel.addEvent(
                    title = title,
                    description = desc,
                    date = selectedDate,
                    startTime = startTime,
                    endTime = endTime,
                    category = category,
                    color = color
                )
                showAddDialog = false
            }
        )
    }
}

@Composable
fun CalendarHeader(currentMonth: YearMonth, isDark: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(listOf(Color(0xFF0891B2), Color(0xFF06B6D4), Color(0xFF7C3AED))))
        )

        // Decorative circle
        Box(
            modifier = Modifier
                .size(160.dp)
                .offset(x = 220.dp, y = (-30).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.06f))
        )

        // Bottom fade
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, if (isDark) DarkBg else LightBg)))
        )

        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .statusBarsPadding()
                .padding(horizontal = 28.dp)
        ) {
            Text(
                "Calendario",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
            Text(
                "Organiza tu vida y tus espacios compartidos",
                fontSize = 13.sp,
                color = Color.White.copy(alpha = 0.8f),
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun MonthNavigator(
    currentMonth: YearMonth,
    onPrevious: () -> Unit,
    onNext: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = TealAccent.copy(alpha = 0.1f)),
        shape    = RoundedCornerShape(20.dp),
        color    = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically
        ) {
            IconButton(onClick = onPrevious) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(TealAccent.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ChevronLeft, null, tint = TealAccent, modifier = Modifier.size(20.dp))
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    currentMonth.month.getDisplayName(TextStyle.FULL, Locale("es", "ES"))
                        .replaceFirstChar { it.uppercase() },
                    fontSize   = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color      = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    currentMonth.year.toString(),
                    fontSize = 13.sp,
                    color    = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }

            IconButton(onClick = onNext) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(TealAccent.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ChevronRight, null, tint = TealAccent, modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@Composable
fun DaysOfWeekRow() {
    val days = listOf("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom")
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        days.forEachIndexed { index, day ->
            val isWeekend = index >= 5
            Text(
                text       = day,
                modifier   = Modifier.weight(1f),
                textAlign  = TextAlign.Center,
                fontSize   = 12.sp,
                fontWeight = FontWeight.Bold,
                color      = if (isWeekend)
                    TealAccent.copy(alpha = 0.8f)
                else
                    MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PremiumCalendarGrid(
    currentMonth: YearMonth,
    selectedDate: LocalDate,
    events: List<CalendarEvent>,
    onDateSelect: (LocalDate) -> Unit
) {
    val daysInMonth     = currentMonth.lengthOfMonth()
    val firstDayOfMonth = currentMonth.atDay(1).dayOfWeek.value // 1=Mon, 7=Sun
    val daysList = mutableListOf<Int?>()

    for (i in 1 until firstDayOfMonth) daysList.add(null)
    for (i in 1..daysInMonth) daysList.add(i)

    LazyVerticalGrid(
        columns  = GridCells.Fixed(7),
        modifier = Modifier.padding(horizontal = 16.dp),
        verticalArrangement   = Arrangement.spacedBy(6.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        userScrollEnabled     = false
    ) {
        items(daysList) { day ->
            if (day != null) {
                val date       = currentMonth.atDay(day)
                val isSelected = date == selectedDate
                val isToday    = date == LocalDate.now()
                val isWeekend  = date.dayOfWeek.value >= 6

                val scale by animateFloatAsState(
                    targetValue = if (isSelected) 1.1f else 1f,
                    animationSpec = spring(dampingRatio = 0.5f, stiffness = Spring.StiffnessMediumLow),
                    label = "dayScale"
                )

                val dayEvents = events.filter { it.eventDate == date.toString() }
                val hasEvents = dayEvents.isNotEmpty()

                Box(
                    modifier = Modifier
                        .aspectRatio(1f)
                        .scale(scale)
                        .clip(CircleShape)
                        .background(
                            when {
                                isSelected -> Brush.linearGradient(GradientViolet)
                                isToday    -> Brush.linearGradient(listOf(TealAccent.copy(alpha = 0.15f), TealAccent.copy(alpha = 0.15f)))
                                else       -> Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                            }
                        )
                        .clickable { onDateSelect(date) },
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text  = day.toString(),
                            fontSize = 14.sp,
                            fontWeight = when {
                                isSelected -> FontWeight.Black
                                isToday    -> FontWeight.Bold
                                else       -> FontWeight.Medium
                            },
                            color = when {
                                isSelected -> Color.White
                                isToday    -> TealAccent
                                isWeekend  -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                else       -> MaterialTheme.colorScheme.onSurface
                            }
                        )

                        // Colored dots below date number if it has events
                        if (hasEvents) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(2.dp),
                                modifier = Modifier.padding(top = 2.dp)
                            ) {
                                dayEvents.take(3).forEach { ev ->
                                    val dotColor = when (ev.color) {
                                        "teal" -> Color(0xFF0D9488)
                                        "violet" -> Color(0xFF7C3AED)
                                        "orange" -> Color(0xFFEA580C)
                                        "blue" -> Color(0xFF2563EB)
                                        "green" -> Color(0xFF16A34A)
                                        else -> VioletPrimary
                                    }
                                    Box(
                                        modifier = Modifier
                                            .size(5.dp)
                                            .clip(CircleShape)
                                            .background(if (isSelected) Color.White else dotColor)
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                Box(modifier = Modifier.aspectRatio(1f))
            }
        }
    }
}

@Composable
fun SelectedDayCard(selectedDate: LocalDate) {
    val dayName = selectedDate.dayOfWeek.getDisplayName(TextStyle.FULL, Locale("es", "ES"))
        .replaceFirstChar { it.uppercase() }
    val monthName = selectedDate.month.getDisplayName(TextStyle.FULL, Locale("es", "ES"))
        .replaceFirstChar { it.uppercase() }
    val isToday = selectedDate == LocalDate.now()

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .shadow(8.dp, RoundedCornerShape(24.dp), spotColor = VioletPrimary.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Day number
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        if (isToday) Brush.linearGradient(GradientViolet)
                        else Brush.linearGradient(listOf(TealAccent.copy(alpha = 0.15f), TealAccent.copy(alpha = 0.15f)))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    selectedDate.dayOfMonth.toString(),
                    fontSize   = 24.sp,
                    fontWeight = FontWeight.Black,
                    color      = if (isToday) Color.White else TealAccent
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "$dayName, ${selectedDate.dayOfMonth} de $monthName",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    selectedDate.year.toString(),
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (isToday) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = VioletPrimary.copy(alpha = 0.1f)
                ) {
                    Text(
                        "Hoy",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = VioletPrimary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EventCard(
    event: CalendarEvent,
    onDeleteClick: () -> Unit
) {
    val barColor = when (event.color) {
        "teal" -> Color(0xFF0D9488)
        "violet" -> Color(0xFF7C3AED)
        "orange" -> Color(0xFFEA580C)
        "blue" -> Color(0xFF2563EB)
        "green" -> Color(0xFF16A34A)
        else -> VioletPrimary
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .shadow(4.dp, RoundedCornerShape(20.dp), spotColor = barColor.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min)
        ) {
            // Category color bar
            Box(
                modifier = Modifier
                    .width(6.dp)
                    .fillMaxHeight()
                    .background(barColor)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = event.title,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = barColor.copy(alpha = 0.1f)
                        ) {
                            Text(
                                text = event.category ?: "General",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = barColor,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    if (!event.description.isNullOrBlank()) {
                        Text(
                            text = event.description,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            Icons.Default.AccessTime,
                            null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            modifier = Modifier.size(14.dp)
                        )
                        val timeStr = if (!event.startTime.isNullOrBlank()) {
                            if (!event.endTime.isNullOrBlank()) "${event.startTime} - ${event.endTime}" else event.startTime
                        } else {
                            "Todo el día"
                        }
                        Text(
                            text = timeStr,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                IconButton(
                    onClick = onDeleteClick,
                    colors = IconButtonDefaults.iconButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Eliminar Evento", modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEventDialog(
    selectedDate: LocalDate,
    onDismiss: () -> Unit,
    onSave: (String, String, String?, String?, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var startTime by remember { mutableStateOf("") }
    var endTime by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("General") }
    var color by remember { mutableStateOf("primary") }

    val categories = listOf("General", "Trabajo", "Hogar", "Personal", "Reunión", "Salud", "Cumpleaños")
    val colors = listOf("primary" to VioletPrimary, "teal" to Color(0xFF0D9488), "violet" to Color(0xFF7C3AED), "orange" to Color(0xFFEA580C), "blue" to Color(0xFF2563EB), "green" to Color(0xFF16A34A))

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(24.dp, RoundedCornerShape(28.dp), spotColor = VioletPrimary.copy(alpha = 0.25f))
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Nuevo Evento 📅",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Título") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VioletPrimary, focusedLabelColor = VioletPrimary)
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    label = { Text("Descripción (opcional)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VioletPrimary, focusedLabelColor = VioletPrimary)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Time Pickers
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = startTime,
                        onValueChange = { startTime = it },
                        label = { Text("Inicio (HH:MM)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VioletPrimary, focusedLabelColor = VioletPrimary)
                    )
                    OutlinedTextField(
                        value = endTime,
                        onValueChange = { endTime = it },
                        label = { Text("Fin (HH:MM)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = VioletPrimary, focusedLabelColor = VioletPrimary)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Category Chips
                Text("Categoría", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(90.dp)
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(categories) { cat ->
                        val isSelected = category == cat
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { category = cat },
                            color = if (isSelected) VioletPrimary else MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = cat,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier
                                    .padding(vertical = 8.dp)
                                    .fillMaxWidth(),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Color picker
                Text("Color", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    colors.forEach { (colorName, colorVal) ->
                        val isSelected = color == colorName
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(colorVal)
                                .clickable { color = colorName }
                                .border(
                                    width = if (isSelected) 3.dp else 0.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                                    shape = CircleShape
                                )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).height(50.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Cancelar", fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                onSave(
                                    title,
                                    desc,
                                    startTime.ifBlank { null },
                                    endTime.ifBlank { null },
                                    category,
                                    color
                                )
                            }
                        },
                        modifier = Modifier.weight(1f).height(50.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = VioletPrimary)
                    ) {
                        Text("Guardar", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}
