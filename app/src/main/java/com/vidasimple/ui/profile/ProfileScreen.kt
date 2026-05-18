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

            // ── Settings ─────────────────────────────────────────────────
            item {
                ProfileSectionLabel("Configuración")
                PremiumCard(modifier = Modifier.padding(horizontal = 20.dp)) {
                    PremiumRow(
                        title    = "Notificaciones",
                        icon     = Icons.Default.Notifications,
                        gradient = GradientViolet,
                        trailing = {
                            Switch(
                                checked  = viewModel.notificationsEnabled.value,
                                onCheckedChange = { viewModel.toggleNotifications(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor  = Color.White,
                                    checkedTrackColor  = VioletPrimary,
                                    uncheckedThumbColor = MaterialTheme.colorScheme.outline,
                                    uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                                )
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
                            Switch(
                                checked = themeViewModel.isDarkMode,
                                onCheckedChange = { themeViewModel.toggleDarkMode(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor  = Color.White,
                                    checkedTrackColor  = VioletDark,
                                    uncheckedThumbColor = MaterialTheme.colorScheme.outline,
                                    uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                                )
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
                        .shadow(6.dp, RoundedCornerShape(22.dp), spotColor = ErrorRed.copy(alpha = 0.2f))
                        .clip(RoundedCornerShape(22.dp))
                        .background(
                            if (isDark) Color(0xFF3F1A1A) else Color(0xFFFEF2F2)
                        )
                        .clickable { viewModel.signOut { onLogout() } }
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(ErrorRed.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Logout, null, tint = ErrorRed, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "Cerrar Sesión",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = ErrorRed
                        )
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  PROFILE HERO
// ═══════════════════════════════════════════════════════════
@Composable
fun ProfileHeroSection(name: String, email: String, isDark: Boolean) {
    Box(modifier = Modifier.fillMaxWidth()) {
        // Full gradient background
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(Brush.linearGradient(GradientViolet))
        )

        // Decorative orbs
        Box(
            modifier = Modifier
                .size(200.dp)
                .offset(x = (-50).dp, y = (-50).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )
        Box(
            modifier = Modifier
                .size(140.dp)
                .offset(x = 240.dp, y = 100.dp)
                .clip(CircleShape)
                .background(TealAccent.copy(alpha = 0.15f))
        )

        // Bottom gradient fade
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, if (isDark) DarkBg else LightBg)))
        )

        // Avatar + Info
        Column(
            modifier = Modifier
                .align(Alignment.Center)
                .statusBarsPadding()
                .padding(top = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar ring
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .border(3.dp, Brush.linearGradient(listOf(Color.White, TealAccent)), CircleShape)
                    .padding(4.dp)
                    .clip(CircleShape)
                    .shadow(16.dp, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surface) {
                    UserAvatar(
                        initial  = name.firstOrNull()?.toString() ?: "U",
                        size     = 92,
                        fontSize = 38
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                name,
                fontSize   = 22.sp,
                fontWeight = FontWeight.Black,
                color      = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                email,
                fontSize = 14.sp,
                color    = Color.White.copy(alpha = 0.7f),
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Premium badge
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.15f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Star, null, tint = Color(0xFFFBBF24), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Usuario Premium", fontSize = 13.sp, color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  STAT BADGE CARD
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumStatBadge(
    value: String,
    label: String,
    icon: ImageVector,
    gradient: List<Color>,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .shadow(8.dp, RoundedCornerShape(24.dp), spotColor = gradient.first().copy(alpha = 0.2f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Brush.linearGradient(gradient)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = Color.White, modifier = Modifier.size(22.dp))
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                value,
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                label,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  SECTION LABEL
// ═══════════════════════════════════════════════════════════
@Composable
fun ProfileSectionLabel(title: String, color: Color = VioletPrimary) {
    Text(
        text = title,
        fontSize = 13.sp,
        fontWeight = FontWeight.ExtraBold,
        color = color,
        letterSpacing = 0.8.sp,
        modifier = Modifier.padding(start = 28.dp, end = 28.dp, top = 28.dp, bottom = 10.dp)
    )
}

// ═══════════════════════════════════════════════════════════
//  PREMIUM CARD (grouped settings)
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(24.dp), spotColor = VioletPrimary.copy(alpha = 0.08f)),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(content = content)
    }
}

// ═══════════════════════════════════════════════════════════
//  PREMIUM ROW (settings item)
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumRow(
    title: String,
    icon: ImageVector,
    gradient: List<Color>,
    trailing: @Composable (() -> Unit)? = null,
    onClick: (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = onClick != null) { onClick?.invoke() }
            .padding(horizontal = 18.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(Brush.linearGradient(gradient)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = Color.White, modifier = Modifier.size(20.dp))
        }

        Spacer(modifier = Modifier.width(16.dp))

        Text(
            title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )

        if (trailing != null) {
            trailing()
        } else {
            Icon(
                Icons.Default.ChevronRight,
                null,
                tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  DIVIDER
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumDivider() {
    Divider(
        modifier = Modifier.padding(horizontal = 20.dp),
        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
        thickness = 1.dp
    )
}

// ── Legacy aliases kept for compatibility ──────────────────
@Composable
fun SettingsSectionTitle(title: String, color: Color) { ProfileSectionLabel(title, color) }

@Composable
fun PremiumStatCard(title: String, subtitle: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    PremiumStatBadge(value = title, label = subtitle, icon = icon, gradient = listOf(color, color.copy(alpha = 0.7f)), modifier = modifier)
}

@Composable
fun PremiumSettingsItem(
    title: String,
    icon: ImageVector,
    iconBg: Color,
    iconColor: Color,
    trailing: @Composable (() -> Unit)? = null,
    onClick: (() -> Unit)? = null
) {
    PremiumRow(title = title, icon = icon, gradient = listOf(iconBg, iconColor), trailing = trailing, onClick = onClick)
}
