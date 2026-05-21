package com.vidasimple.designsystem

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val VidaSimpleShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp), // Para Cards y botones pequeños
    large = RoundedCornerShape(16.dp),  // Para Contenedores y Hojas de diálogo principales
    extraLarge = RoundedCornerShape(24.dp) // Estilo pill / botones principales
)
