package com.vidasimple.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.vidasimple.MainActivity
import com.vidasimple.R

class BudgetWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("vidasimple_widget_cache", Context.MODE_PRIVATE)
        val spentMonth = prefs.getFloat("total_spent_month", 0.0f)
        val limit = prefs.getFloat("budget_limit", 500.0f) // default fallback limit of 500

        val percent = if (limit > 0) (spentMonth / limit) * 100 else 0f

        val (statusText, statusColor) = when {
            percent >= 100f -> Pair("¡Presupuesto excedido! 🚨", 0xFFFF4A4A.toInt()) // Red
            percent >= 80f -> Pair("Cerca del límite ⚠️", 0xFFFF9F0A.toInt()) // Orange
            else -> Pair("Presupuesto Seguro ✅", 0xFF30D158.toInt()) // Green
        }

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vidasimple_widget_budget_layout)

            views.setTextViewText(R.id.widget_budget_spent, "$${String.format("%.2f", spentMonth)}")
            views.setTextViewText(R.id.widget_budget_limit, "/  $${String.format("%.2f", limit)}")
            views.setTextViewText(R.id.widget_budget_status, statusText)
            views.setTextColor(R.id.widget_budget_status, statusColor)

            // Setup deep link pending intent
            val pendingIntent = createDeepLinkPendingIntent(context, "expenses", 501)
            views.setOnClickPendingIntent(R.id.widget_budget_container, pendingIntent)
            views.setOnClickPendingIntent(R.id.widget_btn_budget_add_direct, pendingIntent)

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
