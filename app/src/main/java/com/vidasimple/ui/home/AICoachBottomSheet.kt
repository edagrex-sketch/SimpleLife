package com.vidasimple.ui.home

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.TaskPriority
import com.vidasimple.ui.expenses.ExpensesViewModel
import com.vidasimple.ui.tasks.TasksViewModel
import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ═══════════════════════════════════════════════════════════════
//  AI COACH DATA MODELS
// ═══════════════════════════════════════════════════════════════
data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: java.time.LocalTime = java.time.LocalTime.now()
)

// ═══════════════════════════════════════════════════════════════
//  AI COACH ENGINE — Context-Aware Local Generative Rules
// ═══════════════════════════════════════════════════════════════
object AICoachEngine {

    sealed class CoachResponse {
        data class Text(val message: String) : CoachResponse()
        data class TaskCreated(val message: String, val taskTitle: String, val priority: TaskPriority) : CoachResponse()
        data class ExpenseCreated(val message: String, val title: String, val amount: Double, val category: String) : CoachResponse()
    }

    fun processQuery(
        query: String,
        tasksViewModel: TasksViewModel,
        expensesViewModel: ExpensesViewModel
    ): CoachResponse {
        val cleanQuery = query.trim().lowercase()

        // 1. Intents Regex Definitions
        val isExpense = Regex("\\b(gasto|gast[eé]|pagu[eé]|pagad[oa]|cost[oó]|compr[eé]|cobrar(on)?|\\$|d[oó]lares|pesos|usd|mxn|euros|bucks)\\b").containsMatchIn(cleanQuery)
        val isTask = Regex("\\b(tarea|recordar|recu[eé]rdame|agendar|programa(r)?|apunta(r)?|tengo que|debo|haz|crea(r)?|agrega(r)?|a[ñn]adi(r|e)|pon|anota(r)?|inserta(r)?)\\b").containsMatchIn(cleanQuery)
        val isStats = Regex("\\b(resumen|c[oó]mo voy|progreso|briefing|estatus|hoy|balance|reporte)\\b").containsMatchIn(cleanQuery)
        val isTipsSave = Regex("\\b(ahorro|ahorrar|consejo|tips|finanzas|dinero)\\b").containsMatchIn(cleanQuery)
        val isTipsProd = Regex("\\b(productividad|organizar|tiempo|orden|enfocar)\\b").containsMatchIn(cleanQuery)

        // 2. Detect Expense Intent (Prioritize money/past-tense spending over generic 'agrega')
        if (isExpense) {
            return handleExpenseCreation(query, expensesViewModel)
        }

        // 3. Detect Task Intent
        if (isTask) {
            return handleTaskCreation(query, tasksViewModel)
        }

        // 4. Detect Status / Stats Intent
        if (isStats) {
            return generateBriefing(tasksViewModel, expensesViewModel)
        }

        // 5. Detect Saving Tips Intent
        if (isTipsSave) {
            return generateFinancialTips(expensesViewModel)
        }

        // 6. Detect Productivity Tips Intent
        if (isTipsProd) {
            return generateProductivityTips(tasksViewModel)
        }

        // 6. Generic greeting / fallbacks
        return when {
            cleanQuery.contains("hola") || cleanQuery.contains("buenos días") || cleanQuery.contains("buenas tardes") -> {
                CoachResponse.Text(
                    "¡Hola! Soy tu Asistente Personal AI VidaSimple. 🧠✨\n\n" +
                    "Estoy listo para ayudarte a simplificar tu vida. Puedes pedirme cosas como:\n" +
                    "• *'Crear tarea comprar leche prioridad alta'*\n" +
                    "• *'Registrar gasto de comida de 15 dólares'*\n" +
                    "• *'Dame mi briefing de hoy'*\n" +
                    "• *'¿Cómo puedo ahorrar dinero?'*\n\n" +
                    "¿Qué te gustaría hacer hoy?"
                )
            }
            cleanQuery.contains("gracias") || cleanQuery.contains("perfecto") || cleanQuery.contains("excelente") -> {
                CoachResponse.Text("¡Con mucho gusto! Siempre estoy aquí para ayudarte a mantener el orden en tu vida diaria. ¿Hay algo más en lo que pueda apoyarte? 😊")
            }
            else -> {
                CoachResponse.Text(
                    "Entiendo tu punto, pero para ayudarte de la mejor manera, ¿podrías darme un comando específico? Por ejemplo:\n\n" +
                    "• *'Añade tarea preparar cena'* 📝\n" +
                    "• *'Registra gasto de transporte de $8'* 💸\n" +
                    "• *'Sugerencias de productividad'* 🚀"
                )
            }
        }
    }

