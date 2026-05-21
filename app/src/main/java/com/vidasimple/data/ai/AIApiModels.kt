package com.vidasimple.data.ai

import kotlinx.serialization.Serializable

@Serializable
data class AIStructuredResponse(
    val action: String, // "CREATE_TASK" | "CREATE_EXPENSE" | "VIEW_BRIEFING" | "CHIT_CHAT"
    val task_title: String? = null,
    val task_priority: String? = null, // "HIGH" | "MEDIUM" | "LOW"
    val expense_title: String? = null,
    val expense_amount: Double? = null,
    val expense_category: String? = null, // "Comida" | "Transporte" | "Ocio" | "Salud" | "Servicios" | "Otros"
    val task_due_date: String? = null, // Format YYYY-MM-DD if user specifies a date
    val memory_update: String? = null, // Update to user's long term memory if detected
    val reply: String // Conversational Spanish response
)

// ── Groq API Models ─────────────────────────────────────────────────────────

@Serializable
data class GroqMessage(
    val role: String,
    val content: String
)

@Serializable
data class GroqResponseFormat(
    val type: String
)

@Serializable
data class GroqRequest(
    val model: String,
    val messages: List<GroqMessage>,
    val response_format: GroqResponseFormat? = null,
    val temperature: Double = 0.3
)

@Serializable
data class GroqChoice(
    val index: Int,
    val message: GroqMessage,
    val finish_reason: String? = null
)

@Serializable
data class GroqResponse(
    val id: String? = null,
    val choices: List<GroqChoice>
)

// ── Gemini API Models ───────────────────────────────────────────────────────

@Serializable
data class GeminiPart(
    val text: String
)

@Serializable
data class GeminiContent(
    val role: String? = null,
    val parts: List<GeminiPart>
)

@Serializable
data class GeminiGenerationConfig(
    val responseMimeType: String? = null,
    val temperature: Double? = null
)

@Serializable
data class GeminiRequest(
    val contents: List<GeminiContent>,
    val systemInstruction: GeminiContent? = null,
    val generationConfig: GeminiGenerationConfig? = null
)

@Serializable
data class GeminiCandidate(
    val content: GeminiContent,
    val finishReason: String? = null
)

@Serializable
data class GeminiResponse(
    val candidates: List<GeminiCandidate>? = null
)
