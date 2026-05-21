package com.vidasimple.data.insights

import androidx.compose.runtime.mutableStateOf

object BriefingCache {
    private var _lastBriefingTitle = mutableStateOf<String?>(null)
    private var _lastBriefingMessage = mutableStateOf<String?>(null)
    private var _lastBriefingDate = mutableStateOf<String?>(null)

    val lastBriefingTitle: String? get() = _lastBriefingTitle.value
    val lastBriefingMessage: String? get() = _lastBriefingMessage.value
    val lastBriefingDate: String? get() = _lastBriefingDate.value

    val hasBriefing: Boolean get() = _lastBriefingMessage.value != null

    fun saveBriefing(title: String, message: String) {
        _lastBriefingTitle.value = title
        _lastBriefingMessage.value = message
        _lastBriefingDate.value = java.text.SimpleDateFormat("EEEE d 'de' MMMM", java.util.Locale("es", "MX"))
            .format(java.util.Date())
    }

    fun clear() {
        _lastBriefingTitle.value = null
        _lastBriefingMessage.value = null
        _lastBriefingDate.value = null
    }

    /**
     * Returns a clean version of the briefing without emojis for TTS reading
     */
    fun getCleanBriefingForTTS(): String {
        val message = _lastBriefingMessage.value ?: return "No hay briefing disponible"
        val title = _lastBriefingTitle.value?.removePrefix("☀️ ") ?: ""
        
        // Remove emojis and clean up for speech
        return "$title. ${message.replace(Regex("[\p{So}\p{Cn}]"), "").trim()}"
            .replace("\n", ". ")
            .replace("  ", " ")
            .trim()
    }
}
