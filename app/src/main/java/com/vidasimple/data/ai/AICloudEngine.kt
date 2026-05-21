package com.vidasimple.data.ai

import android.content.Context
import com.vidasimple.ui.home.AICoachEngine
import com.vidasimple.ui.tasks.TasksViewModel
import com.vidasimple.ui.expenses.ExpensesViewModel
import com.vidasimple.domain.model.TaskPriority
import io.ktor.client.HttpClient
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object AICloudEngine {
    private const val PREFS_NAME = "vidasimple_ai_prefs"
    private const val KEY_PROVIDER = "ai_provider"
    private const val KEY_API_KEY = "ai_api_key"
    
    // Default values
    private const val DEFAULT_PROVIDER = "groq"
    private const val DEFAULT_KEY = "gsk_REMOVED_FROM_HISTORY"

    private val jsonConfig = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        encodeDefaults = true
        isLenient = true
    }

    private val httpClient = HttpClient(Android) {
        install(ContentNegotiation) {
            json(jsonConfig)
        }
    }

    fun getProvider(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_PROVIDER, DEFAULT_PROVIDER) ?: DEFAULT_PROVIDER
    }

    fun getApiKey(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_API_KEY, DEFAULT_KEY) ?: DEFAULT_KEY
    }

    fun saveSettings(context: Context, provider: String, apiKey: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_PROVIDER, provider)
            .putString(KEY_API_KEY, apiKey)
            .apply()
    }

    fun clearSettings(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .remove(KEY_PROVIDER)
            .remove(KEY_API_KEY)
            .apply()
    }

    suspend fun processQuery(
        context: Context,
        query: String,
        tasksViewModel: TasksViewModel,
        expensesViewModel: ExpensesViewModel
    ): AICoachEngine.CoachResponse {
        val provider = getProvider(context)
        val apiKey = getApiKey(context)

        // Fallback directly to local engine if no API key is present
        if (apiKey.isBlank()) {
            return AICoachEngine.processQuery(query, tasksViewModel, expensesViewModel)
        }

        try {
            val pendingTasksCount = tasksViewModel.pendingTasks.size
            val budgetLimit = expensesViewModel.limit
            val spentAmount = expensesViewModel.totalSpent
            val currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            val memoriesList = LongTermMemoryManager.getMemories(context)
            val memoriesText = if (memoriesList.isEmpty()) "Ninguna" else memoriesList.joinToString("\n                - ")

            val systemPrompt = """
                Eres un asistente personal e inteligente llamado VidaSimple AI. Analizas la entrada del usuario y decides la acción correspondiente de forma estructurada en formato JSON.
                Debes retornar SIEMPRE un JSON válido con la estructura solicitada, sin bloques markdown alrededor (sin ```json o ```).
                El JSON debe contener exactamente estos campos:
                - action: string ("CREATE_TASK", "CREATE_EXPENSE", "VIEW_BRIEFING", "CHIT_CHAT")
                - task_title: string (título de la tarea si aplica, primera letra en mayúscula)
                - task_priority: string ("HIGH", "MEDIUM", "LOW" si aplica)
                - task_due_date: string (formato YYYY-MM-DD si aplica y se especifica fecha, sino null)
                - expense_title: string (concepto del gasto si aplica, primera letra en mayúscula)
                - expense_amount: double (monto del gasto si aplica)
                - expense_category: string ("Comida", "Transporte", "Ocio", "Salud", "Servicios", "Otros" si aplica)
                - memory_update: string (Si el usuario te cuenta algo importante sobre él, sus metas o preferencias, escribe aquí un resumen breve para recordarlo a largo plazo, de lo contrario null)
                - reply: string (respuesta conversacional amable en español, formateada con emojis si es pertinente. Si estás creando una tarea o un gasto, confirma en el reply que lo has hecho con éxito. Toma en cuenta la Memoria a Largo Plazo del usuario para personalizar tus respuestas.)
                
                Información de contexto para el briefing o respuestas:
                - Tareas pendientes actuales: $pendingTasksCount
                - Límite de presupuesto mensual: $budgetLimit
                - Gasto mensual acumulado actual: $spentAmount
                - Fecha de hoy: $currentDate
                
                Memoria a Largo Plazo del usuario:
                - $memoriesText
                
                Reglas de decisión:
                - Si el usuario quiere crear/agendar/anotar una tarea o recordatorio, usa "CREATE_TASK" y extrae el título, prioridad y fecha límite si se menciona (ej. "mañana" sería ${"$"}{LocalDate.now().plusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))}).
                - Si el usuario quiere registrar/anotar un gasto, compra, pago, usa "CREATE_EXPENSE" y extrae el título, monto y categoría adecuada.
                - Si el usuario pide un resumen, estatus, briefing, reporte o cómo va, usa "VIEW_BRIEFING". Para el briefing, salúdalo con entusiasmo, dale un resumen de sus tareas y gastos, y aconséjalo basándote en su memoria a largo plazo.
                - Para cualquier otra conversación, saludo, consejo financiero o consejo de productividad, usa "CHIT_CHAT".
            """.trimIndent()

            val rawJson = if (provider == "groq") {
                callGroq(apiKey, systemPrompt, query)
            } else {
                callGemini(apiKey, systemPrompt, query)
            }

            val structuredResponse = jsonConfig.decodeFromString<AIStructuredResponse>(rawJson)

            structuredResponse.memory_update?.let { newMemory ->
                if (newMemory.isNotBlank()) {
                    LongTermMemoryManager.addMemory(context, newMemory)
                }
            }

            return when (structuredResponse.action) {
                "CREATE_TASK" -> {
                    val title = structuredResponse.task_title ?: "Nueva tarea inteligente"
                    val priority = when (structuredResponse.task_priority) {
                        "HIGH" -> TaskPriority.HIGH
                        "LOW" -> TaskPriority.LOW
                        else -> TaskPriority.MEDIUM
                    }
                    val dueDate = structuredResponse.task_due_date
                    if (!dueDate.isNullOrBlank()) {
                        tasksViewModel.addTaskWithDate(title, priority, dueDate)
                    } else {
                        tasksViewModel.addTask(title, priority)
                    }
                    AICoachEngine.CoachResponse.TaskCreated(
                        message = structuredResponse.reply,
                        taskTitle = title,
                        priority = priority
                    )
                }
                "CREATE_EXPENSE" -> {
                    val title = structuredResponse.expense_title ?: "Gasto inteligente"
                    val amount = structuredResponse.expense_amount ?: 0.0
                    val category = structuredResponse.expense_category ?: "Otros"
                    expensesViewModel.addExpense(title, amount, category)
                    AICoachEngine.CoachResponse.ExpenseCreated(
                        message = structuredResponse.reply,
                        title = title,
                        amount = amount,
                        category = category
                    )
                }
                else -> {
                    AICoachEngine.CoachResponse.Text(structuredResponse.reply)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback gracefully to rule-based engine on error
            return AICoachEngine.processQuery(query, tasksViewModel, expensesViewModel)
        }
    }

    private suspend fun callGroq(apiKey: String, systemPrompt: String, userQuery: String): String {
        val requestBody = GroqRequest(
            model = "llama-3.3-70b-versatile",
            messages = listOf(
                GroqMessage(role = "system", content = systemPrompt),
                GroqMessage(role = "user", content = userQuery)
            ),
            response_format = GroqResponseFormat(type = "json_object")
        )

        val response = httpClient.post("https://api.groq.com/openai/v1/chat/completions") {
            header("Authorization", "Bearer $apiKey")
            contentType(ContentType.Application.Json)
            setBody(requestBody)
        }

        val parsed = jsonConfig.decodeFromString<GroqResponse>(response.bodyAsText())
        return parsed.choices.firstOrNull()?.message?.content ?: throw Exception("Empty choice from Groq")
    }

    private suspend fun callGemini(apiKey: String, systemPrompt: String, userQuery: String): String {
        val requestBody = GeminiRequest(
            contents = listOf(
                GeminiContent(
                    role = "user",
                    parts = listOf(GeminiPart(text = userQuery))
                )
            ),
            systemInstruction = GeminiContent(
                parts = listOf(GeminiPart(text = systemPrompt))
            ),
            generationConfig = GeminiGenerationConfig(
                responseMimeType = "application/json",
                temperature = 0.3
            )
        )

        val response = httpClient.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent") {
            parameter("key", apiKey)
            contentType(ContentType.Application.Json)
            setBody(requestBody)
        }

        val parsed = jsonConfig.decodeFromString<GeminiResponse>(response.bodyAsText())
        val rawContent = parsed.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw Exception("Empty response from Gemini")
        return rawContent
    }
}
