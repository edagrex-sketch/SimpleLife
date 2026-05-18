package com.vidasimple.ui.expenses

import androidx.compose.foundation.background
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumExpenseBottomSheet(
    onDismiss: () -> Unit,
    onConfirm: (String, Double, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("General") }
    
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val categories = listOf(
        ExpenseCategory("General", Icons.Default.Receipt, Color(0xFF64748B)),
        ExpenseCategory("Comida", Icons.Default.Restaurant, Color(0xFFEF4444)),
        ExpenseCategory("Transporte", Icons.Default.DirectionsCar, Color(0xFF3B82F6)),
        ExpenseCategory("Ocio", Icons.Default.ConfirmationNumber, Color(0xFFF59E0B)),
        ExpenseCategory("Salud", Icons.Default.MedicalServices, Color(0xFF10B981))
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        dragHandle = { BottomSheetDefaults.DragHandle(color = Color(0xFFE2E8F0)) },
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        containerColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 40.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                text = "Registrar Gasto",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF1E293B)
            )

            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text(text = "Monto", fontSize = 14.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("$", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF1E293B))
                    BasicTextField(
                        value = amount,
                        onValueChange = { newValue -> 
                            // Solo permitimos números y un punto decimal
                            if (newValue.isEmpty() || newValue.matches(Regex("^\\d*\\.?\\d*$"))) {
                                amount = newValue 
                            }
                        },
                        textStyle = LocalTextStyle.current.copy(
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1E293B),
                            textAlign = TextAlign.Center
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        cursorBrush = androidx.compose.ui.graphics.SolidColor(Color(0xFF10B981)),
                        modifier = Modifier
                            .widthIn(min = 120.dp)
                            .padding(horizontal = 8.dp)
                    )
                }
                Box(modifier = Modifier.width(150.dp).height(2.dp).background(Color(0xFFF1F5F9)))
            }

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("¿En qué gastaste?") },
                placeholder = { Text("Ej: Cena con amigos") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFFE2E8F0)
                )
            )

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(text = "Categoría", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
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
                onClick = { 
                    val amt = amount.toDoubleOrNull() ?: 0.0
                    if (title.isNotEmpty() && amt > 0) onConfirm(title, amt, selectedCategory) 
                },
                enabled = title.isNotEmpty() && amount.isNotEmpty(),
                modifier = Modifier.fillMaxWidth().height(60.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Text("Guardar Gasto", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun CategoryChip(category: ExpenseCategory, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        color = if (isSelected) category.color.copy(alpha = 0.1f) else Color(0xFFF1F5F9),
        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, category.color) else null
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                category.icon, 
                contentDescription = null, 
                tint = if (isSelected) category.color else Color(0xFF64748B),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = category.name, 
                fontSize = 12.sp, 
                fontWeight = FontWeight.Bold,
                color = if (isSelected) category.color else Color(0xFF64748B)
            )
        }
    }
}

data class ExpenseCategory(val name: String, val icon: ImageVector, val color: Color)
