package com.vidasimple.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.vidasimple.MainActivity
import com.vidasimple.R

class VidaSimpleWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Read cached stats from SharedPreferences
        val prefs = context.getSharedPreferences("vidasimple_widget_cache", Context.MODE_PRIVATE)
        val pendingTasks = prefs.getInt("pending_tasks", 0)
        val totalSpent = prefs.getFloat("total_spent", 0.0f)
        val streak = prefs.getInt("streak", 0)

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vidasimple_widget_layout)

            // Bind values to RemoteViews
            views.setTextViewText(R.id.widget_streak_text, "$streak días")
            views.setTextViewText(R.id.widget_tasks_text, "$pendingTasks pendientes")
            views.setTextViewText(R.id.widget_expenses_text, "$${String.format("%.2f", totalSpent)}")

            // Setup deep link pending intents for action buttons
            views.setOnClickPendingIntent(
                R.id.widget_btn_tasks,
                createDeepLinkPendingIntent(context, "tasks", 101)
            )
            views.setOnClickPendingIntent(
                R.id.widget_btn_expenses,
                createDeepLinkPendingIntent(context, "expenses", 102)
            )
            views.setOnClickPendingIntent(
                R.id.widget_btn_ai,
                createDeepLinkPendingIntent(context, "home_ai", 103)
            )

            // Clicking the whole widget container opens the home screen
            views.setOnClickPendingIntent(
                R.id.widget_container,
                createDeepLinkPendingIntent(context, "home", 104)
            )

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
