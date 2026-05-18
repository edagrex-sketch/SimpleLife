package com.vidasimple

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.vidasimple.designsystem.*
import com.vidasimple.navigation.VidaSimpleNavGraph
import com.vidasimple.navigation.Screen
import com.vidasimple.navigation.bottomNavItems
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.vidasimple.notifications.FcmTokenManager
import kotlinx.coroutines.launch
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import io.github.jan.supabase.gotrue.auth

class MainActivity : ComponentActivity() {
    companion object {
        var triggerAICoachDirectly = false
    }

    private val pendingNavigation = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        
        // Parse deep link destination from the launcher intent
        intent?.getStringExtra("navigate_to")?.let {
            pendingNavigation.value = it
        }

        enableEdgeToEdge()
        setContent {
            val themeViewModel: com.vidasimple.designsystem.ThemeViewModel = viewModel()

            VidaSimpleTheme(darkTheme = themeViewModel.isDarkMode) {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                val showBottomBar = bottomNavItems.any { it.route == currentRoute }

                val scope = rememberCoroutineScope()
                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { isGranted ->
                    if (isGranted) scope.launch { FcmTokenManager.registerCurrentToken() }
                }

                // Handle pending deep link navigation
                LaunchedEffect(pendingNavigation.value, navController) {
                    pendingNavigation.value?.let { route ->
                        com.vidasimple.data.supabase.SupabaseManager.client.auth.awaitInitialization()
                        val isUserLoggedIn = com.vidasimple.data.supabase.SupabaseManager.client.auth.currentUserOrNull() != null
                        val targetRoute = if (!isUserLoggedIn) {
                            "login"
                        } else if (route == "home_ai") {
                            triggerAICoachDirectly = true
                            "home"
                        } else {
                            route
                        }
                        navController.navigate(targetRoute) {
                            launchSingleTop = true
                        }
                        pendingNavigation.value = null // Consume deep link
                    }
                }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        if (ContextCompat.checkSelfPermission(
                                this@MainActivity, Manifest.permission.POST_NOTIFICATIONS
                            ) != PackageManager.PERMISSION_GRANTED
                        ) {
                            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        } else {
                            FcmTokenManager.registerCurrentToken()
                        }
                    } else {
                        FcmTokenManager.registerCurrentToken()
                    }

                    // GENERATE WIDGET PREVIEWS

                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = MaterialTheme.colorScheme.background,
                    bottomBar = {
                        if (showBottomBar) {
                            PremiumGlassNavBar(
                                currentRoute = currentRoute,
                                onNavigate = { route ->
                                    if (currentRoute != route) {
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
                    VidaSimpleNavGraph(
                        navController  = navController,
                        innerPadding   = innerPadding,
                        themeViewModel = themeViewModel
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        intent.getStringExtra("navigate_to")?.let {
            pendingNavigation.value = it
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────
//  PREMIUM GLASSMORPHISM NAV BAR
//  Inspired by: AnimatedBottomBar (Droppers) + ExpandableBottomBar
// ──────────────────────────────────────────────────────────────────────────
@Composable
fun PremiumGlassNavBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val isDark = MaterialTheme.colorScheme.background == DarkBg

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        // Glass pill container
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(70.dp)
                .shadow(
                    elevation   = 24.dp,
                    shape       = RoundedCornerShape(35.dp),
                    spotColor   = VioletPrimary.copy(alpha = 0.3f),
                    ambientColor = VioletPrimary.copy(alpha = 0.1f)
                )
                .clip(RoundedCornerShape(35.dp))
                .background(
                    if (isDark)
                        DarkSurface.copy(alpha = 0.92f)
                    else
                        LightSurface.copy(alpha = 0.96f)
                )
        ) {
            // Subtle top-shine line
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(
                        Brush.horizontalGradient(
                            listOf(
                                Color.Transparent,
                                Color.White.copy(alpha = if (isDark) 0.06f else 0.5f),
                                Color.Transparent
                            )
                        )
                    )
            )

            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment     = Alignment.CenterVertically
            ) {
                bottomNavItems.forEach { screen ->
                    val isSelected = currentRoute == screen.route
                    NavBarItem(
                        screen     = screen,
                        isSelected = isSelected,
                        onClick    = { onNavigate(screen.route) }
                    )
                }
            }
        }
    }
}

@Composable
fun NavBarItem(
    screen: Screen,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }

    // Animations inspired by elastic/spring physics
    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.15f else 1f,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = Spring.StiffnessMediumLow),
        label = "navScale"
    )
    val iconColor by animateColorAsState(
        targetValue = if (isSelected) VioletLight else MaterialTheme.colorScheme.onSurfaceVariant,
        animationSpec = tween(220),
        label = "navColor"
    )
    val bgAlpha by animateFloatAsState(
        targetValue = if (isSelected) 1f else 0f,
        animationSpec = tween(200),
        label = "bgAlpha"
    )

    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .clickable(interactionSource = interactionSource, indication = null) { onClick() }
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(contentAlignment = Alignment.Center) {
            // Background pill for selected state
            if (bgAlpha > 0f) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                listOf(VioletPrimary.copy(alpha = 0.18f * bgAlpha), Color.Transparent)
                            )
                        )
                )
            }
            Icon(
                imageVector       = screen.icon,
                contentDescription = screen.title,
                tint              = iconColor,
                modifier          = Modifier
                    .size(24.dp)
                    .scale(scale)
            )
        }

        // Dot indicator below icon
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .size(width = 20.dp, height = 3.dp)
                .clip(CircleShape)
                .background(
                    Brush.horizontalGradient(
                        listOf(
                            VioletPrimary.copy(alpha = bgAlpha),
                            TealAccent.copy(alpha = bgAlpha)
                        )
                    )
                )
        )
    }
}
