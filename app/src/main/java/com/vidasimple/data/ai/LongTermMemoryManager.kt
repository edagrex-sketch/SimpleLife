package com.vidasimple.data.ai

import android.content.Context
import org.json.JSONArray

object LongTermMemoryManager {
    private const val PREFS_NAME = "vidasimple_ai_memory"
    private const val KEY_MEMORIES = "user_memories"

    fun getMemories(context: Context): List<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val jsonString = prefs.getString(KEY_MEMORIES, "[]") ?: "[]"
        return try {
            val jsonArray = JSONArray(jsonString)
            val list = mutableListOf<String>()
            for (i in 0 until jsonArray.length()) {
                list.add(jsonArray.getString(i))
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun addMemory(context: Context, newMemory: String) {
        if (newMemory.isBlank()) return
        val currentMemories = getMemories(context).toMutableList()
        // Avoid exact duplicates
        if (!currentMemories.contains(newMemory)) {
            currentMemories.add(newMemory)
            saveMemories(context, currentMemories)
        }
    }

    private fun saveMemories(context: Context, memories: List<String>) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val jsonArray = JSONArray()
        memories.forEach { jsonArray.put(it) }
        prefs.edit().putString(KEY_MEMORIES, jsonArray.toString()).apply()
    }

    fun clearMemories(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_MEMORIES).apply()
    }
}
