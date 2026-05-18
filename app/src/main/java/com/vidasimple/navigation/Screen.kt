package com.vidasimple.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Inicio", Icons.Default.Home)
    object Tasks : Screen("tasks", "Tareas", Icons.Default.List)
    object Calendar : Screen("calendar", "Calendario", Icons.Default.DateRange)
    object Expenses : Screen("expenses", "Gastos", Icons.Default.ShoppingCart)
    object Profile : Screen("profile", "Perfil", Icons.Default.Person)
    
    // Auth Screens
    object Login : Screen("login", "Iniciar Sesión", Icons.Default.Login)
    object Register : Screen("register", "Registro", Icons.Default.AppRegistration)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Tasks,
    Screen.Calendar,
    Screen.Expenses,
    Screen.Profile
)
