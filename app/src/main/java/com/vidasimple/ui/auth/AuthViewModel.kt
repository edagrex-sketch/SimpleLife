package com.vidasimple.ui.auth

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vidasimple.data.supabase.SupabaseManager
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import com.vidasimple.notifications.FcmTokenManager

class AuthViewModel : ViewModel() {
    private val _isLoading = mutableStateOf(false)
    val isLoading: State<Boolean> = _isLoading

    private val _error = mutableStateOf<String?>(null)
    val error: State<String?> = _error

    private val _successMessage = mutableStateOf<String?>(null)
    val successMessage: State<String?> = _successMessage

    private val _isLoggedIn = mutableStateOf(false)
    val isLoggedIn: State<Boolean> = _isLoggedIn

    init {
        viewModelScope.launch {
            val session = SupabaseManager.client.auth.currentSessionOrNull()
            _isLoggedIn.value = session != null
        }
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun cleanErrorMessage(message: String?): String {
        if (message == null) return "Error desconocido"
        return when {
            message.contains("Invalid login credentials") -> "Email o contraseña incorrectos"
            message.contains("Email not confirmed") -> "Por favor, confirma tu correo electrónico"
            message.contains("User already registered") -> "Este correo ya está registrado"
            message.contains("Password should be") -> "La contraseña es muy corta (mínimo 6 caracteres)"
            else -> message.split("\n").firstOrNull() ?: "Ocurrió un error inesperado"
        }
    }

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        if (email.isBlank() || pass.isBlank()) {
            _error.value = "Por favor, rellena todos los campos"
            return
        }

        if (!isValidEmail(email)) {
            _error.value = "Formato de correo no válido"
            return
        }

        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                SupabaseManager.client.auth.signInWith(Email) {
                    this.email = email
                    password = pass
                }
                _isLoggedIn.value = true
                _successMessage.value = "¡Bienvenido de nuevo!"
                viewModelScope.launch {
                    FcmTokenManager.registerCurrentToken()
                }
                onSuccess()
            } catch (e: Exception) {
                _error.value = cleanErrorMessage(e.message)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun signUp(email: String, pass: String, name: String, termsAccepted: Boolean, onSuccess: () -> Unit) {
        if (!termsAccepted) {
            _error.value = "Debes aceptar los términos y condiciones"
            return
        }

        if (email.isBlank() || pass.isBlank() || name.isBlank()) {
            _error.value = "Todos los campos son obligatorios"
            return
        }

        if (!isValidEmail(email)) {
            _error.value = "El correo electrónico no es válido"
            return
        }

        if (pass.length < 6) {
            _error.value = "La contraseña debe tener al menos 6 caracteres"
            return
        }

        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                SupabaseManager.client.auth.signUpWith(Email) {
                    this.email = email
                    password = pass
                    data = buildJsonObject {
                        put("name", name)
                    }
                }
                _successMessage.value = "¡Cuenta creada con éxito!"
                _isLoggedIn.value = true 
                viewModelScope.launch {
                    FcmTokenManager.registerCurrentToken()
                }
                onSuccess()
            } catch (e: Exception) {
                _error.value = cleanErrorMessage(e.message)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun clearMessages() {
        _error.value = null
        _successMessage.value = null
    }

    fun logout(onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                SupabaseManager.client.auth.signOut()
                _isLoggedIn.value = false
                onSuccess()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