    private fun handleTaskCreation(query: String, viewModel: TasksViewModel): CoachResponse {
        val lower = query.lowercase()
        val priority = when {
            lower.contains("alta") || lower.contains("urgente") || lower.contains("importante") -> TaskPriority.HIGH
            lower.contains("baja") || lower.contains("secundario") || lower.contains("tranquilo") -> TaskPriority.LOW
            else -> TaskPriority.MEDIUM
        }

        // Clean up text to extract title with robust Regex NLP
        val prefixPolite = "^(por favor\\s+|quiero\\s+|necesito\\s+|puedes\\s+|podr[ií]as\\s+|me gustar[ií]a\\s+|quisiera\\s+|ay[uú]dame a\\s+|ocupo\\s+|voy a\\s+|vamos a\\s+|tengo que\\s+|debo\\s+)+"
        val verbs = "^(crea(r)?|agrega(r)?|a[ñn]adir|a[ñn]ade|pon(er)?|haz|hacer|recu[eé]rdame|recordar|agenda(r)?|programa(r)?|apunta(r)?|anota(r)?|inserta(r)?)\\s+"
        val articles = "^(una\\s+|un\\s+|la\\s+|el\\s+|unas\\s+|unos\\s+|las\\s+|los\\s+|mi\\s+|mis\\s+|este\\s+|esta\\s+|nueva\\s+|nuevo\\s+|nuevos\\s+|nuevas\\s+|otra\\s+|otro\\s+)+"
        
        var title = query.trim().lowercase()
            .replace(Regex(prefixPolite), "")
            .replace(Regex(verbs), "")
            .replace(Regex(articles), "")
            .replace(Regex("\\b(llamada|que se llame|bajo el nombre de|con el nombre de)\\b\\s*"), "de ")
            .replace(Regex("\\b(con\\s+)?(prioridad alta|prioridad media|prioridad baja|urgente|muy urgente|importante|muy importante|para hoy mismo|para hoy|para ma[ñn]ana)\\b"), "")
            .trim()
            
        if (title.isNotEmpty()) {
            title = title.replaceFirstChar { it.uppercase() }
        }

        if (title.isEmpty()) title = "Nueva tarea inteligente"

        viewModel.addTask(title, priority)

        return CoachResponse.TaskCreated(
            message = "¡Listo! He programado tu nueva tarea:\n\n📝 *\"$title\"*\n🎯 Prioridad: *${priority.label}*\n\nLa verás reflejada al instante en tu lista de tareas.",
            taskTitle = title,
            priority = priority
        )
    }

    private fun handleExpenseCreation(query: String, viewModel: ExpensesViewModel): CoachResponse {
        val lower = query.lowercase()

        // Extract amount
        val numbers = Regex("\\d+(\\.\\d+)?").findAll(query).map { it.value.toDoubleOrNull() ?: 0.0 }.toList()
        val amount = numbers.firstOrNull() ?: 10.0 // default if no number specified

        // Identify category
        val category = when {
            lower.contains("comida") || lower.contains("restaurante") || lower.contains("cena") || lower.contains("almuerzo") || lower.contains("café") -> "Comida"
            lower.contains("transporte") || lower.contains("gasolina") || lower.contains("uber") || lower.contains("metro") || lower.contains("taxi") -> "Transporte"
            lower.contains("ocio") || lower.contains("cine") || lower.contains("concierto") || lower.contains("fiesta") || lower.contains("viaje") -> "Ocio"
            lower.contains("salud") || lower.contains("médico") || lower.contains("farmacia") || lower.contains("dentista") -> "Salud"
            lower.contains("servicios") || lower.contains("luz") || lower.contains("agua") || lower.contains("internet") || lower.contains("renta") -> "Servicios"
            else -> "Ocio"
        }

        // Clean title with robust Regex NLP
        val prefixPolite = "^(por favor\\s+|quiero\\s+|necesito\\s+|puedes\\s+|podr[ií]as\\s+|me gustar[ií]a\\s+|quisiera\\s+|ay[uú]dame a\\s+|ocupo\\s+|voy a\\s+|vamos a\\s+|tengo que\\s+|debo\\s+)+"
        val verbs = "^(registra(r)?|agrega(r)?|a[ñn]adir|a[ñn]ade|pon(er)?|anota(r)?|guarda(r)?|pagu[eé]|pagar|gast[eé]|gastar|cost[oó]|compr[eé]|comprar|me cobraron|cobr[oó]|abonar|abon[eé])\\s+"
        val articles = "^(una\\s+|un\\s+|la\\s+|el\\s+|unas\\s+|unos\\s+|las\\s+|los\\s+|mi\\s+|mis\\s+|este\\s+|esta\\s+|nueva\\s+|nuevo\\s+|nuevos\\s+|nuevas\\s+|otra\\s+|otro\\s+)+"
        
        var title = query.trim().lowercase()
            .replace(Regex(prefixPolite), "")
            .replace(Regex(verbs), "")
            .replace(Regex(articles), "")
            .replace(Regex("\\b(de\\s+|por\\s+|en\\s+|con\\s+)?(\\$?\\d+(\\.\\d+)?)\\b"), "")
            .replace(Regex("\\b(d[oó]lares|pesos|usd|mxn|euros|bucks|varos)\\b"), "")
            .replace(Regex("^(de\\s+|por\\s+|en\\s+)"), "")
            .trim()
            
        if (title.isNotEmpty()) {
            title = title.replaceFirstChar { it.uppercase() }
        }

        if (title.isEmpty()) title = category

        viewModel.addExpense(title, amount, category)

        return CoachResponse.ExpenseCreated(
            message = "¡Entendido! He registrado tu gasto:\n\n💸 Concepto: *\"$title\"*\n💰 Monto: *\$${String.format("%.2f", amount)}*\n🏷️ Categoría: *$category*\n\nEsto se ha sumado a tu presupuesto mensual actual.",
            title = title,
            amount = amount,
            category = category
        )
    }

