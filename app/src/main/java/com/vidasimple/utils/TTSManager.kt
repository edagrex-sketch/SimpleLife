package com.vidasimple.utils

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

object TTSManager : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var isReady = false
    private var isSpeaking = false
    private var onDoneCallback: (() -> Unit)? = null

    fun init(context: Context) {
        if (tts == null) {
            tts = TextToSpeech(context.applicationContext, this)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("es", "MX"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fallback to generic Spanish
                tts?.setLanguage(Locale("es"))
            }
            tts?.setPitch(1.0f)
            tts?.setSpeechRate(1.05f)
            isReady = true

            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    isSpeaking = true
                }
                override fun onDone(utteranceId: String?) {
                    isSpeaking = false
                    onDoneCallback?.invoke()
                    onDoneCallback = null
                }
                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    isSpeaking = false
                    onDoneCallback?.invoke()
                    onDoneCallback = null
                }
            })
        }
    }

    fun speak(text: String, onDone: (() -> Unit)? = null) {
        if (!isReady) return
        // Strip emojis for cleaner speech
        val cleanText = text.replace(Regex("[\\p{So}\\p{Cn}]"), "").trim()
        if (cleanText.isBlank()) return
        onDoneCallback = onDone
        tts?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, "vidasimple_tts")
    }

    fun stop() {
        tts?.stop()
        isSpeaking = false
    }

    fun isSpeakingNow(): Boolean = isSpeaking

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isReady = false
        isSpeaking = false
    }
}
