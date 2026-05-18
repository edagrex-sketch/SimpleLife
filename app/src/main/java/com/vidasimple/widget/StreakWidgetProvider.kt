package com.vidasimple.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.vidasimple.MainActivity
import com.vidasimple.R

class StreakWidgetProvider : AppWidgetProvider() {

    private val motivationalQuotes = listOf(
        "¡Cada paso cuenta para tu bienestar!",
        "La constancia es la clave del éxito.",
        "Un día a la vez. ¡Sigue brillando!",
        "Tu potencial es infinito. ¡Hazlo hoy!",
        "Pequeños hábitos, grandes resultados."
    )

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("vidasimple_widget_cache", Context.MODE_PRIVATE)
        val streak = prefs.getInt("streak", 0)

        // Select a quote based on the streak or current time/hash
        val quoteIndex = if (streak > 0) streak % motivationalQuotes.size else 0
        val quote = motivationalQuotes[quoteIndex]

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vidasimple_widget_streak_layout)

            views.setTextViewText(R.id.widget_streak_days, "$streak días")
            views.setTextViewText(R.id.widget_motivation_quote, quote)

            // Setup deep link pending intent
            views.setOnClickPendingIntent(
                R.id.widget_streak_container,
                createDeepLinkPendingIntent(context, "profile", 301)
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