    private fun generateBriefing(tasks: TasksViewModel, expenses: ExpensesViewModel): CoachResponse.Text {
        val pendingCount = tasks.pendingTasks.size
        val urgentTasks = tasks.pendingTasks.filter { it.priority == TaskPriority.HIGH }
        val spent = expenses.totalSpent
        val limit = expenses.limit
        val ratio = spent / limit

        val tasksText = when {
            pendingCount == 0 -> "🎉 ¡Excelente! No tienes tareas pendientes hoy. ¡Tómate un descanso!"
            urgentTasks.isNotEmpty() -> "Tienes *$pendingCount tareas pendientes*. Te sugiero enfocarte primero en la más urgente:\n📝 *\"${urgentTasks.first().title}\"* (Prioridad Alta)."
            else -> "Tienes *$pendingCount tareas pendientes*. Tu prioridad principal es:\n📝 *\"${tasks.pendingTasks.first().title}\"*."
        }

        val budgetText = when {
            ratio >= 1.0 -> "⚠️ *¡Alerta de Presupuesto!* Has gastado *\$${String.format("%.2f", spent)}* de un límite de *\$${limit.toInt()}* (100%+). Te recomiendo congelar gastos no esenciales de inmediato."
            ratio >= 0.8 -> "⚠️ Has consumido el *${(ratio * 100).toInt()}%* de tu presupuesto (*\$${String.format("%.2f", spent)}* de *\$${limit.toInt()}*). Queda poco margen para este mes."
            else -> "💼 Tu presupuesto va saludable: has gastado el *${(ratio * 100).toInt()}%* (*\$${String.format("%.2f", spent)}* de *\$${limit.toInt()}*). ¡Sigue así!"
        }

        val greeting = when (java.time.LocalTime.now().hour) {
            in 6..12 -> "¡Buenos días! ☀️"
            in 13..18 -> "¡Buenas tardes! 🌤️"
            else -> "¡Buenas noches! 🌙"
        }

        return CoachResponse.Text(
            "$greeting Aquí está tu briefing de hoy:\n\n" +
            "📋 *Tareas:* \n$tasksText\n\n" +
            "💵 *Finanzas:* \n$budgetText\n\n" +
            "💡 *Sugerencia rápida:* Prioriza terminar tus pendientes antes de planear nuevos gastos hoy. ¡Haz que este día cuente!"
        )
    }

    private fun generateFinancialTips(expenses: ExpensesViewModel): CoachResponse.Text {
        val spent = expenses.totalSpent
        val limit = expenses.limit
        val ratio = spent / limit

        val tips = listOf(
            "🥗 *El efecto cafetería:* ¿Sabías que un café diario fuera de casa equivale a casi \$100 al mes? Prepararlo en casa y disfrutarlo en tu termo inteligente te ahorrará una fortuna al año.",
            "📦 *Regla de las 48 horas:* Antes de realizar una compra no esencial, agrégala al carrito y espera 48 horas. En la mayoría de los casos, la compra impulsiva pierde interés y no la compras.",
            "🔌 *Vampiros de energía:* Desconecta los aparatos eléctricos que no uses cotidianamente. El consumo fantasma representa hasta el 10% de tu factura eléctrica mensual.",
            "🛒 *Nunca compres con hambre:* Ir al supermercado con el estómago vacío aumenta las compras impulsivas de alimentos ultraprocesados en un 30%."
        )

        val statusTip = if (ratio > 0.75) {
            "\n\n🚨 *Tip Personalizado:* Actualmente has consumido el *${(ratio * 100).toInt()}%* de tu límite. Te sugiero posponer cualquier compra extra para el siguiente mes."
        } else ""

        return CoachResponse.Text(
            "Aquí tienes algunos consejos inteligentes de ahorro financiero: \n\n" +
            tips.random() + statusTip
        )
    }

