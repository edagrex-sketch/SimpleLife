package com.vidasimple.data.widget

import android.content.Context
import android.content.Intent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import com.vidasimple.widget.*

object WidgetCacheHelper {
    private const val PREFS_NAME = "vidasimple_widget_cache"
    
    fun updateCache(
        context: Context,
        pendingTasksCount: Int,
        totalSpentToday: Double,
        totalSpentMonth: Double,
        budgetLimit: Double,
        streak: Int,
        taskTitles: List<String>,
        taskPriorities: List<String>
    ) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt("pending_tasks", pendingTasksCount)
            putFloat("total_spent", totalSpentToday.toFloat())
            putFloat("total_spent_today", totalSpentToday.toFloat())
            putFloat("total_spent_month", totalSpentMonth.toFloat())
            putFloat("budget_limit", budgetLimit.toFloat())
            putInt("streak", streak)
            
            // Store top 3 tasks
            for (i in 0..2) {
                if (i < taskTitles.size) {
                    putString("task_title_$i", taskTitles[i])
                    putString("task_priority_$i", taskPriorities[i])
                } else {
                    putString("task_title_$i", "")
                    putString("task_priority_$i", "")
                }
            }
            apply()
        }
        triggerAllWidgetUpdates(context)
    }

    fun updateStreak(context: Context, streak: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt("streak", streak)
            apply()
        }
        triggerAllWidgetUpdates(context)
    }

    fun updateTasks(context: Context, pendingCount: Int, titles: List<String>, priorities: List<String>) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt("pending_tasks", pendingCount)
            for (i in 0..2) {
                if (i < titles.size) {
                    putString("task_title_$i", titles[i])
                    putString("task_priority_$i", priorities[i])
                } else {
                    putString("task_title_$i", "")
                    putString("task_priority_$i", "")
                }
            }
            apply()
        }
        triggerAllWidgetUpdates(context)
    }

    fun updateExpenses(context: Context, todaySpent: Double, monthSpent: Double, limit: Double) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putFloat("total_spent", todaySpent.toFloat())
            putFloat("total_spent_today", todaySpent.toFloat())
            putFloat("total_spent_month", monthSpent.toFloat())
            putFloat("budget_limit", limit.toFloat())
            apply()
        }
        triggerAllWidgetUpdates(context)
    }

    private fun triggerAllWidgetUpdates(context: Context) {
        val providers = listOf(
            VidaSimpleWidgetProvider::class.java,
            AICoachWidgetProvider::class.java,
            StreakWidgetProvider::class.java,
            TasksListWidgetProvider::class.java,
            BudgetWidgetProvider::class.java
        )
        
        providers.forEach { providerClass ->
            val intent = Intent(context, providerClass).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(
                ComponentName(context, providerClass)
            )
            if (ids.isNotEmpty()) {
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                context.sendBroadcast(intent)
            }
        }
    }
}
