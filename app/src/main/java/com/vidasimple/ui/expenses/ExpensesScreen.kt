package com.vidasimple.ui.expenses

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.Expense
import com.vidasimple.data.supabase.SupabaseManager
import io.github.jan.supabase.gotrue.auth
import kotlin.math.absoluteValue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpensesScreen(
    innerPadding: PaddingValues,
    viewModel: ExpensesViewModel = viewModel(),
    spacesViewModel: com.vidasimple.ui.spaces.SpacesViewModel = viewModel()
) {
    var showAddBottomSheet by remember { mutableStateOf(false) }
    var showEditLimitDialog by remember { mutableStateOf(false) }
    var showSpaceDialog    by remember { mutableStateOf(false) }
    var showDeleteSpaceDialog by remember { mutableStateOf(false) }
    val context = androidx.compose.ui.platform.LocalContext.current

    // Initialize spaces once, after auth is ready
    LaunchedEffect(Unit) { spacesViewModel.initialize() }

    // Sync ExpensesViewModel with selected space
    val currentSpaceId = spacesViewModel.selectedSpaceId
    LaunchedEffect(currentSpaceId) { viewModel.selectSpace(currentSpaceId) }

    // Toast feedback
    LaunchedEffect(spacesViewModel.message) {
        spacesViewModel.message?.let { msg ->
            android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_SHORT).show()
            spacesViewModel.clearMessage()
        }
    }

    val background = MaterialTheme.colorScheme.background
    val isDark     = background == DarkBg

    Scaffold(
        containerColor = background,
        floatingActionButton = {
            Box(
                modifier = Modifier
                    .padding(bottom = innerPadding.calculateBottomPadding() + 16.dp)
                    .shadow(16.dp, RoundedCornerShape(20.dp), spotColor = SuccessGreen.copy(alpha = 0.4f))
                    .clip(RoundedCornerShape(20.dp))
                    .background(Brush.linearGradient(GradientGreen))
                    .clickable { showAddBottomSheet = true }
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Add, null, tint = Color.White, modifier = Modifier.size(22.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Registrar Gasto", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(bottom = innerPadding.calculateBottomPadding() + 100.dp)
        ) {
            // ── Hero Header ───────────────────────────────────────────────
            item {
                ExpensesHeroHeader(
                    totalSpent  = viewModel.totalSpent,
                    limit       = viewModel.limit,
                    isDark      = isDark,
                    onEditClick = { showEditLimitDialog = true }
                )
            }

            // ── Month Selector ────────────────────────────────────────────
            item {
                MonthSelector(
                    selectedMonth = viewModel.selectedMonth.value,
                    onMonthSelected = { viewModel.selectMonth(it) }
                )
            }

            // ── Donut Chart ───────────────────────────────────────────────
            if (viewModel.expenses.isNotEmpty()) {
                item {
                    InteractiveDonutChart(expenses = viewModel.expenses)
                }
            }

            // ── Space Selector ────────────────────────────────────────────
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

            // ── Collaborative debt splitter ───────────────────────────────
            if (spacesViewModel.selectedSpaceId != null && spacesViewModel.activeMembers.isNotEmpty()) {
                item {
                    CollaborativeSplitter(
                        expenses = viewModel.expenses,
                        members = spacesViewModel.activeMembers,
                        onSettleDebt = { debtor, creditor, amount ->
                            viewModel.addExpense(
                                title = "Saldar a ${creditor.name ?: creditor.email}",
                                amount = amount,
                                category = "Otros",
                                creatorId = debtor.id
                            )
                            android.widget.Toast.makeText(context, "Liquidación registrada", android.widget.Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }

            // ── Intelligent Savings Goals ─────────────────────────────────
            item {
                SavingsGoalCard(
                    limit = viewModel.limit,
                    totalSpent = viewModel.totalSpent,
                    savingsGoal = viewModel.savingsGoal,
                    onGoalChange = { viewModel.updateSavingsGoal(it) }
                )
            }

            // ── Category Breakdown ────────────────────────────────────────
            item {
                CategoryBreakdown(expenses = viewModel.expenses)
            }

            // ── Recent Activity ───────────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Actividad Reciente",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        "${viewModel.expenses.size} registros",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            if (viewModel.expenses.isEmpty()) {
                item { EmptyExpensesCard() }
            } else {
                itemsIndexed(
                    items = viewModel.expenses,
                    key   = { _, e -> e.id ?: e.title }
                ) { index, expense ->
                    AnimatedExpenseItem(expense = expense, index = index)
                }
            }
        }

        // ── Dialogs ───────────────────────────────────────────────────────
        if (showAddBottomSheet) {
            PremiumExpenseBottomSheet(
                onDismiss = { showAddBottomSheet = false },
                onConfirm = { title, amount, category ->
                    viewModel.addExpense(title, amount, category)
                    showAddBottomSheet = false
                }
            )
        }

        if (showEditLimitDialog) {
            PremiumEditLimitDialog(
                currentLimit = viewModel.limit,
                onDismiss    = { showEditLimitDialog = false },
                onConfirm    = { newLimit ->
                    viewModel.updateLimit(newLimit)
                    showEditLimitDialog = false
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
//  HERO HEADER — Financial dashboard
// ═══════════════════════════════════════════════════════════
@Composable
fun ExpensesHeroHeader(
    totalSpent: Double,
    limit: Double,
    isDark: Boolean,
    onEditClick: () -> Unit
) {
    val progress  = (totalSpent / limit).coerceIn(0.0, 1.0).toFloat()
    val isWarning = progress >= 0.75f
    val isDanger  = progress >= 0.90f

    val progressColor = when {
        isDanger  -> ErrorRed
        isWarning -> AlertAmber
        else      -> SuccessGreen
    }

    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(1000, easing = FastOutSlowInEasing),
        label = "expHeroProgress"
    )

    Box(modifier = Modifier.fillMaxWidth()) {
        // Gradient background
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF059669), Color(0xFF10B981), Color(0xFF06B6D4))
                    )
                )
        )

        // Decorative shapes
        Box(
            modifier = Modifier
                .size(200.dp)
                .offset(x = (-40).dp, y = (-40).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )
        Box(
            modifier = Modifier
                .size(120.dp)
                .offset(x = 260.dp, y = 80.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.08f))
        )

        // Bottom fade
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(listOf(Color.Transparent, if (isDark) DarkBg else LightBg))
                )
        )

        // Content
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(28.dp)
        ) {
            // Header label
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AccountBalanceWallet, null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Balance Mensual", fontSize = 14.sp, color = Color.White.copy(alpha = 0.8f), fontWeight = FontWeight.SemiBold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Amount display
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = "$${String.format("%.2f", totalSpent)}",
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = (-1).sp
                )
                Text(
                    text = " / $${limit.toInt()}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 6.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White.copy(alpha = 0.15f),
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onEditClick() }
                ) {
                    Icon(
                        Icons.Default.Edit,
                        null,
                        tint = Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.padding(6.dp).size(14.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Progress bar
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "${(progress * 100).toInt()}% del presupuesto",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Medium
                    )
                    if (isDanger) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = ErrorRed.copy(alpha = 0.25f)
                        ) {
                            Text(
                                "⚠ Límite cercano",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Segmented progress bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(10.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.2f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(animatedProgress)
                            .height(10.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color.White, progressColor.copy(alpha = 0.9f))
                                )
                            )
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  MONTH SELECTOR SLIDER
// ═══════════════════════════════════════════════════════════
@Composable
fun MonthSelector(
    selectedMonth: Int,
    onMonthSelected: (Int) -> Unit
) {
    val months = listOf(
        "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        androidx.compose.foundation.lazy.LazyRow(
            contentPadding = PaddingValues(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            itemsIndexed(months) { index, name ->
                val monthNumber = index + 1
                val isSelected = selectedMonth == monthNumber

                val scale by animateFloatAsState(
                    targetValue = if (isSelected) 1.05f else 0.95f,
                    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
                    label = "monthScale"
                )

                Surface(
                    modifier = Modifier
                        .scale(scale)
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { onMonthSelected(monthNumber) },
                    shape = RoundedCornerShape(14.dp),
                    color = if (isSelected) SuccessGreen else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    border = if (isSelected) null else androidx.compose.foundation.BorderStroke(
                        1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f)
                    )
                ) {
                    Text(
                        text = name,
                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  INTERACTIVE DONUT CHART
// ═══════════════════════════════════════════════════════════
@Composable
fun InteractiveDonutChart(
    expenses: List<Expense>,
    modifier: Modifier = Modifier
) {
    if (expenses.isEmpty()) return

    val byCategory = expenses.groupBy { it.category ?: "Otros" }
        .map { (cat, list) -> cat to list.sumOf { it.amount } }
        .sortedByDescending { it.second }

    val total = byCategory.sumOf { it.second }
    if (total <= 0) return

    var activeIndex by remember { mutableStateOf(-1) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.foundation.Canvas(
            modifier = Modifier
                .size(200.dp)
                .clickable(
                    interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                    indication = null
                ) {
                    activeIndex = (activeIndex + 2) % (byCategory.size + 1) - 1
                }
        ) {
            val width = size.width
            val height = size.height
            val strokeWidth = 36.dp.toPx()
            val radius = (minOf(width, height) - strokeWidth) / 2

            var startAngle = -90f
            byCategory.forEachIndexed { index, (cat, amt) ->
                val sweepAngle = ((amt / total) * 360f).toFloat()
                val isSelected = index == activeIndex
                val color = getCategoryInfo(cat).color

                val animatedStroke = if (isSelected) strokeWidth * 1.25f else strokeWidth
                val animatedRadius = if (isSelected) radius * 1.05f else radius

                drawArc(
                    color = color,
                    startAngle = startAngle,
                    sweepAngle = sweepAngle,
                    useCenter = false,
                    topLeft = Offset(
                        (width - animatedRadius * 2) / 2,
                        (height - animatedRadius * 2) / 2
                    ),
                    size = Size(animatedRadius * 2, animatedRadius * 2),
                    style = Stroke(
                        width = animatedStroke,
                        cap = StrokeCap.Round
                    )
                )
                startAngle += sweepAngle
            }
        }

        // Inside details text
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (activeIndex == -1 || activeIndex >= byCategory.size) {
                Text(
                    "Total Mes",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "$${String.format("%.2f", total)}",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurface
                )
            } else {
                val (cat, amt) = byCategory[activeIndex]
                val pct = (amt / total) * 100
                Text(
                    cat,
                    fontSize = 13.sp,
                    color = getCategoryInfo(cat).color,
                    fontWeight = FontWeight.Black
                )
                Text(
                    "$${String.format("%.0f", amt)}",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    "${String.format("%.1f", pct)}%",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  COLLABORATIVE DEBT SPLITTER (CUENTAS CLARAS)
// ═══════════════════════════════════════════════════════════
@Composable
fun CollaborativeSplitter(
    expenses: List<Expense>,
    members: List<com.vidasimple.domain.model.Profile>,
    onSettleDebt: (debtor: com.vidasimple.domain.model.Profile, creditor: com.vidasimple.domain.model.Profile, amount: Double) -> Unit
) {
    if (members.isEmpty()) return

    val total = expenses.sumOf { it.amount }
    val n = members.size
    val fairShare = total / n

    val creditors = members.map { m ->
        val paid = expenses.filter { it.userId == m.id }.sumOf { it.amount }
        m to (paid - fairShare)
    }.filter { it.second > 0.05 }
     .sortedByDescending { it.second }

    val debtors = members.map { m ->
        val paid = expenses.filter { it.userId == m.id }.sumOf { it.amount }
        m to (paid - fairShare)
    }.filter { it.second < -0.05 }
     .sortedBy { it.second }

    val transactions = remember(expenses, members) {
        val creditorBalances = creditors.map { it.second }.toMutableList()
        val debtorBalances = debtors.map { it.second.coerceAtMost(0.0) * -1.0 }.toMutableList()
        val list = mutableListOf<Triple<com.vidasimple.domain.model.Profile, com.vidasimple.domain.model.Profile, Double>>()

        var cIdx = 0
        var dIdx = 0
        while (cIdx < creditors.size && dIdx < debtors.size) {
            val creditor = creditors[cIdx].first
            val debtor = debtors[dIdx].first
            val cAmt = creditorBalances[cIdx]
            val dAmt = debtorBalances[dIdx]

            val minAmt = minOf(cAmt, dAmt)
            if (minAmt > 0.05) {
                list.add(Triple(debtor, creditor, minAmt))
            }

            creditorBalances[cIdx] -= minAmt
            debtorBalances[dIdx] -= minAmt

            if (creditorBalances[cIdx] < 0.05) cIdx++
            if (debtorBalances[dIdx] < 0.05) dIdx++
        }
        list
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 10.dp)
            .shadow(6.dp, RoundedCornerShape(24.dp), spotColor = Color(0xFF6366F1).copy(alpha = 0.2f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CompareArrows,
                        null,
                        tint = Color(0xFF6366F1),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Cuentas Claras ⚖",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF6366F1).copy(alpha = 0.12f)
                ) {
                    Text(
                        "Cuota justa: $${String.format("%.2f", fairShare)}/u",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF6366F1),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Contributions Row
            Text(
                "Aportes de cada miembro",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            members.forEach { m ->
                val paid = expenses.filter { it.userId == m.id }.sumOf { it.amount }
                val initial = (m.name ?: m.email ?: "?").firstOrNull()?.toString()?.uppercase() ?: "?"

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF6366F1).copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(initial, fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color(0xFF6366F1))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(m.name ?: m.email ?: "Miembro", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                    }
                    Text(
                        "$${String.format("%.2f", paid)}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "Saldos Cruzados",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (transactions.isEmpty()) {
                Text(
                    "🎉 ¡Todo saldado! Nadie le debe a nadie.",
                    fontSize = 13.sp,
                    color = SuccessGreen,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            } else {
                transactions.forEach { (debtor, creditor, amount) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "${debtor.name ?: "Alguien"} debe pagarle a",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = creditor.name ?: "Alguien",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "$${String.format("%.2f", amount)}",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                color = ErrorRed,
                                modifier = Modifier.padding(end = 12.dp)
                            )
                            Box(
                                modifier = Modifier
                                    .shadow(2.dp, RoundedCornerShape(10.dp))
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF4F46E5))))
                                    .clickable { onSettleDebt(debtor, creditor, amount) }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text("Saldar", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SAVINGS GOAL CARD
// ═══════════════════════════════════════════════════════════
@Composable
fun SavingsGoalCard(
    limit: Double,
    totalSpent: Double,
    savingsGoal: Double,
    onGoalChange: (Double) -> Unit
) {
    var showEditGoalDialog by remember { mutableStateOf(false) }

    val remainingBudget = limit - savingsGoal - totalSpent
    val currentDay = java.time.LocalDate.now().dayOfMonth
    val totalDays = java.time.LocalDate.now().lengthOfMonth()
    val remainingDays = (totalDays - currentDay + 1).coerceAtLeast(1)
    val dailyBudget = remainingBudget / remainingDays

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 10.dp)
            .shadow(6.dp, RoundedCornerShape(24.dp), spotColor = SuccessGreen.copy(alpha = 0.2f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.TrackChanges,
                        null,
                        tint = SuccessGreen,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Meta de Ahorro 🎯",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = SuccessGreen.copy(alpha = 0.12f),
                    modifier = Modifier.clickable { showEditGoalDialog = true }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Edit, null, tint = SuccessGreen, modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "Meta: $${savingsGoal.toInt()}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SuccessGreen
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (remainingBudget >= 0) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(SuccessGreen.copy(alpha = 0.08f))
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Savings, null, tint = SuccessGreen, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            "Presupuesto diario sugerido",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SuccessGreen
                        )
                        Text(
                            "$${String.format("%.2f", dailyBudget)}/día",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            "Quedan $remainingDays días en este mes para asegurar tu ahorro.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(ErrorRed.copy(alpha = 0.08f))
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.TrendingDown, null, tint = ErrorRed, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            "Límite diario excedido ⚠",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ErrorRed
                        )
                        Text(
                            "Excediste el plan por $${String.format("%.2f", remainingBudget * -1.0)}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            "Reduce gastos no esenciales el resto del mes.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }

    if (showEditGoalDialog) {
        var goalText by remember { mutableStateOf(savingsGoal.toInt().toString()) }
        Dialog(onDismissRequest = { showEditGoalDialog = false }) {
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = MaterialTheme.colorScheme.surface,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(16.dp, RoundedCornerShape(28.dp))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "Ajustar Ahorro Planificado",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = goalText,
                        onValueChange = { if (it.isEmpty() || it.toDoubleOrNull() != null) goalText = it },
                        label = { Text("Meta de Ahorro") },
                        prefix = { Text("$", fontWeight = FontWeight.Bold) },
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = SuccessGreen,
                            focusedLabelColor = SuccessGreen
                        ),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { showEditGoalDialog = false },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancelar")
                        }
                        Button(
                            onClick = {
                                onGoalChange(goalText.toDoubleOrNull() ?: 100.0)
                                showEditGoalDialog = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Guardar", color = Color.White)
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  CATEGORY BREAKDOWN CHIPS
// ═══════════════════════════════════════════════════════════
@Composable
fun CategoryBreakdown(expenses: List<Expense>) {
    if (expenses.isEmpty()) return

    val byCategory = expenses.groupBy { it.category ?: "Otros" }
        .map { (cat, list) -> cat to list.sumOf { it.amount } }
        .sortedByDescending { it.second }
        .take(4)

    Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Text(
            "Por categoría",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(vertical = 12.dp)
        )

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            byCategory.forEach { (category, amount) ->
                val info = getCategoryInfo(category)
                Surface(
                    modifier = Modifier
                        .shadow(4.dp, RoundedCornerShape(18.dp), spotColor = info.color.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(info.color.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(info.icon, null, tint = info.color, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "$${String.format("%.0f", amount)}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            category,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  ANIMATED EXPENSE ITEM
// ═══════════════════════════════════════════════════════════
@Composable
fun AnimatedExpenseItem(expense: Expense, index: Int) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    AnimatedVisibility(
        visible = visible,
        enter   = slideInHorizontally(tween(350, delayMillis = index * 50)) { it / 3 }
                + fadeIn(tween(350, delayMillis = index * 50))
    ) {
        val categoryInfo = getCategoryInfo(expense.category ?: "Otros")

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 5.dp)
                .shadow(4.dp, RoundedCornerShape(20.dp), spotColor = categoryInfo.color.copy(alpha = 0.1f)),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(50.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(categoryInfo.color.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        categoryInfo.icon,
                        null,
                        tint     = categoryInfo.color,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        expense.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = categoryInfo.color.copy(alpha = 0.1f)
                    ) {
                        Text(
                            expense.category ?: "Otros",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = categoryInfo.color,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "-$${String.format("%.2f", expense.amount)}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════
@Composable
fun EmptyExpensesCard() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 60.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(90.dp)
                .clip(CircleShape)
                .background(SuccessGreen.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Default.AccountBalanceWallet,
                null,
                modifier = Modifier.size(44.dp),
                tint = SuccessGreen.copy(alpha = 0.5f)
            )
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(
            "Sin gastos aún",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            "Toca el botón verde para añadir",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 6.dp, start = 40.dp, end = 40.dp)
        )
    }
}

// ═══════════════════════════════════════════════════════════
//  EDIT LIMIT DIALOG — Premium redesign
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumEditLimitDialog(currentLimit: Double, onDismiss: () -> Unit, onConfirm: (Double) -> Unit) {
    var limitText by remember { mutableStateOf(currentLimit.toInt().toString()) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(20.dp, RoundedCornerShape(32.dp), spotColor = SuccessGreen.copy(alpha = 0.2f))
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientGreen)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.TrendingUp, null, tint = Color.White, modifier = Modifier.size(32.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "Ajustar Presupuesto",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    "Define tu límite mensual de gastos",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp),
                    textAlign = TextAlign.Center
                )

                OutlinedTextField(
                    value = limitText,
                    onValueChange = { if (it.isEmpty() || it.toDoubleOrNull() != null) limitText = it },
                    label = { Text("Límite Mensual") },
                    prefix = { Text("$", fontWeight = FontWeight.Bold) },
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor   = SuccessGreen,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                        focusedLabelColor    = SuccessGreen
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurfaceVariant),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    ) {
                        Text("Cancelar", fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val newLimit = limitText.toDoubleOrNull() ?: 500.0
                            onConfirm(newLimit)
                        },
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                    ) {
                        Text("Guardar", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  CATEGORY HELPERS
// ═══════════════════════════════════════════════════════════
fun getCategoryInfo(category: String): CategoryData {
    return when (category) {
        "Comida"      -> CategoryData(Icons.Default.Restaurant,          Color(0xFFEF4444))
        "Transporte"  -> CategoryData(Icons.Default.DirectionsCar,       Color(0xFF3B82F6))
        "Ocio"        -> CategoryData(Icons.Default.ConfirmationNumber,  Color(0xFFF59E0B))
        "Salud"       -> CategoryData(Icons.Default.MedicalServices,     Color(0xFF10B981))
        "Tecnología"  -> CategoryData(Icons.Default.PhoneAndroid,        Color(0xFF8B5CF6))
        "Ropa"        -> CategoryData(Icons.Default.Checkroom,           Color(0xFFEC4899))
        "Educación"   -> CategoryData(Icons.Default.School,              Color(0xFF06B6D4))
        "Hogar"       -> CategoryData(Icons.Default.Home,                Color(0xFFF97316))
        else          -> CategoryData(Icons.Default.Receipt,             Color(0xFF64748B))
    }
}

data class CategoryData(val icon: ImageVector, val color: Color)

// ═══════════════════════════════════════════════════════════
//  Legacy edit limit dialog alias
// ═══════════════════════════════════════════════════════════
@Composable
fun EditLimitDialog(currentLimit: Double, onDismiss: () -> Unit, onConfirm: (Double) -> Unit) {
    PremiumEditLimitDialog(currentLimit = currentLimit, onDismiss = onDismiss, onConfirm = onConfirm)
}