    private fun generateProductivityTips(tasks: TasksViewModel): CoachResponse.Text {
        val pending = tasks.pendingTasks.size

        val tips = listOf(
            "⏱️ *Técnica Pomodoro:* Trabaja durante 25 minutos sin distracciones, luego descansa 5 minutos. Repite esto para multiplicar tu concentración enormemente.",
            "🐸 *Trágate ese sapo:* Comienza tu día realizando la tarea más pesada y difícil de tu lista. Una vez superada, el resto del día se sentirá increíblemente ligero y productivo.",
            "🧹 *Regla de los 2 minutos:* Si una tarea te toma menos de dos minutos (como archivar un papel o contestar un mensaje corto), hazla de inmediato. No la agendes, hazla ya.",
            "📴 *Zona libre de pantallas:* Reserva los primeros 30 minutos de tu mañana sin revisar el teléfono. Reducirá tu nivel de cortisol e incrementará tu enfoque diario."
        )

        val statusTip = if (pending > 4) {
            "\n\n🚀 *Tip Personalizado:* Tienes *$pending tareas pendientes*. Te sugiero agrupar las tareas similares y resolverlas en un solo bloque (time-blocking) para evitar fatiga mental."
        } else ""

        return CoachResponse.Text(
            "Aquí tienes mis mejores recomendaciones para elevar tu productividad: \n\n" +
            tips.random() + statusTip
        )
    }
}

