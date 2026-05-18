package com.vidasimple.domain.model

import androidx.compose.ui.graphics.Color
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class TaskPriority(val label: String) {
    @SerialName("Alta") HIGH("Alta"),
    @SerialName("Media") MEDIUM("Media"),
    @SerialName("Baja") LOW("Baja"),
    @SerialName("Todas") NONE("Todas")
}

fun TaskPriority.getColor(): Color {
    return when (this) {
        TaskPriority.HIGH -> Color(0xFFEF4444)
        TaskPriority.MEDIUM -> Color(0xFFF59E0B)
        TaskPriority.LOW -> Color(0xFF10B981)
        else -> Color(0xFF64748B)
    }
}

@Serializable
data class Space(
    val id: String? = null,
    val name: String,
    @SerialName("owner_id") val ownerId: String,
    @SerialName("invite_code") val inviteCode: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Profile(
    val id: String,
    val name: String? = null,
    val email: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null
)

@Serializable
data class SpaceMember(
    @SerialName("space_id") val spaceId: String,
    @SerialName("user_id") val userId: String,
    @SerialName("joined_at") val joinedAt: String? = null
)

@Serializable
data class SpaceActivity(
    val id: String? = null,
    @SerialName("space_id") val spaceId: String,
    @SerialName("user_id") val userId: String,
    val action: String,
    @SerialName("entity_title") val entityTitle: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Task(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    val title: String,
    val description: String? = "",
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val time: String? = null,
    val project: String? = "General",
    @SerialName("is_done") val isDone: Boolean? = false,
    @SerialName("due_date") val dueDate: String? = null,
    @SerialName("space_id") val spaceId: String? = null,
    @SerialName("completed_by_id") val completedById: String? = null,
    @SerialName("assigned_to_id") val assignedToId: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Expense(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    val title: String,
    val amount: Double,
    val category: String? = "Otros",
    val date: String? = null,
    val notes: String? = "",
    @SerialName("space_id") val spaceId: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class CalendarEvent(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    val title: String,
    val description: String? = "",
    @SerialName("event_date") val eventDate: String,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("end_time") val endTime: String? = null,
    val category: String? = "General",
    val color: String? = "primary",
    @SerialName("space_id") val spaceId: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)
