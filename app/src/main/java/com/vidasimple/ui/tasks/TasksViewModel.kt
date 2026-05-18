package com.vidasimple.ui.tasks

import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Task
import com.vidasimple.domain.model.TaskPriority
import com.vidasimple.domain.model.Profile
import com.vidasimple.domain.model.SpaceActivity
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.query.Columns
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

class TasksViewModel(application: android.app.Application) : androidx.lifecycle.AndroidViewModel(application) {
    private val _tasks = mutableStateListOf<Task>()
    val tasks: List<Task> get() = _tasks
    
    var currentFilter = mutableStateOf(TaskPriority.NONE)
        private set

    val pendingTasks by derivedStateOf { 
        _tasks.filter { !(it.isDone ?: false) && (currentFilter.value == TaskPriority.NONE || it.priority == currentFilter.value) } 
    }

    val completedTasks by derivedStateOf { 
        _tasks.filter { it.isDone ?: false } 
    }

    private val _profiles = mutableStateListOf<Profile>()
    val profiles: List<Profile> get() = _profiles

    init {
        fetchTasks()
        fetchProfiles()
    }

    var selectedSpaceId = mutableStateOf<String?>(null)
        private set
        
    private var realtimeJob: Job? = null
    
    private val _isLoading = mutableStateOf(false)
    val isLoading get() = _isLoading.value
    
    var message by mutableStateOf<String?>(null)
        private set

    fun clearMessage() { message = null }

