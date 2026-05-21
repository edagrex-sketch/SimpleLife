package com.vidasimple.ui.expenses

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vidasimple.designsystem.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumExpenseBottomSheet(
    onDismiss: () -> Unit,
    onConfirm: (String, Double, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Comida") }
    
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val categories = listOf(
        ExpenseCategory("Comida", Icons.Default.Restaurant, Color(0xFFEF4444)),
        ExpenseCategory("Transporte", Icons.Default.DirectionsCar, Color(0xFF3B82F6)),
        ExpenseCategory("Ocio", Icons.Default.ConfirmationNumber, Color(0xFFF59E0B)),
        ExpenseCategory("Salud", Icons.Default.MedicalServices, Color(0xFF10B981)),
        ExpenseCategory("Tecnología", Icons.Default.PhoneAndroid, Color(0xFF8B5CF6)),
        ExpenseCategory("Ropa", Icons.Default.Checkroom, Color(0xFFEC4899)),
        ExpenseCategory("Educación", Icons.Default.School, Color(0xFF06B6D4)),
        ExpenseCategory("Hogar", Icons.Default.Home, Color(0xFFF97316)),
        ExpenseCategory("Otros", Icons.Default.Receipt, Color(0xFF64748B))
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        dragHandle = { BottomSheetDefaults.DragHandle(color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)) },
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp)
                .padding(bottom = 40.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                text = "Registrar Gasto",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )

            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Monto",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Bold
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "$",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    BasicTextField(
                        value = amount,
                        onValueChange = { newValue -> 
                            if (newValue.isEmpty() || newValue.matches(Regex("^\\d*\\.?\\d*$"))) {
                                amount = newValue 
                            }
                        },
                        textStyle = LocalTextStyle.current.copy(
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface,
                            textAlign = TextAlign.Center
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        cursorBrush = androidx.compose.ui.graphics.SolidColor(SuccessGreen),
                        modifier = Modifier
                            .widthIn(min = 120.dp)
                            .padding(horizontal = 8.dp)
                    )
                }
                Box(
                    modifier = Modifier
                        .width(150.dp)
                        .height(2.dp)
                        .background(MaterialTheme.colorScheme.outlineVariant)
                )
            }

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("¿En qué gastaste?") },
                placeholder = { Text("Ej: Cena con amigos") },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SuccessGreen,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    focusedLabelColor = SuccessGreen
                )
            )

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Categoría",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 2.dp)
                ) {
                    items(categories) { cat ->
                        CategoryChip(
                            category = cat,
                            isSelected = selectedCategory == cat.name,
                            onClick = { selectedCategory = cat.name }
                        )
                    }
                }
            }

            Button(
                onClick = {},
                enabled = title.isNotEmpty() && amount.isNotEmpty(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .bounceClick(enabled = title.isNotEmpty() && amount.isNotEmpty()) { 
                        val amt = amount.toDoubleOrNull() ?: 0.0
                        if (title.isNotEmpty() && amt > 0) onConfirm(title, amt, selectedCategory) 
                    },
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
            ) {
                Text("Guardar Gasto", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}

@Composable
fun CategoryChip(category: ExpenseCategory, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.bounceClick { onClick() },
        shape = MaterialTheme.shapes.medium,
        color = if (isSelected) category.color.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, category.color) else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                category.icon, 
                contentDescription = null, 
                tint = if (isSelected) category.color else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = category.name, 
                fontSize = 12.sp, 
                fontWeight = FontWeight.Bold,
                color = if (isSelected) category.color else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

data class ExpenseCategory(val name: String, val icon: ImageVector, val color: Color)
