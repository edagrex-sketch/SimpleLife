package com.vidasimple.notifications

import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging
import com.vidasimple.data.supabase.SupabaseManager
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.tasks.await

object FcmTokenManager {
    
    suspend fun registerCurrentToken() {
        try {
            val user = SupabaseManager.client.auth.currentUserOrNull() ?: return
            val token = FirebaseMessaging.getInstance().token.await()
            
            Log.d("FCM", "Registrando token para usuario ${user.id}: $token")
            SupabaseManager.updateFcmToken(user.id, token)
        } catch (e: Exception) {
            Log.e("FCM", "Error al registrar token: ${e.message}")
        }
    }
}
