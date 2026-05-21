package com.vidasimple.data.insights

import android.content.Context
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Expense
import com.vidasimple.domain.model.Task
import com.vidasimple.domain.model.TaskPriority
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object DailyBriefingManager {

    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    data class BriefingData(
        val userName: String,
        val pendingTasks: Int,
        val priorityTasks: Int,
        val totalSpent: Double,
        val monthlyLimit: Double,
        val streak: Int,
        val completedToday: Int,
        val overdueTasks: Int,
        val topExpenseCategory: String?,
        val tip: String
    )

    data class BriefingResult(
        val title: String,
        val message: String,
        val data: BriefingData
    )

    suspend fun generateBriefing(context: Context): BriefingResult? {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: return null
        val userId = user.id
        val name = user.userMetadata["name"]?.toString()
            ?: user.email?.substringBefore("@")?.replaceFirstChar { it.uppercase() }
            ?: "Usuario"

        val today = LocalDate.now()
        val todayStr = today.format(dateFormatter)

        // Fetch pending tasks
        val allTasks = try {
            SupabaseManager.client.from("tasks")
                .select {
                    filter {
                        eq("user_id", userId)
                    }
                    order("created_at", Order.DESCENDING)
                }.decodeList<Task>()
        } catch (e: Exception) {
            emptyList()
        }

        val pendingTasks = allTasks.filter { it.isDone != true }
        val priorityTasks = pendingTasks.count { it.priority == TaskPriority.HIGH }
        val completedToday = allTasks.count {
            it.isDone == true && it.dueDate == todayStr
        }
        val overdueTasks = pendingTasks.count { task ->
            task.dueDate != null && try {
                LocalDate.parse(task.dueDate, dateFormatter).isBefore(today)
            } catch (e: Exception) {
                false
            }
        }

        // Calculate streak from fetched data (fresh, not from prefs)
        val completedTasks = allTasks.filter { it.isDone == true }
        val streak = calculateStreak(completedTasks)

        // Fetch expenses
        val allExpenses = try {
            SupabaseManager.client.from("expenses")
                .select {
                    filter {
                        eq("user_id", userId)
                    }
                    order("created_at", Order.DESCENDING)
                }.decodeList<Expense>()
        } catch (e: Exception) {
            emptyList()
        }

        val currentMonth = today.monthValue
        val currentYear = today.year
        val monthExpenses = allExpenses.filter { expense ->
            expense.createdAt?.let { created ->
                try {
                    val date = LocalDate.parse(created.substring(0, 10), dateFormatter)
                    date.monthValue == currentMonth && date.year == currentYear
                } catch (e: Exception) {
                    false
                }
            } ?: false
        }
        val totalSpent = monthExpenses.sumOf { it.amount }

        // Get monthly limit from preferences or use default
        val prefs = context.getSharedPreferences("vidasimple_widget_cache", Context.MODE_PRIVATE)
        val monthlyLimit = prefs.getFloat("monthly_limit", 8000.0f).toDouble()

        // Find top expense category
        val categoryTotals = monthExpenses.groupBy { it.category }
            .mapValues { it.value.sumOf { e -> e.amount } }
        val topCategory = categoryTotals.maxByOrNull { it.value }?.key

        // Generate tip
        val tip = generateTip(
            pendingCount = pendingTasks.size,
            priorityCount = priorityTasks,
            totalSpent = totalSpent,
            monthlyLimit = monthlyLimit,
            streak = streak,
            overdueCount = overdueTasks,
            completedToday = completedToday
        )

        val data = BriefingData(
            userName = name,
            pendingTasks = pendingTasks.size,
            priorityTasks = priorityTasks,
            totalSpent = totalSpent,
            monthlyLimit = monthlyLimit,
            streak = streak,
            completedToday = completedToday,
            overdueTasks = overdueTasks,
            topExpenseCategory = topCategory,
            tip = tip
        )

        val message = buildBriefingMessage(data)
        val title = "☀️ Buenos días, ${name}"

        return BriefingResult(
            title = title,
            message = message,
            data = data
        )
    }

    private fun calculateStreak(completedTasks: List<Task>): Int {
        val completedDates = completedTasks.mapNotNull { it.dueDate }
            .map { LocalDate.parse(it) }
            .distinct()
            .sortedDescending()

        if (completedDates.isEmpty()) return 0

        var currentStreak = 0
        var checkDate = LocalDate.now()

        // If today has no completed tasks, start checking from yesterday
        if (!completedDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1)
        }

        for (date in completedDates) {
            when {
                date == checkDate -> {
                    currentStreak++
                    checkDate = checkDate.minusDays(1)
                }
                date.isBefore(checkDate) -> break
            }
        }

        return currentStreak
    }

    private fun buildBriefingMessage(data: BriefingData): String {
        val sb = StringBuilder()

        // Tasks section
        if (data.pendingTasks > 0) {
            sb.append("📋 Tienes ${data.pendingTasks} tareas pendientes")
            if (data.priorityTasks > 0) {
                sb.append(", ${data.priorityTasks} son prioritarias")
            }
            sb.append("\n")
        } else {
            sb.append("🎉 ¡No tienes tareas pendientes! Disfruta tu día\n")
        }

        if (data.completedToday > 0) {
            sb.append("✅ Ya completaste ${data.completedToday} tareas hoy\n")
        }

        if (data.overdueTasks > 0) {
            sb.append("⚠️ Tienes ${data.overdueTasks} tareas vencidas\n")
        }

        // Expenses section
        val spentPercent = if (data.monthlyLimit > 0) {
            ((data.totalSpent / data.monthlyLimit) * 100).toInt()
        } else 0

        sb.append("💰 Llevas gastado $${String.format("%.0f", data.totalSpent)} de $${String.format("%.0f", data.monthlyLimit)} (${spentPercent}%)\n")

        if (data.topExpenseCategory != null && data.totalSpent > 0) {
            sb.append("📊 Mayor gasto en: ${data.topExpenseCategory}\n")
        }

        // Streak
        if (data.streak > 0) {
            sb.append("🔥 Llevas una racha de ${data.streak} días\n")
        }

        // Tip
        sb.append("\n💡 ${data.tip}")

        return sb.toString()
    }

    private fun generateTip(
        pendingCount: Int,
        priorityCount: Int,
        totalSpent: Double,
        monthlyLimit: Double,
        streak: Int,
        overdueCount: Int,
        completedToday: Int
    ): String {
        val tips = mutableListOf<String>()

        // Financial tips
        if (monthlyLimit > 0) {
            val spentPercent = (totalSpent / monthlyLimit) * 100
            when {
                spentPercent > 80 -> tips.add("Ya has usado el ${spentPercent.toInt()}% de tu presupuesto mensual. Considera reducir gastos estos días.")
                spentPercent > 60 -> tips.add("Llevas el ${spentPercent.toInt()}% del presupuesto usado. ¡Buen ritmo, sigue vigilando tus gastos!")
                spentPercent < 30 && streak > 5 -> tips.add("E
