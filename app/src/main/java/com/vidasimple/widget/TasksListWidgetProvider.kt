package com.vidasimple.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import com.vidasimple.MainActivity
import com.vidasimple.R

class TasksListWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("vidasimple_widget_cache", Context.MODE_PRIVATE)
        val pendingCount = prefs.getInt("pending_tasks", 0)

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vidasimple_widget_tasks_layout)

            views.setTextViewText(R.id.widget_tasks_header_count, "$pendingCount pendientes")

            if (pendingCount == 0) {
                views.setViewVisibility(R.id.widget_tasks_empty_view, View.VISIBLE)
                views.setViewVisibility(R.id.widget_tasks_list_container, View.GONE)
            } else {
                views.setViewVisibility(R.id.widget_tasks_empty_view, View.GONE)
                views.setViewVisibility(R.id.widget_tasks_list_container, View.VISIBLE)

                // Bind top 3 tasks
                val taskViews = listOf(
                    Triple(R.id.widget_task_row_1, R.id.widget_task_dot_1, R.id.widget_task_text_1),
                    Triple(R.id.widget_task_row_2, R.id.widget_task_dot_2, R.id.widget_task_text_2),
                    Triple(R.id.widget_task_row_3, R.id.widget_task_dot_3, R.id.widget_task_text_3)
                )

                for (i in 0..2) {
                    val (rowId, dotId, textId) = taskViews[i]
                    val title = prefs.getString("task_title_$i", "") ?: ""
                    val priority = prefs.getString("task_priority_$i", "") ?: ""

                    if (title.isNotEmpty()) {
                        views.setViewVisibility(rowId, View.VISIBLE)
                        views.setTextViewText(textId, title)

                        // Set dot color based on priority
                        val dotColor = when (priority.lowercase()) {
                            "alta" -> 0xFFFF4A4A.toInt() // Red
                            "media" -> 0xFFFF9F0A.toInt() // Orange
                            "baja" -> 0xFF30D158.toInt() // Green
                            else -> 0xFF8A8A8F.toInt() // Gray
                        }
                        // To set background color on remote views, setTextColor or setInt drawable tint
                        views.setInt(dotId, "setBackgroundColor", dotColor)
                    } else {
                        views.setViewVisibility(rowId, View.GONE)
                    }
                }
            }

            // Click pending intents
            val pendingIntent = createDeepLinkPendingIntent(context, "tasks", 401)
            views.setOnClickPendingIntent(R.id.widget_tasks_container, pendingIntent)
            views.setOnClickPendingIntent(R.id.widget_btn_tasks_add_direct, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    private fun createDeepLinkPendingIntent(
        context: Context,
        route: String,
        requestCode: Int
    ): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigate_to", route)
        }
        val flags = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags)
    }
}
