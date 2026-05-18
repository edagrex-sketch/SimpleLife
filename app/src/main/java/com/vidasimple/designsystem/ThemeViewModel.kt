package com.vidasimple.designsystem

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel

class ThemeViewModel : ViewModel() {
    private val _isDarkMode = mutableStateOf(false)
    val isDarkMode: Boolean get() = _isDarkMode.value

    fun toggleDarkMode(enabled: Boolean) {
        _isDarkMode.value = enabled
    }
}
