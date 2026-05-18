package com.vidasimple.ui.auth

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vidasimple.designsystem.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    var name          by remember { mutableStateOf("") }
    var email         by remember { mutableStateOf("") }
    var password      by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var acceptedTerms by remember { mutableStateOf(false) }
    var visible       by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        visible = true
        viewModel.clearMessages()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBg)
    ) {
        // ── Gradient background ───────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.42f)
                .background(
                    Brush.linearGradient(GradientSunset),
                    shape = RoundedCornerShape(bottomStart = 56.dp, bottomEnd = 56.dp)
                )
        )

        // Decorative orbs
        Box(
            modifier = Modifier
                .size(180.dp)
                .offset(x = (-40).dp, y = (-40).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.06f))
        )
        Box(
            modifier = Modifier
                .size(120.dp)
                .offset(x = 240.dp, y = 60.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.08f))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top navigation
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateToLogin) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.ArrowBack, null, tint = Color.White, modifier = Modifier.size(22.dp))
                    }
                }
            }

            // ── Heading ───────────────────────────────────────────────────
            AnimatedVisibility(
                visible = visible,
                enter   = fadeIn(tween(600)) + slideInVertically(tween(600)) { -30 }
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(horizontal = 28.dp)
                ) {
                    // Icon badge
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .shadow(16.dp, CircleShape, spotColor = Color.Black.copy(alpha = 0.2f))
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.PersonAdd, null, tint = VioletPrimary, modifier = Modifier.size(34.dp))
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        "Únete a VidaSimple",
                        fontSize   = 28.sp,
                        fontWeight = FontWeight.Black,
                        color      = Color.White,
                        textAlign  = TextAlign.Center,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        "Organiza tu vida con estilo y calma",
                        fontSize = 15.sp,
                        color    = Color.White.copy(alpha = 0.75f),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // ── Form Card ─────────────────────────────────────────────────
            AnimatedVisibility(
                visible = visible,
                enter   = fadeIn(tween(700, delayMillis = 250)) + slideInVertically(tween(700, delayMillis = 250)) { 50 }
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .shadow(28.dp, RoundedCornerShape(36.dp), spotColor = Color(0xFFEC4899).copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(36.dp),
                    color = Color.White
                ) {
                    Column(
                        modifier = Modifier.padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "Crea tu cuenta",
                            fontSize   = 22.sp,
                            fontWeight = FontWeight.Black,
                            color      = TextDark
                        )
                        Text(
                            "Solo toma un momento",
                            fontSize = 14.sp,
                            color    = TextMuted,
                            modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                        )

                        // Error/Success banners
                        ErrorBanner(message = viewModel.error.value)
                        SuccessBanner(message = viewModel.successMessage.value)

                        // Name field
                        PremiumAuthField(
                            value         = name,
                            onValueChange = { name = it },
                            label         = "Nombre completo",
                            icon          = Icons.Default.Person,
                            accentColor   = Color(0xFFEC4899)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Email field
                        PremiumAuthField(
                            value         = email,
                            onValueChange = { email = it },
                            label         = "Correo electrónico",
                            icon          = Icons.Default.AlternateEmail,
                            accentColor   = Color(0xFFEC4899)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Password field
                        PremiumAuthField(
                            value         = password,
                            onValueChange = { password = it },
                            label         = "Contraseña",
                            icon          = Icons.Default.VpnKey,
                            isPassword    = true,
                            passwordVisible = passwordVisible,
                            onPasswordToggle = { passwordVisible = !passwordVisible },
                            accentColor   = Color(0xFFEC4899)
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Terms checkbox
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked  = acceptedTerms,
                                onCheckedChange = { acceptedTerms = it },
                                colors   = CheckboxDefaults.colors(
                                    checkedColor   = Color(0xFFEC4899),
                                    checkmarkColor = Color.White
                                )
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "Acepto los ",
                                fontSize = 13.sp,
                                color    = TextMuted
                            )
                            Text(
                                "términos y condiciones",
                                fontSize   = 13.sp,
                                color      = Color(0xFFEC4899),
                                fontWeight = FontWeight.Bold,
                                modifier   = Modifier.clickable { /* TODO */ }
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Register button
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(58.dp)
                                .shadow(
                                    12.dp,
                                    RoundedCornerShape(18.dp),
                                    spotColor = Color(0xFFEC4899).copy(alpha = 0.4f)
                                )
                                .clip(RoundedCornerShape(18.dp))
                                .background(Brush.linearGradient(GradientSunset))
                                .clickable(enabled = !viewModel.isLoading.value) {
                                    viewModel.signUp(email, password, name, acceptedTerms, onRegisterSuccess)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            if (viewModel.isLoading.value) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(26.dp), strokeWidth = 2.5.dp)
                            } else {
                                Text(
                                    "Empezar ahora →",
                                    fontSize   = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color      = Color.White,
                                    letterSpacing = 0.3.sp
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Login link
            AnimatedVisibility(
                visible = visible,
                enter   = fadeIn(tween(900, delayMillis = 500))
            ) {
                Row(modifier = Modifier.padding(bottom = 40.dp)) {
                    Text("¿Ya tienes cuenta? ", color = TextMuted, fontSize = 15.sp)
                    Text(
                        "Inicia sesión",
                        color      = VioletLight,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize   = 15.sp,
                        modifier   = Modifier.clickable { onNavigateToLogin() }
                    )
                }
            }
        }
    }
}


