package com.vidasimple.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.vidasimple.MainActivity
import com.vidasimple.R

object LocalNotificationHelper {
    fun showNotification(context: Context, title: String, message: String, destination: String? = null) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            if (destination != null) {
                putExtra("navigate_to", destination)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context, (System.currentTimeMillis() % 100000).toInt(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "vidasimple_alerts"
        
        val person = androidx.core.app.Person.Builder()
            .setName(title)
            .setIcon(androidx.core.graphics.drawable.IconCompat.createWithResource(context, R.drawable.ic_logo))
            .setImportant(true)
            .build()

        val notificationBuilder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification_silhouette)
            .setStyle(NotificationCompat.MessagingStyle(person)
                .addMessage(message, System.currentTimeMillis(), person)
            )
            .addAction(0, "ABRIR", pendingIntent)
            .setAutoCancel(true)
            .setColor(android.graphics.Color.parseColor("#4F46E5"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setContentIntent(pendingIntent)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Alertas Críticas de VidaSimple",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify((System.currentTimeMillis() % 100000).toInt(), notificationBuilder.build())
    }
}
