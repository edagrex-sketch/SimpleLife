package com.vidasimple.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.vidasimple.MainActivity
import com.vidasimple.R

class AICoachWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vidasimple_widget_ai_layout)

            // Setup deep link pending intent for the main AI Coach action button
            views.setOnClickPendingIntent(
                R.id.widget_btn_ai_direct,
                createDeepLinkPendingIntent(context, "home_ai", 201)
            )

            // Clicking the whole widget container also triggers the AI Coach
            views.setOnClickPendingIntent(
                R.id.widget_ai_container,
                createDeepLinkPendingIntent(context, "home_ai", 202)
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
