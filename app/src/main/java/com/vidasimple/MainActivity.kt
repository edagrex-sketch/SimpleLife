package com.vidasimple

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.work.*
import com.vidasimple.designsystem.*
import com.vidasimple.navigation.*
import com.vidasimple.notifications.FcmTokenManager
import com.vidasimple.workers.AutoScheduleWorker
import com.vidasimple.workers.InsightsWorker
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        installSplashScreen()

        // ── Schedule Auto-Balanceo Worker ────────────────────────────
        val workRequest = PeriodicWorkRequestBuilder<AutoScheduleWorker>(24, TimeUnit.HOURS).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "AutoScheduleWorker",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )

        // ── Schedule VidaSimple Insights Worker ──────────────────────
        InsightsWorker.schedule(this)

        // ── Process deep link intent ────────────────────────────────
        val pendingNavigation = intent?.getStringExtra("navigate_to") ?: ""

        setContent {
            VidaSimpleTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                val themeViewModel: ThemeViewModel = viewModel()
                val scope = rememberCoroutineScope()

                val isAuthScreen = currentRoute in listOf(
                    Screen.Login.route,
                    Screen.Register.route
                )

                // ── Permission handling ────────────────────────────
                val launcher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { granted ->
                    if (granted) {
                        scope.launch {
                            FcmTokenManager.registerCurrentToken()
                        }
                    }
                }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    } else {
                        FcmTokenManager.registerCurrentToken()
                    }
                }

                // ── Handle deep linking ────────────────────────────
                LaunchedEffect(Unit) {
                    delay(300)
                    if (pendingNavigation == "home") {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                    if (pendingNavigation == "open_ai_coach") {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                }

                // ── Toast Manager ──────────────────────────────────
                val toastMessage = PremiumToastManager.message
                var toastVisible by remember { mutableStateOf(false) }

                LaunchedEffect(toastMessage) {
                    if (toastMessage != null) {
                        toastVisible = true
                        delay(3000)
                        toastVisible = false
                        PremiumToastManager.clear()
                    }
                }

                Scaffold(
                    containerColor = MaterialTheme.colorScheme.background,
                    bottomBar = {
                        if (!isAuthScreen) {
                            PremiumGlassNavBar(
                                items = bottomNavItems,
                                currentRoute = currentRoute,
                                onNavigate = { route ->
                                    if (route != currentRoute) {
                                        navController.navigate(route) {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                }
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.fillMaxSize()) {
                        VidaSimpleNavGraph(
                            navController = navController,
                            innerPadding = innerPadding,
                            startDestination = if (currentRoute != null) currentRoute else Screen.Login.route,
                            themeViewModel = themeViewModel
                        )

                        // ── Dynamic Island Toast ────────────────────
                        AnimatedVisibility(
                            visible = toastVisible && toastMessage != null,
                            enter = slideInVertically(
                                initialOffsetY = { -it },
                                animationSpec = spring(
                                    dampingRatio = Spring.DampingRatioMediumBouncy,
                                    stiffness = Spring.StiffnessMedium
                                )
                            ) + fadeIn(),
                            exit = slideOutVertically(
                                targetOffsetY = { -it },
                                animationSpec = tween(300)
                            ) + fadeOut(),
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .padding(top = 50.dp, start = 40.dp, end = 40.dp)
                        ) {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(28.dp))
                                    .background(
                                        Brush.linearGradient(
                                            listOf(
                                                VioletPrimary,
                                                VioletDark
                                            )
                                        )
                              
