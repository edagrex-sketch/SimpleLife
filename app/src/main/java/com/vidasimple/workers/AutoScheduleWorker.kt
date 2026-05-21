package com.vidasimple.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Task
import com.vidasimple.notifications.LocalNotificationHelper
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.filter.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class AutoScheduleWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        try {
            val user = SupabaseManager.client.auth.currentUserOrNull() ?: return Result.success()
            val userId = user.id

            // Fetch pending tasks
            val tasks = SupabaseManager.client.from("tasks")
                .select {
                    filter {
                        eq("user_id", userId)
                        eq("is_done", false)
                    }
                }.decodeList<Task>()

            val today = LocalDate.now()
            val tomorrow = today.plusDays(1)
            val formatter = DateTimeFormatter.ISO_LOCAL_DATE

            val overdueTasks = tasks.filter { task ->
                task.dueDate != null && try {
                    val taskDate = LocalDate.parse(task.dueDate, formatter)
                    taskDate.isBefore(today)
                } catch (e: Exception) {
                    false
                }
            }

            if (overdueTasks.isEmpty()) {
                return Result.success()
            }

            // Reschedule overdue tasks to tomorrow
            val tomorrowStr = tomorrow.format(formatter)
            var rescheduledCount = 0

            for (task in overdueTasks) {
                if (task.id != null) {
                    val updatedTask = task.copy(dueDate = tomorrowStr)
                    SupabaseManager.client.from("tasks").update(updatedTask) {
                        filter {
                            eq("id", task.id)
                        }
                    }
                    rescheduledCount++
                }
            }

            if (rescheduledCount > 0) {
                LocalNotificationHelper.showNotification(
                    context,
                    "Auto-Balanceo de Tareas 🤖",
                    "Veo que no pudiste terminar $rescheduledCount tareas atrasadas. Las he reprogramado para mañana para mantener tu agenda limpia.",
                    "tasks"
                )
            }

            return Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            return Result.retry()
        }
    }
}
