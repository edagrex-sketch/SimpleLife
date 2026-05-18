package com.vidasimple.data.supabase

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.realtime

object SupabaseManager {
    const val URL = "https://laompxcerncxqwsqsocy.supabase.co"
    const val ANON_KEY = "sb_publishable_PbqXkpP3cGJdcV9abmwiwA_7dDHKaA0"
    
    val client = createSupabaseClient(URL, ANON_KEY) {
        install(Postgrest)
        install(Auth)
        install(Functions)
        install(Realtime)
    }

    suspend fun updateFcmToken(userId: String, token: String) {
        try {
            client.from("user_fcm_tokens").upsert(
                mapOf(
                    "user_id" to userId,
                    "fcm_token" to token,
                    "device_type" to "android"
                )
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
