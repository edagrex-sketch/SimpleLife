package com.vidasimple.ui.tasks

import com.vidasimple.domain.model.TaskPriority
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.TemporalAdjusters

object VoiceTaskParser {

    data class ParsedTask(
        val title: String,
        val priority: TaskPriority,
        val dueDate: String?
    )

    fun parse(text: String): ParsedTask {
        val lowerText = text.lowercase()
        
        // 1. Extract Priority
        val priority = when {
            lowerText.contains("prioridad alta") || lowerText.contains("urgente") -> TaskPriority.HIGH
            lowerText.contains("prioridad baja") || lowerText.contains("tranquilo") -> TaskPriority.LOW
            else -> TaskPriority.MEDIUM
        }

        // 2. Extract Date
        val today = LocalDate.now()
        val dueDate = when {
            lowerText.contains("mañana") -> today.plusDays(1)
            lowerText.contains("hoy") -> today
            lowerText.contains("el lunes") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY))
            lowerText.contains("el martes") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY))
            lowerText.contains("el miércoles") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.WEDNESDAY))
            lowerText.contains("el jueves") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.THURSDAY))
            lowerText.contains("el viernes") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY))
            lowerText.contains("el sábado") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY))
            lowerText.contains("el domingo") -> today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
            else -> null
        }

        // 3. Extract Title (remove control words)
        var title = text
            .replace("recuérdame ", "", ignoreCase = true)
            .replace("recordar ", "", ignoreCase = true)
            .replace("prioridad alta", "", ignoreCase = true)
            .replace("prioridad media", "", ignoreCase = true)
            .replace("prioridad baja", "", ignoreCase = true)
            .replace("urgente", "", ignoreCase = true)
            .replace("mañana", "", ignoreCase = true)
            .replace("hoy", "", ignoreCase = true)
            .replace("el lunes", "", ignoreCase = true)
            .replace("el martes", "", ignoreCase = true)
            .replace("el miércoles", "", ignoreCase = true)
            .replace("el jueves", "", ignoreCase = true)
            .replace("el viernes", "", ignoreCase = true)
            .replace("el sábado", "", ignoreCase = true)
            .replace("el domingo", "", ignoreCase = true)
            .replace(" para ", " ", ignoreCase = true)
            .trim()
            .replaceFirstChar { it.uppercase() }

        if (title.isEmpty()) title = "Tarea de voz"

        return ParsedTask(
            title = title,
            priority = priority,
            dueDate = dueDate?.format(DateTimeFormatter.ISO_LOCAL_DATE)
        )
    }
}
