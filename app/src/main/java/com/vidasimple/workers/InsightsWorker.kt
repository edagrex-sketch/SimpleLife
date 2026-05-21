package com.vidasimple.workers

import android.content.Context
import androidx.work.*
import com.vidasimple.data.insights.DailyBriefingManager
import com.vidasimple.notifications.LocalNotificationHelper
import java.util.concurrent.TimeUnit

class InsightsWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val WORK_NAME = "vidasimple_daily_insights"
        private const val PREF_NAME = "vidasimple_insights_settings"
        private const val KEY_ENABLED = "insights_enabled"
        private const val KEY_HOUR = "insights_hour"
        private const val KEY_MINUTE = "insights_minute"

        fun isEnabled(context: Context): Boolean {
            val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            return prefs.getBoolean(KEY_ENABLED, true)
        }

        fun setEnabled(context: Context, enabled: Boolean) {
            val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_ENABLED, enabled).apply()
            if (enabled) {
                schedule(context)
            } else {
                cancel(context)
            }
        }

        fun getScheduledHour(context: Context): Int {
            val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            return prefs.getInt(KEY_HOUR, 7)
        }

        fun setScheduledTime(context: Context, hour: Int, minute: Int) {
            val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            prefs.edit().putInt(KEY_HOUR, hour).putInt(KEY_MINUTE, minute).apply()
            if (isEnabled(context)) {
                schedule(context)
            }
        }

        fun schedule(context: Context) {
            val hour = getScheduledHour(context)

            val dailyRequest = PeriodicWorkRequestBuilder<InsightsWorker>(
                24, TimeUnit.HOURS
            ).apply {
                setInitialDelay(calculateInitialDelay(hour), TimeUnit.MILLISECONDS)
                setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                addTag("daily_insights")
            }.build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                dailyRequest
            )
        }

        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        }

        private fun calculateInitialDelay(targetHour: Int): Long {
            val now = java.util.Calendar.getInstance()
            val target = java.util.Calendar.getInstance().apply {
                set(java.util.Calendar.HOUR_OF_DAY, targetHour)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                set(java.util.Calendar.MILLISECOND, 0)
            }

            if (target.before(now) || target == now) {
                target.add(java.util.Calendar.DAY_OF_MONTH, 1)
            }

            return target.timeInMillis - now.timeInMillis
        }
    }

    override suspend fun doWork(): Result {
        return try {
            val result = DailyBriefingManager.generateBriefing(context)

            if (result != null) {
                LocalNotificationHelper.showNotification(
                    context = context,
                    title = result.title,
                    message = result.message,
                    destination = "home"
                )
            }

            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}
