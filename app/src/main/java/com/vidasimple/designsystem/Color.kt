package com.vidasimple.designsystem

import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════
//  VIDASIMPLE PREMIUM DESIGN SYSTEM — COLOR PALETTE
//  Inspired by: skydoves, Yalantis, Droppers AnimatedBottomBar
// ═══════════════════════════════════════════════════════════

// Primary: Deep Violet (energetic, premium)
val VioletPrimary    = Color(0xFF7C3AED) // Deep Violet
val VioletLight      = Color(0xFF9D5CF6) // Vibrant mid
val VioletDark       = Color(0xFF5B21B6) // Deep

// Accent: Electric Teal (complementary, fresh)
val TealAccent       = Color(0xFF06B6D4) // Cyan-Teal
val TealDark         = Color(0xFF0891B2)

// Backgrounds — Light
val LightBg          = Color(0xFFF5F3FF) // Subtle violet tint
val LightSurface     = Color(0xFFFFFFFF)
val LightSurface2    = Color(0xFFF0EDFF) // Elevated card

// Backgrounds — Dark
val DarkBg           = Color(0xFF0D0B1E) // Deep midnight
val DarkSurface      = Color(0xFF1A1830) // Elevated midnight
val DarkSurface2     = Color(0xFF252340) // Card surface

// Semantic Colors
val SuccessGreen     = Color(0xFF10B981)
val AlertAmber       = Color(0xFFF59E0B)
val ErrorRed         = Color(0xFFEF4444)
val InfoBlue         = Color(0xFF3B82F6)

// Text
val TextDark         = Color(0xFF1C1033)
val TextMuted        = Color(0xFF6B7280)
val TextLight        = Color(0xFFF9F7FF)

// Gradient Pairs (for use in Brush.linearGradient)
val GradientViolet   = listOf(Color(0xFF7C3AED), Color(0xFF5B21B6))
val GradientTeal     = listOf(Color(0xFF06B6D4), Color(0xFF0891B2))
val GradientSunset   = listOf(Color(0xFFEC4899), Color(0xFF7C3AED))
val GradientGold     = listOf(Color(0xFFF59E0B), Color(0xFFEF4444))
val GradientGreen    = listOf(Color(0xFF10B981), Color(0xFF059669))

// ColorScheme extension helpers
val androidx.compose.material3.ColorScheme.success: Color get() = SuccessGreen
val androidx.compose.material3.ColorScheme.warning: Color get() = AlertAmber
val androidx.compose.material3.ColorScheme.onSuccess: Color get() = Color.White
val androidx.compose.material3.ColorScheme.onWarning: Color get() = Color.White
val androidx.compose.material3.ColorScheme.teal: Color get() = TealAccent
