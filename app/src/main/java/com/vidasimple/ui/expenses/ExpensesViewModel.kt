package com.vidasimple.ui.expenses

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import com.vidasimple.domain.model.Expense
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

class ExpensesViewModel(application: android.app.Application) : androidx.lifecycle.AndroidViewModel(application) {
    private val _expenses = mutableStateListOf<Expense>()
    val expenses: List<Expense> get() = _expenses

    private val _allExpenses = mutableListOf<Expense>()

    val totalSpent: Double
        get() = _expenses.sumOf { it.amount }

    val totalExpensesToday: Double
        get() = _expenses.filter { 
            it.date == java.time.LocalDate.now().toString() 
        }.sumOf { it.amount }

    private var _limit = mutableStateOf(500.0)
    val limit: Double get() = _limit.value

    fun updateLimit(newLimit: Double) {
        _limit.value = newLimit
        syncWidget()
    }

    // Selected Month (1 to 12)
    var selectedMonth = mutableStateOf(java.time.LocalDate.now().monthValue)
        private set

    // Savings Goal
    private val _savingsGoal = mutableStateOf(100.0)
    val savingsGoal: Double get() = _savingsGoal.value

    fun updateSavingsGoal(goal: Double) {
        _savingsGoal.value = goal
    }

    fun selectMonth(month: Int) {
        selectedMonth.value = month
        updateFilteredExpenses()
    }
    
    var selectedSpaceId = mutableStateOf<String?>(null)
        private set
        
    private var realtimeJob: Job? = null
    private val _isLoading = mutableStateOf(false)
    val isLoading get() = _isLoading.value

    init {
        fetchExpenses()
    }

    fun fetchExpenses() {
        val userId = SupabaseManager.client.auth.currentUserOrNull()?.id ?: return
        
        realtimeJob?.cancel()
        _isLoading.value = true

        viewModelScope.launch {
            try {
                val results = SupabaseManager.client.from("expenses")
                    .select {
                        filter {
                            if (selectedSpaceId.value == null) {
                                eq("user_id", userId)
                            } else {
                                eq("space_id", selectedSpaceId.value!!)
                            }
                        }
                    }
                    .decodeList<Expense>()
                
                val filteredExpenses = if (selectedSpaceId.value == null) {
                    results.filter { it.spaceId == null }
                } else {
                    results.filter { it.spaceId == selectedSpaceId.value }
                }

                _allExpenses.clear()
                _allExpenses.addAll(filteredExpenses)
                
                updateFilteredExpenses()
                syncWidget()
                setupRealtimeListener(userId)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun updateFilteredExpenses() {
        val currentYear = java.time.LocalDate.now().year
        val filtered = _allExpenses.filter { expense ->
            val dateStr = expense.date ?: ""
            if (dateStr.length >= 7) {
                val year = dateStr.substring(0, 4).toIntOrNull()
                val month = dateStr.substring(5, 7).toIntOrNull()
                year == currentYear && month == selectedMonth.value
            } else {
                true
            }
        }
        _expenses.clear()
        _expenses.addAll(filtered)
    }

    private fun setupRealtimeListener(userId: String) {
        val currentSpaceId = selectedSpaceId.value
        val channel = SupabaseManager.client.realtime.channel("expenses_channel_$currentSpaceId")
        
        realtimeJob = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
            table = "expenses"
        }.onEach { action: PostgresAction ->
            when (action) {
                is PostgresAction.Insert -> {
                    val newExpense = action.decodeRecord<Expense>()
                    if (currentSpaceId == newExpense.spaceId || (currentSpaceId == null && newExpense.spaceId == null && newExpense.userId == userId)) {
                        if (_allExpenses.none { it.id == newExpense.id }) {
                            _allExpenses.add(0, newExpense)
                            updateFilteredExpenses()
                            
                            // Send notification if created by someone else
                            if (newExpense.userId != userId) {
                                com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                    getApplication(),
                                    "Nuevo Gasto Registrado 💸",
                                    "Se registró un gasto por $${String.format("%.2f", newExpense.amount)}: '${newExpense.title}'.",
                                    "expenses"
                                )
                            }
                        }
                    }
                }
                is PostgresAction.Update -> {
                    val updated = action.decodeRecord<Expense>()
                    val idx = _allExpenses.indexOfFirst { it.id == updated.id }
                    if (idx != -1) {
                        _allExpenses[idx] = updated
                        updateFilteredExpenses()
                        
                        if (updated.userId != userId) {
                            com.vidasimple.notifications.LocalNotificationHelper.showNotification(
                                getApplication(),
                                "Gasto Actualizado 💸",
                                "Se actualizó el gasto '${updated.title}'.",
                                "expenses"
                            )
                        }
                    }
                }
                is PostgresAction.Delete -> {
                    val deletedId = action.oldRecord["id"]?.toString()?.replace("\"", "")
                    if (deletedId != null) {
                        _allExpenses.removeIf { it.id == deletedId }
                        updateFilteredExpenses()
                    }
                }
                else -> {}
            }
            syncWidget()
        }.launchIn(viewModelScope)
        
        viewModelScope.launch { channel.subscribe() }
    }

    fun selectSpace(spaceId: String?) {
        selectedSpaceId.value = spaceId
        fetchExpenses()
    }

    fun addExpense(title: String, amount: Double, category: String, creatorId: String? = null, targetSpaceId: String? = selectedSpaceId.value) {
        val userId = creatorId ?: SupabaseManager.client.auth.currentUserOrNull()?.id ?: return
        
        viewModelScope.launch {
            try {
                val newExpense = Expense(
                    userId = userId,
                    title = title,
                    amount = amount,
                    category = category,
                    date = java.time.LocalDate.now().toString(),
                    spaceId = targetSpaceId
                )
                val insertedExpense = SupabaseManager.client.from("expenses").insert(newExpense) {
                    select()
                }.decodeSingle<Expense>()
                
                _allExpenses.add(0, insertedExpense)
                updateFilteredExpenses()
                syncWidget()

                // Log activity if inside a shared space
                if (insertedExpense.spaceId != null) {
                    val activity = com.vidasimple.domain.model.SpaceActivity(
                        spaceId     = insertedExpense.spaceId,
                        userId      = userId,
                        action      = "expense_added",
                        entityTitle = insertedExpense.title
                    )
                    SupabaseManager.client.from("space_activity").insert(activity)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                fetchExpenses()
            }
        }
    }

    private fun syncWidget() {
        com.vidasimple.data.widget.WidgetCacheHelper.updateExpenses(
            context = getApplication(),
            todaySpent = totalExpensesToday,
            monthSpent = totalSpent,
            limit = limit
        )
    }
}
