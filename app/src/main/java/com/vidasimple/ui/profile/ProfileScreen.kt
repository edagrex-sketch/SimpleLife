package com.vidasimple.ui.profile

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*
import com.vidasimple.ui.common.UserAvatar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    innerPadding: PaddingValues,
    viewModel: ProfileViewModel = viewModel(),
    themeViewModel: ThemeViewModel = viewModel(),
    onLogout: () -> Unit = {}
) {
    val background   = MaterialTheme.colorScheme.background
    val isDark       = background == DarkBg
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) { viewModel.refreshData() }

    viewModel.statusMessage.value?.let { message ->
        LaunchedEffect(message) {
            snackbarHostState.showSnackbar(message)
            viewModel.clearStatusMessage()
        }
    }

    Scaffold(
        containerColor = background,
        modifier       = Modifier.padding(bottom = innerPadding.calculateBottomPadding()),
        snackbarHost   = { SnackbarHost(snackbarHostState) }
    ) { screenPadding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(screenPadding),
            contentPadding = PaddingValues(bottom = 40.dp)
        ) {
            // ── Profile Hero ──────────────────────────────────────────────
            item {
                ProfileHeroSection(
                    name  = viewModel.userName.value,
                    email = viewModel.userEmail.value,
                    isDark = isDark
                )
            }

            // ── Stats Cards ───────────────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    PremiumStatBadge(
                        value    = "${viewModel.completedTasksCount.value}",
                        label    = "Completadas",
                        icon     = Icons.Default.CheckCircle,
                        gradient = GradientViolet,
                        modifier = Modifier.weight(1f)
                    )
                    PremiumStatBadge(
                        value    = "${viewModel.streak.value}",
                        label    = "Días racha 🔥",
                        icon     = Icons.Default.Whatshot,
                        gradient = GradientGold,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // ── VidaSimple Insights ───────────────────────────────────────
            item {
                ProfileSectionLabel("VidaSimple Insights", color = TealAccent)
                PremiumCard(modifier = Modifier.padding(horizontal = 20.dp)) {
                    PremiumRow(
                        title    = "Briefing Diario ☀️",
                        icon     = Icons.Default.AutoAwesome,
                        gradient = listOf(TealAccent, VioletPrimary),
                        trailing = {
                            PremiumSwitch(
                                checked  = viewModel.insightsEnabled.value,
                                onCheckedChange = { viewModel.toggleInsights(it) },
                                activeColor = TealAccent
                            )
                        }
                    )
                    PremiumDivider()
                    PremiumRow(
                        title    = "Programado para las 7:00 AM",
                        icon     = Icons.Default.Schedule,
                        gradient = listOf(Color(0xFF8B5CF6), TealAccent),
                        onClick  = { }
                    )
                }
            }

            // ── Settings ─────────────────────────────────────────────────
            item {
                ProfileSectionLabel("Configuración")
                PremiumCard(modifier = Modifier.padding(horizontal = 20.dp)) {
                    PremiumRow(
                        title    = "Notificaciones",
                        icon     = Icons.Default.Notifications,
                        gradient = GradientViolet,
                        trailing = {
                            PremiumSwitch(
                                checked  = viewModel.notificationsEnabled.value,
                                onCheckedChange = { viewModel.toggleNotifications(it) },
                                activeColor = VioletPrimary
                            )
                        }
                    )
                    PremiumDivider()
                    PremiumRow(
                        title    = "Seguridad y Privacidad",
                        icon     = Icons.Default.Shield,
                        gradient = GradientTeal,
                        onClick  = { /* TODO */ }
                    )
                }
            }

            // ── Appearance ───────────────────────────────────────────────
            item {
                ProfileSectionLabel("Apariencia")
                PremiumCard(modifier = Modifier.padding(horizontal = 20.dp)) {
                    PremiumRow(
                        title    = "Modo Oscuro",
                        icon     = Icons.Default.DarkMode,
                        gradient = listOf(Color(0xFF1E1B4B), Color(0xFF312E81)),
                        trailing = {
                            PremiumSwitch(
                                checked = themeViewModel.isDarkMode,
                                onCheckedChange = { themeViewModel.toggleDarkMode(it) },
                                activeColor = VioletDark
                            )
                        }
                    )
                }
            }

            // ── Developer Tools ───────────────────────────────────────────
            item {
                ProfileSectionLabel("Desarrollador", color = MaterialTheme.colorScheme.tertiary)
                PremiumCard(modifier = Modifier.padding(horizontal = 20.dp)) {
                    PremiumRow(
                        title    = "Enviar Notificación Test",
                        icon     = Icons.Default.Send,
                        gradient = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)),
                        onClick  = { viewModel.sendTestNotification() }
                    )
                }
            }

            // ── Logout ────────────────────────────────────────────────────
            item {
                Spacer(modifier = Modifier.height(32.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .bounceClick { viewModel.signOut { onLogout() } }
                        .border(1.dp, ErrorRed.copy(alpha = 0.2f), MaterialTheme.shapes.large)
                        .shadow(12.dp, MaterialTheme.shapes.large, spotColor = ErrorRed.copy(alpha = 0.1f
