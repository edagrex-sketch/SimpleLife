package com.vidasimple.notifications

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class VidaSimpleMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Extract deep link destination from the data payload if present
        val destination = remoteMessage.data["destination"]
        
        remoteMessage.notification?.let {
            val title = it.title ?: "VidaSimple"
            val body = it.body ?: ""
            LocalNotificationHelper.showNotification(this, title, body, destination)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "Nuevo Token: $token")
    }
}
