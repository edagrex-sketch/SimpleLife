package com.vidasimple.ui.common

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun UserAvatar(
    initial: String = "A",
    size: Int = 32,
    fontSize: Int = 14
) {
    Surface(
        modifier = Modifier.size(size.dp),
        shape = CircleShape,
        color = MaterialTheme.colorScheme.primary // Fondo azul fuerte
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = initial,
                style = MaterialTheme.typography.labelLarge,
                color = Color.White, // Texto blanco para que resalte
                fontWeight = FontWeight.ExtraBold,
                fontSize = fontSize.sp
            )
        }
    }
}
