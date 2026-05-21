package com.vidasimple.designsystem

import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════
//  VIDASIMPLE PREMIUM DESIGN SYSTEM — COLOR PALETTE
//  Linear / Stripe inspired colors (Zinc & Indigo)
// ═══════════════════════════════════════════════════════════

// Primary: Vibrant Indigo
val VioletPrimary    = Color(0xFF6366F1) // Indigo 500
val VioletLight      = Color(0xFF818CF8) // Indigo 400
val VioletDark       = Color(0xFF4F46E5) // Indigo 600

// Accent: Pure Teal
val TealAccent       = Color(0xFF14B8A6) // Teal 500
val TealDark         = Color(0xFF0D9488) // Teal 600

// Backgrounds — Light (Zinc-based clean light theme)
val LightBg          = Color(0xFFFAFAFA) // Zinc 50
val LightSurface     = Color(0xFFFFFFFF) // White
val LightSurface2    = Color(0xFFF4F4F5) // Zinc 100 (Elevated card)

// Backgrounds — Dark (Zinc-based deep dark theme)
val DarkBg           = Color(0xFF09090B) // Zinc 950
val DarkSurface      = Color(0xFF121214) // Pure dark surface
val DarkSurface2     = Color(0xFF1E1E24) // Slightly lighter for card overlays

// Semantic Colors
val SuccessGreen     = Color(0xFF10B981) // Emerald 500
val AlertAmber       = Color(0xFFF59E0B) // Amber 500
val ErrorRed         = Color(0xFFF43F5E) // Rose 500
val InfoBlue         = Color(0xFF3B82F6) // Blue 500

// Text
val TextDark         = Color(0xFF09090B) // Zinc 950
val TextMuted        = Color(0xFF71717A) // Zinc 500
val TextLight        = Color(0xFFF4F4F5) // Zinc 100

// Premium Gradients
val GradientViolet   = listOf(Color(0xFF6366F1), Color(0xFF4F46E5))
val GradientTeal     = listOf(Color(0xFF14B8A6), Color(0xFF0D9488))
val GradientSunset   = listOf(Color(0xFFEC4899), Color(0xFF6366F1))
val GradientGold     = listOf(Color(0xFFF59E0B), Color(0xFFD97706))
val GradientGreen    = listOf(Color(0xFF10B981), Color(0xFF059669))
val GradientDarkCard = listOf(Color(0xFF18181B), Color(0xFF09090B))

// ColorScheme extension helpers
val androidx.compose.material3.ColorScheme.success: Color get() = SuccessGreen
val androidx.compose.material3.ColorScheme.warning: Color get() = AlertAmber
val androidx.compose.material3.ColorScheme.onSuccess: Color get() = Color.White
val androidx.compose.material3.ColorScheme.onWarning: Color get() = Color.White
val androidx.compose.material3.ColorScheme.teal: Color get() = TealAccent

