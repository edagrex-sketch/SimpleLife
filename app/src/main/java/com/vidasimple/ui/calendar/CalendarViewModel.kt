package com.vidasimple.ui.calendar

import android.app.Application
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.CalendarEvent
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.filter.*
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.realtime
import io.github.jan.supabase.realtime.postgresChangeFlow
import io.github.jan.supabase.realtime.decodeRecord
import io.github.jan.supabase.realtime.PostgresAction.Insert
import io.github.jan.supabase.realtime.PostgresAction.Update
import io.github.jan.supabase.realtime.PostgresAction.Delete
import io.github.jan.supabase.realtime.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth

class CalendarViewModel(application: Application) : AndroidViewModel(application) {
    var selectedDate = mutableStateOf(LocalDate.now())
        private set

    var currentMonth = mutableStateOf(YearMonth.now())
        private set

    private val _events = mutableStateListOf<CalendarEvent>()
    val events: List<CalendarEvent> get() = _events

    var selectedSpaceId = mutableStateOf<String?>(null)
        private set

    private var realtimeJob: Job? = null
    private val _isLoading = mutableStateOf(false)
    val isLoading get() = _isLoading.value

    init {
        fetchEvents()
    }

    fun selectDate(date: LocalDate) {
        selectedDate.value = date
    }

    fun nextMonth() {
        currentMonth.value = currentMonth.value.plusMonths(1)
    }

    fun previousMonth() {
        currentMonth.value = currentMonth.value.minusMonths(1)
    }

    fun selectSpace(spaceId: String?) {
        selectedSpaceId.value = spaceId
        fetchEvents()
    }

    fun fetchEvents() {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return

        realtimeJob?.cancel()
        _isLoading.value = true

        viewModelScope.launch {
            try {
                val results = SupabaseManager.client.from("calendar_events")
                    .select {
                        filter {
                            if (selectedSpaceId.value == null) {
                                eq("user_id", userId)
                            } else {
                                eq("space_id", selectedSpaceId.value!!)
                            }
                        }
                    }
                    .decodeList<CalendarEvent>()

                val filtered = if (selectedSpaceId.value == null) {
                    results.filter { it.spaceId == null }
                } else results

                _events.clear()
                _events.addAll(filtered)

                setupRealtimeListener(userId)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun setupRealtimeListener(userId: String) {
        val currentSpaceId = selectedSpaceId.value
        val channel = SupabaseManager.client.realtime.channel("events_channel_$currentSpaceId")

        realtimeJob = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
            table = "calendar_events"
        }.onEach { action: PostgresAction ->
            when (action) {
                is PostgresAction.Insert -> {
                    val newEvent = action.decodeRecord<CalendarEvent>()
                    if (currentSpaceId == newEvent.spaceId || (currentSpaceId == null && newEvent.spaceId == null && newEvent.userId == userId)) {
                        if (_events.none { it.id == newEvent.id }) {
                            _events.add(newEvent)
                            
                            // Trigger notification if created by someone else
                            if (newEvent.userId != userId) {
                                com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                    getApplication(),
                                    "Nuevo Evento 📅",
                                    "Se programó el evento '${newEvent.title}' para el ${newEvent.eventDate}.",
                                    "calendar"
                                )
                            }
                        }
                    }
                }
                is PostgresAction.Update -> {
                    val updated = action.decodeRecord<CalendarEvent>()
                    val idx = _events.indexOfFirst { it.id == updated.id }
                    if (idx != -1) {
                        _events[idx] = updated
                        
                        if (updated.userId != userId) {
                            com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                getApplication(),
                                "Evento Modificado 📅",
                                "Se actualizó el evento '${updated.title}'.",
                                "calendar"
                            )
                        }
                    }
                }
                is PostgresAction.Delete -> {
                    val deletedId = action.oldRecord["id"]?.toString()?.replace("\"", "")
                    if (deletedId != null) {
                        _events.removeIf { it.id == deletedId }
                    }
                }
                else -> {}
            }
        }.launchIn(viewModelScope)

        viewModelScope.launch { channel.subscribe() }
    }

    fun addEvent(title: String, description: String, date: LocalDate, startTime: String? = null, endTime: String? = null, category: String = "General", color: String = "primary") {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return

        viewModelScope.launch {
            try {
                val newEvent = CalendarEvent(
                    userId = userId,
                    title = title,
                    description = description,
                    eventDate = date.toString(),
                    startTime = startTime,
                    endTime = endTime,
                    category = category,
                    color = color,
                    spaceId = selectedSpaceId.value
                )
                val inserted = SupabaseManager.client.from("calendar_events").insert(newEvent) {
                    select()
                }.decodeSingle<CalendarEvent>()

                _events.add(inserted)
            } catch (e: Exception) {
                e.printStackTrace()
                fetchEvents()
            }
        }
    }

    fun deleteEvent(eventId: String) {
        viewModelScope.launch {
            try {
                SupabaseManager.client.from("calendar_events").delete {
                    filter {
                        eq("id", eventId)
                    }
                }
                _events.removeIf { it.id == eventId }
            } catch (e: Exception) {
                e.printStackTrace()
                fetchEvents()
            }
        }
    }
}