// ═══════════════════════════════════════════════════════════════
//  AI COACH CARD — Premium Widget for Home Screen
// ═══════════════════════════════════════════════════════════════
@Composable
fun AICoachCard(
    onStartClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .shadow(12.dp, RoundedCornerShape(26.dp), spotColor = VioletPrimary.copy(alpha = 0.3f)),
        shape = RoundedCornerShape(26.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Box(
            modifier = Modifier
                .background(Brush.linearGradient(GradientSunset))
                .clickable { onStartClick() }
                .padding(24.dp)
        ) {
            // Decorative background items
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .offset(x = 180.dp, y = (-20).dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.04f))
            )

            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "VIDASIMPLE AI COACH",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White.copy(alpha = 0.85f),
                        letterSpacing = 1.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "¿Cómo puedo optimizar mi día hoy?",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    letterSpacing = (-0.5).sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Habla con tu asistente personal. Organiza tareas, gestiona gastos y obtén recomendaciones inteligentes mediante lenguaje natural.",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color.White,
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Consultar Asistente",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = VioletDark
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = VioletDark,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  AI COACH BOTTOM SHEET — Conversational Chat Portal
// ═══════════════════════════════════════════════════════════════
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AICoachBottomSheet(
    tasksViewModel: TasksViewModel,
    expensesViewModel: ExpensesViewModel,
    onDismiss: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val chatMessages = remember {
        mutableStateListOf(
            ChatMessage(
                text = "¡Hola! 👋 Soy tu organizador y coach financiero de VidaSimple AI.\n\n" +
                       "Puedo ayudarte a simplificar tus días. Escríbeme de forma natural o prueba alguno de los accesos rápidos a continuación. 😊",
                isUser = false
            )
        )
    }

    var textInput by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        chatMessages.add(ChatMessage(text = text, isUser = true))
        textInput = ""

        // Autoscroll to bottom
        scope.launch {
            delay(100)
            listState.animateScrollToItem(chatMessages.size - 1)
        }

        // Trigger typing state
        isTyping = true

        // Simulate thinking and process response
        scope.launch {
            delay(1200) // Realistic typing delay for human feel
            isTyping = false

            val response = AICoachEngine.processQuery(text, tasksViewModel, expensesViewModel)
            val responseText = when (response) {
                is AICoachEngine.CoachResponse.Text -> response.message
                is AICoachEngine.CoachResponse.TaskCreated -> response.message
                is AICoachEngine.CoachResponse.ExpenseCreated -> response.message
            }

            chatMessages.add(ChatMessage(text = responseText, isUser = false))

            // Autoscroll to bottom again
            delay(100)
            listState.animateScrollToItem(chatMessages.size - 1)
        }
    }

    val speechRecognizerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val results = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val spokenText = results?.firstOrNull()
            if (!spokenText.isNullOrBlank()) {
                sendMessage(spokenText)
            }
        }
    }

    fun startVoiceRecognition() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Habla con VidaSimple AI...")
        }
        try {
            speechRecognizerLauncher.launch(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.background,
        dragHandle = { BottomSheetDefaults.DragHandle() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .navigationBarsPadding()
        ) {
            // Header with Psychology Icon
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(GradientSunset)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Psychology,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Asistente AI VidaSimple",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "En línea • Coach inteligente",
                        fontSize = 12.sp,
                        color = SuccessGreen,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Divider(
                modifier = Modifier.padding(vertical = 12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            )

            // Chat Messages Timeline
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(chatMessages, key = { it.id }) { message ->
                    ChatBubble(message = message)
                }

                if (isTyping) {
                    item {
                        TypingIndicatorBubble()
                    }
                }
            }

            // Quick Actions Suggestion Bar
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val prompts = listOf(
                    "📊 Mi briefing de hoy",
                    "💰 Sugerencias de ahorro",
                    "📝 Tarea: Comprar despensa",
                    "💸 Gasto: Comida de $12",
                    "⚡ Tips de productividad"
                )
                items(prompts) { prompt ->
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = VioletPrimary.copy(alpha = 0.08f),
                        border = BorderStroke(1.dp, VioletPrimary.copy(alpha = 0.2f)),
                        modifier = Modifier.clickable {
                            sendMessage(prompt.substring(2)) // strip emoji
                        }
                    ) {
                        Text(
                            text = prompt,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = VioletPrimary,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            // Input Send Bar
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(12.dp, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)),
                color = MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = textInput,
                        onValueChange = { textInput = it },
                        placeholder = { Text("Instrucción o comando...", fontSize = 14.sp) },
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp)),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.background,
                            unfocusedContainerColor = MaterialTheme.colorScheme.background,
                            disabledContainerColor = MaterialTheme.colorScheme.background,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        maxLines = 3,
                        keyboardOptions = KeyboardOptions(
                            imeAction = ImeAction.Send
                        ),
                        keyboardActions = KeyboardActions(
                            onSend = {
                                if (textInput.isNotBlank()) {
                                    sendMessage(textInput)
                                }
                            }
                        )
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = { startVoiceRecognition() },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "Hablar",
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = {
                            if (textInput.isNotBlank()) {
                                sendMessage(textInput)
                            }
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(GradientViolet))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Enviar",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  CHAT BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════
@Composable
fun ChatBubble(message: ChatMessage) {
    val isUser = message.isUser
    val alignment = if (isUser) Alignment.End else Alignment.Start
    val bgBrush = if (isUser) {
        Brush.linearGradient(GradientViolet)
    } else {
        Brush.linearGradient(listOf(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.surfaceVariant))
    }
    val textColor = if (isUser) {
        Color.White
    } else {
        MaterialTheme.colorScheme.onSurface
    }
    val bubbleShape = if (isUser) {
        RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp, bottomStart = 20.dp, bottomEnd = 4.dp)
    } else {
        RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp, bottomStart = 4.dp, bottomEnd = 20.dp)
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 290.dp)
                .clip(bubbleShape)
                .background(bgBrush)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Text(
                text = message.text,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = textColor,
                lineHeight = 20.sp
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = message.timestamp.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
            modifier = Modifier.padding(horizontal = 6.dp)
        )
    }
}

// ═══════════════════════════════════════════════════════════════
//  TYPING INDICATOR BUBBLE
// ═══════════════════════════════════════════════════════════════
@Composable
fun TypingIndicatorBubble() {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    val dot1Scale by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot1"
    )
    val dot2Scale by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, delayMillis = 200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot2"
    )
    val dot3Scale by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, delayMillis = 400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot3"
    )

    Row(
        modifier = Modifier
            .widthIn(max = 100.dp)
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp, bottomStart = 4.dp, bottomEnd = 20.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(VioletPrimary).graphicsLayer(scaleX = dot1Scale, scaleY = dot1Scale))
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(VioletPrimary).graphicsLayer(scaleX = dot2Scale, scaleY = dot2Scale))
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(VioletPrimary).graphicsLayer(scaleX = dot3Scale, scaleY = dot3Scale))
    }
}
