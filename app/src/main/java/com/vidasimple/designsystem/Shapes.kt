package com.vidasimple.designsystem

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val VidaSimpleShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp), // Para Cards
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp) // Estilo "pill" para botones si se usa el shape correcto
)
