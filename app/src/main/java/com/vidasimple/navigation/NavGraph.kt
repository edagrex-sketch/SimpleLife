package com.vidasimple.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import com.vidasimple.ui.auth.LoginScreen
import com.vidasimple.ui.auth.RegisterScreen
import com.vidasimple.ui.home.HomeScreen
import com.vidasimple.ui.tasks.TasksScreen
import com.vidasimple.ui.calendar.CalendarScreen
import com.vidasimple.ui.expenses.ExpensesScreen
import com.vidasimple.ui.profile.ProfileScreen

import androidx.compose.ui.platform.LocalContext
import androidx.activity.ComponentActivity
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.ThemeViewModel
import com.vidasimple.ui.tasks.TasksViewModel
import com.vidasimple.ui.expenses.ExpensesViewModel

@Composable
fun VidaSimpleNavGraph(
    navController: NavHostController, 
    innerPadding: PaddingValues,
    startDestination: String = Screen.Login.route,
    themeViewModel: ThemeViewModel = viewModel()
) {
    val activity = LocalContext.current as ComponentActivity
    val tasksViewModel: TasksViewModel = viewModel(activity)
    val expensesViewModel: ExpensesViewModel = viewModel(activity)

    NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = {
            slideInHorizontally(
                initialOffsetX = { it },
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            ) + fadeIn(
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            )
        },
        exitTransition = {
            slideOutHorizontally(
                targetOffsetX = { -it / 3 },
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            ) + fadeOut(
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            )
        },
        popEnterTransition = {
            slideInHorizontally(
                initialOffsetX = { -it / 3 },
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            ) + fadeIn(
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            )
        },
        popExitTransition = {
            slideOutHorizontally(
                targetOffsetX = { it },
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            ) + fadeOut(
                animationSpec = spring(
                    dampingRatio = 0.85f,
                    stiffness = 220f
                )
            )
        }
    ) {
        // Auth
        composable(Screen.Login.route) { 
            LoginScreen(
                onLoginSuccess = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            ) 
        }
        composable(Screen.Register.route) { 
            RegisterScreen(
                onRegisterSuccess = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.navigate(Screen.Login.route) }
            ) 
        }

        // Main App
        composable(Screen.Home.route) { 
            HomeScreen(innerPadding, tasksViewModel = tasksViewModel, expensesViewModel = expensesViewModel) 
        }
        composable(Screen.Tasks.route) { 
            TasksScreen(innerPadding, viewModel = tasksViewModel) 
        }
        composable(Screen.Calendar.route) { 
            CalendarScreen(innerPadding) 
        }
        composable(Screen.Expenses.route) { 
            ExpensesScreen(innerPadding, viewModel = expensesViewModel) 
        }
        composable(Screen.Profile.route) { 
            ProfileScreen(
                innerPadding, 
                themeViewModel = themeViewModel,
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            ) 
        }
    }
}
