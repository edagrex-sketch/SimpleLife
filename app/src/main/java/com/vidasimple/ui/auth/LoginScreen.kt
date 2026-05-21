package com.vidasimple.ui.auth

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.R
import com.vidasimple.designsystem.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    val background = MaterialTheme.colorScheme.background
    val isDark = background == DarkBg
    
    var email           by remember { mutableStateOf("") }
    var password        by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var contentVisible  by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { contentVisible = true }

    // Auto-navigate to home if already logged in
    val isLoggedIn by viewModel.isLoggedIn
    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) {
            onLoginSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(background)
    ) {
        // ── Background gradient ───────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.55f)
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF818CF8))
                    )
                )
        )

        // ── Decorative orbs ───────────────────────────────────────────────
        Box(
            modifier = Modifier
                .size(250.dp)
                .offset(x = (-60).dp, y = (-60).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
        )
        Box(
            modifier = Modifier
                .size(180.dp)
                .offset(x = 220.dp, y = 80.dp)
                .clip(CircleShape)
                .background(TealAccent.copy(alpha = 0.12f))
        )
        Box(
            modifier = Modifier
                .size(120.dp)
                .align(Alignment.TopEnd)
                .offset(x = (-20).dp, y = 140.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.04f))
        )

        // ── Content ───────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Logo & Brand
            AnimatedVisibility(
                visible = contentVisible,
                enter   = fadeIn(tween(600)) + slideInVertically(tween(600)) { -40 }
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    // Logo Circle
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .shadow(20.dp, CircleShape, spotColor = Color.Black.copy(alpha = 0.3f))
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_logo),
                            contentDescription = null,
                            modifier = Modifier.size(48.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        "VidaSimple",
                        style = MaterialTheme.typography.displayMedium,
                        color = Color.White
                    )
                    Text(
                        "Tu vida, organizada.",
                        fontSize   = 15.sp,
                        color      = Color.White.copy(alpha = 0.75f),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Login Card
            AnimatedVisibility(
                visible = contentVisible,
                enter   = fadeIn(tween(700, delayMillis = 200)) + slideInVertically(tween(700, delayMillis = 200)) { 60 }
            ) {
                val cardShape = MaterialTheme.shapes.large // Standardized 16.dp
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .shadow(24.dp, cardShape, spotColor = VioletPrimary.copy(alpha = 0.15f)),
                    shape = cardShape,
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "¡Bienvenido de nuevo!",
                            style      = MaterialTheme.typography.headlineMedium,
                            color      = MaterialTheme.colorScheme.onSurface,
                            textAlign  = TextAlign.Center
                        )
                        Text(
                            "Inicia sesión para continuar",
                            style    = MaterialTheme.typography.bodyMedium,
                            color    = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                        )

                        // Error/Success banners
                        ErrorBanner(message = viewModel.error.value)
                        SuccessBanner(message = viewModel.successMessage.value)

                        // Email field
                        PremiumAuthField(
                            value         = email,
                            onValueChange = { email = it },
                            label         = "Correo electrónico",
                            icon          = Icons.Default.Email,
                            accentColor   = VioletPrimary,
                            isDark        = isDark
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Password field
                        PremiumAuthField(
                            value           = password,
                            onValueChange   = { password = it },
                            label           = "Contraseña",
                            icon            = Icons.Default.Lock,
                            isPassword      = true,
                            passwordVisible = passwordVisible,
                            onPasswordToggle = { passwordVisible = !passwordVisible },
                            accentColor     = VioletPrimary,
                            isDark          = isDark
                        )

                        // Forgot password
                        Text(
                            "¿Olvidaste tu contraseña?",
                            fontSize   = 13.sp,
                            color      = VioletPrimary,
                            fontWeight = FontWeight.Bold,
                            modifier   = Modifier
                                .align(Alignment.End)
                                .padding(top = 12.dp, bottom = 20.dp)
                                .clickable { /* TODO */ }
                        )

                        // Login button with bounce effect
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(54.dp)
                                .shadow(8.dp, RoundedCornerShape(14.dp), spotColor = VioletPrimary.copy(alpha = 0.3f))
                                .clip(RoundedCornerShape(14.dp))
                                .background(Brush.linearGradient(GradientViolet))
                                .bounceClick(enabled = !viewModel.isLoading.value) {
                                    viewModel.login(email, password, onLoginSuccess)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            if (viewModel.isLoading.value) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.5.dp)
                            } else {
                                Text(
                                    "Iniciar Sesión",
                                    fontSize   = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color      = Color.White,
                                    letterSpacing = 0.5.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Divider
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Divider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                            Text(
                                "  o continúa con  ",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Divider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Social buttons
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            SocialAuthButton(
                                label      = "Google",
                                icon       = Icons.Default.Mail,
                                bgColor    = if (isDark) DarkSurface2 else Color(0xFFF4F4F5),
                                textColor  = MaterialTheme.colorScheme.onSurface,
                                modifier   = Modifier.weight(1f)
                            )
                            SocialAuthButton(
                                label      = "Apple",
                                icon       = Icons.Default.Phone,
                                bgColor    = if (isDark) DarkSurface2 else Color(0xFFF4F4F5),
                                textColor  = MaterialTheme.colorScheme.onSurface,
                                modifier   = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Register link
            AnimatedVisibility(
                visible = contentVisible,
                enter   = fadeIn(tween(800, delayMillis = 400))
            ) {
                Row {
                    Text("¿Eres nuevo? ", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 15.sp)
                    Text(
                        "Crear cuenta",
                        color      = VioletLight,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize   = 15.sp,
                        modifier   = Modifier.clickable { onNavigateToRegister() }
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  PREMIUM AUTH FIELD
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumAuthField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isPassword: Boolean = false,
    passwordVisible: Boolean = false,
    onPasswordToggle: (() -> Unit)? = null,
    accentColor: Color = VioletPrimary,
    isDark: Boolean = false
) {
    OutlinedTextField(
        value         = value,
        onValueChange = onValueChange,
        label         = { Text(label) },
        leadingIcon   = {
            Icon(icon, null, tint = accentColor.copy(alpha = 0.8f), modifier = Modifier.size(20.dp))
        },
        trailingIcon  = if (isPassword) {
            onPasswordToggle?.let { toggle ->
                {
                    IconButton(onClick = toggle) {
                        Icon(
                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else null,
        visualTransformation = if (isPassword && !passwordVisible) PasswordVisualTransformation() else VisualTransformation.None,
        modifier      = Modifier.fillMaxWidth(),
        shape         = RoundedCornerShape(14.dp),
        colors        = OutlinedTextFieldDefaults.colors(
            focusedBorderColor      = accentColor,
            unfocusedBorderColor    = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
            focusedLabelColor       = accentColor,
            unfocusedLabelColor     = MaterialTheme.colorScheme.onSurfaceVariant,
            focusedContainerColor   = if (isDark) DarkSurface2 else Color(0xFFF9F9FB),
            unfocusedContainerColor = if (isDark) DarkSurface else Color(0xFFFAFAFC),
            cursorColor             = accentColor,
            focusedTextColor        = MaterialTheme.colorScheme.onSurface,
            unfocusedTextColor      = MaterialTheme.colorScheme.onSurface
        ),
        singleLine    = true
    )
}

// ═══════════════════════════════════════════════════════════
//  SOCIAL AUTH BUTTON
// ═══════════════════════════════════════════════════════════
@Composable
fun SocialAuthButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    bgColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .height(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .bounceClick { /* TODO */ },
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, null, tint = textColor, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(label, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = textColor)
        }
    }
}

// ═══════════════════════════════════════════════════════════
//  LEGACY INPUT (kept for register screen)
// ═══════════════════════════════════════════════════════════
@Composable
fun PremiumInput(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isPassword: Boolean = false,
    passwordVisible: Boolean = false,
    onPasswordToggle: (() -> Unit)? = null
) {
    val isDark = MaterialTheme.colorScheme.background == DarkBg
    PremiumAuthField(
        value            = value,
        onValueChange    = onValueChange,
        label            = placeholder,
        icon             = icon,
        isPassword       = isPassword,
        passwordVisible  = passwordVisible,
        onPasswordToggle = onPasswordToggle,
        isDark           = isDark
    )
}

@Composable
fun SocialIconButton(painter: androidx.compose.ui.graphics.painter.Painter) {
    val isDark = MaterialTheme.colorScheme.background == DarkBg
    Surface(
        modifier = Modifier.size(54.dp),
        shape    = CircleShape,
        color    = if (isDark) DarkSurface else Color(0xFFF5F5F5),
        border   = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
        onClick  = { /* TODO */ }
    ) {
        Box(contentAlignment = Alignment.Center) {
            Image(painter = painter, contentDescription = null, modifier = Modifier.size(24.dp))
        }
    }
}
