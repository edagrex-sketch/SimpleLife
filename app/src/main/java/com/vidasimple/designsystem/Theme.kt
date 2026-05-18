package com.vidasimple.designsystem

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary              = VioletPrimary,
    onPrimary            = Color.White,
    primaryContainer     = Color(0xFFEDE9FE),
    onPrimaryContainer   = VioletDark,
    secondary            = TealAccent,
    onSecondary          = Color.White,
    secondaryContainer   = Color(0xFFCCFBF1),
    onSecondaryContainer = TealDark,
    tertiary             = Color(0xFFEC4899),
    onTertiary           = Color.White,
    error                = ErrorRed,
    onError              = Color.White,
    background           = LightBg,
    onBackground         = TextDark,
    surface              = LightSurface,
    onSurface            = TextDark,
    surfaceVariant       = LightSurface2,
    onSurfaceVariant     = TextMuted,
    outline              = Color(0xFFD4D0E8)
)

private val DarkColorScheme = darkColorScheme(
    primary              = VioletLight,
    onPrimary            = Color.White,
    primaryContainer     = VioletDark,
    onPrimaryContainer   = Color(0xFFE8DBFF),
    secondary            = TealAccent,
    onSecondary          = DarkBg,
    secondaryContainer   = Color(0xFF065F72),
    onSecondaryContainer = Color(0xFFCCFBF1),
    tertiary             = Color(0xFFF472B6),
    onTertiary           = DarkBg,
    error                = Color(0xFFFCA5A5),
    onError              = Color(0xFF7F1D1D),
    background           = DarkBg,
    onBackground         = TextLight,
    surface              = DarkSurface,
    onSurface            = TextLight,
    surfaceVariant       = DarkSurface2,
    onSurfaceVariant     = Color(0xFFBBB4D8),
    outline              = Color(0xFF3D3658)
)

@Composable
fun VidaSimpleTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor    = Color.Transparent.toArgb()
            window.navigationBarColor = Color.Transparent.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars      = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars  = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = VidaSimpleTypography,
        shapes      = VidaSimpleShapes,
        content     = content
    )
}