    fun fetchTasks() {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return
        
        // Cancel previous realtime listener
        realtimeJob?.cancel()
        _isLoading.value = true

        viewModelScope.launch {
            try {
                val results = SupabaseManager.client.from("tasks")
                    .select {
                        filter {
                            if (selectedSpaceId.value == null) {
                                eq("user_id", userId)
                            } else {
                                eq("space_id", selectedSpaceId.value!!)
                            }
                        }
                        order("created_at", Order.DESCENDING)
                    }
                    .decodeList<Task>()
                
                val filteredTasks = if (selectedSpaceId.value == null) {
                    results.filter { it.spaceId == null }
                } else results

                _tasks.clear()
                _tasks.addAll(filteredTasks)
                syncWidget()
                
                // Start Realtime listener for this space
                setupRealtimeListener(userId)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun fetchProfiles() {
        viewModelScope.launch {
            try {
                val results = SupabaseManager.client.from("profiles")
                    .select()
                    .decodeList<Profile>()
                _profiles.clear()
                _profiles.addAll(results)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun setupRealtimeListener(userId: String) {
        val currentSpaceId = selectedSpaceId.value
        
        val channel = SupabaseManager.client.realtime.channel("tasks_channel_$currentSpaceId")
        realtimeJob = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
            table = "tasks"
        }.onEach { action: PostgresAction ->
            when (action) {
                is PostgresAction.Insert -> {
                    val newTask = action.decodeRecord<Task>()
                    if (currentSpaceId == newTask.spaceId || (currentSpaceId == null && newTask.spaceId == null && newTask.userId == userId)) {
                        if (_tasks.none { it.id == newTask.id }) {
                            _tasks.add(0, newTask)
                            
                            // Send notification if created by someone else
                            if (newTask.userId != userId) {
                                com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                    getApplication(),
                                    "Nueva Tarea 📝",
                                    "Se ha creado la tarea '${newTask.title}' en tu espacio compartido.",
                                    "tasks"
                                )
                            }
                        }
                    }
                }
                is PostgresAction.Update -> {
                    val updatedTask = action.decodeRecord<Task>()
                    val index = _tasks.indexOfFirst { it.id == updatedTask.id }
                    if (index != -1) {
                        val oldTask = _tasks[index]
                        _tasks[index] = updatedTask
                        
                        if (updatedTask.userId != userId) {
                            if (updatedTask.isDone == true && oldTask.isDone != true) {
                                com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                    getApplication(),
                                    "Tarea Completada ✅",
                                    "Se completó la tarea '${updatedTask.title}'.",
                                    "tasks"
                                )
                            } else {
                                com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                    getApplication(),
                                    "Tarea Actualizada 📝",
                                    "Se actualizó la tarea '${updatedTask.title}'.",
                                    "tasks"
                                )
                            }
                        }
                    }
                }
                is PostgresAction.Delete -> {
                    val deletedId = action.oldRecord["id"]?.toString()?.replace("\"", "")
                    if (deletedId != null) {
                        _tasks.removeIf { it.id == deletedId }
                    }
                }
                else -> {}
            }
            syncWidget()
        }.launchIn(viewModelScope)
        
        viewModelScope.launch {
            channel.subscribe()
        }
    }

    fun selectSpace(spaceId: String?) {
        selectedSpaceId.value = spaceId
        fetchTasks()
        fetchProfiles()
    }

    fun addTask(title: String, priority: TaskPriority, project: String = "General", assignedToId: String? = null) {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: return
        val userId = user.id
        
        viewModelScope.launch {
            try {
                val newTask = Task(
                    userId = userId,
                    title = title,
                    priority = priority,
                    isDone = false,
                    description = "",
                    project = project,
                    spaceId = selectedSpaceId.value,
                    assignedToId = assignedToId
                )
                
                val insertedTask = SupabaseManager.client.from("tasks").insert(newTask) {
                    select()
                }.decodeSingle<Task>()
                
                if (_tasks.none { it.id == insertedTask.id }) {
                    _tasks.add(0, insertedTask)
                }
                message = "Tarea creada"
                syncWidget()
                
                // Log activity if inside a shared space
                if (insertedTask.spaceId != null) {
                    val activity = SpaceActivity(
                        spaceId     = insertedTask.spaceId,
                        userId      = userId,
                        action      = "task_created",
                        entityTitle = insertedTask.title
                    )
                    SupabaseManager.client.from("space_activity").insert(activity)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                message = "Error: ${e.message}"
                fetchTasks()
            }
        }
    }

    fun toggleTaskDone(task: Task) {
        val isDone = task.isDone ?: false
        val currentUserId = SupabaseManager.client.auth.currentUserOrNull()?.id
        val updatedTask = task.copy(
            isDone = !isDone,
            completedById = if (!isDone) currentUserId else null
        )
        
        viewModelScope.launch {
            try {
                SupabaseManager.client.from("tasks").update(updatedTask) {
                    filter {
                        eq("id", task.id ?: "")
                    }
                }
                val index = _tasks.indexOfFirst { it.id == task.id }
                if (index != -1) {
                    _tasks[index] = updatedTask
                }
                syncWidget()
                
                // Log activity if inside a shared space and completing the task
                if (updatedTask.spaceId != null && !isDone && currentUserId != null) {
                    val activity = SpaceActivity(
                        spaceId     = updatedTask.spaceId,
                        userId      = currentUserId,
                        action      = "task_completed",
                        entityTitle = updatedTask.title
                    )
                    SupabaseManager.client.from("space_activity").insert(activity)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun setFilter(priority: TaskPriority) {
        currentFilter.value = priority
    }

    fun addTaskWithDate(title: String, priority: TaskPriority, dueDate: String, project: String = "General") {
        val user = SupabaseManager.client.auth.currentUserOrNull() ?: return
        val userId = user.id
        
        viewModelScope.launch {
            try {
                val newTask = Task(
                    userId = userId,
                    title = title,
                    priority = priority,
                    isDone = false,
                    description = "",
                    project = project,
                    dueDate = dueDate,
                    spaceId = selectedSpaceId.value
                )
                
                val insertedTask = SupabaseManager.client.from("tasks").insert(newTask) {
                    select()
                }.decodeSingle<Task>()
                
                if (_tasks.none { it.id == insertedTask.id }) {
                    _tasks.add(0, insertedTask)
                }
                message = "Tarea por voz creada"
                syncWidget()
            } catch (e: Exception) {
                e.printStackTrace()
                message = "Error en voz: ${e.message}"
                fetchTasks()
            }
        }
    }

    fun deleteTask(task: Task) {
        viewModelScope.launch {
            try {
                SupabaseManager.client.from("tasks").delete {
                    filter {
                        eq("id", task.id ?: "")
                    }
                }
                _tasks.removeIf { it.id == task.id }
                syncWidget()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun syncWidget() {
        val topTasks = pendingTasks.take(3)
        val titles = topTasks.map { it.title ?: "" }
        val priorities = topTasks.map { it.priority?.label ?: "Media" }
        com.vidasimple.data.widget.WidgetCacheHelper.updateTasks(
            context = getApplication(),
            pendingCount = pendingTasks.size,
            titles = titles,
            priorities = priorities
        )
    }
}
