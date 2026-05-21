package com.vidasimple.ui.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vidasimple.designsystem.*
import com.vidasimple.domain.model.TaskPriority
import com.vidasimple.domain.model.Profile
import com.vidasimple.domain.model.getColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumTaskBottomSheet(
    members: List<Profile> = emptyList(),
    onDismiss: () -> Unit,
    onConfirm: (String, TaskPriority, String?) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(TaskPriority.MEDIUM) }
    var selectedMemberId by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        dragHandle = { BottomSheetDefaults.DragHandle(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)) },
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp)
                .padding(bottom = 20.dp)
        ) {
            Text(
                "Añadir Tarea",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Title input
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                placeholder = { Text("¿Qué necesitas hacer?", color = Color.Gray) },
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.medium,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = VioletPrimary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f),
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f),
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Priority Selection
            Text(
                "Prioridad",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                listOf(TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH).forEach { p ->
                    val isSelected = priority == p
                    val color = p.getColor()
                    val itemShape = MaterialTheme.shapes.medium

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .bounceClick { priority = p },
                        shape = itemShape,
                        color = if (isSelected) color else color.copy(alpha = 0.08f),
                        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(
                            1.dp, color.copy(alpha = 0.25f)
                        )
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                p.label,
                                color = if (isSelected) Color.White else color,
                                fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }

            // Member Assignment Selection (only shown if members list is not empty)
            if (members.isNotEmpty()) {
                Spacer(modifier = Modifier.height(28.dp))

                Text(
                    "Asignar a",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(12.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // "Unassigned" item
                    item {
                        val isSelected = selectedMemberId == null
                        val itemShape = MaterialTheme.shapes.medium
                        Surface(
                            modifier = Modifier
                                .bounceClick { selectedMemberId = null },
                            shape = itemShape,
                            color = if (isSelected) VioletPrimary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.PersonOff,
                                    null,
                                    tint = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Sin asignar",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    // Members list
                    items(members) { member ->
                        val isSelected = selectedMemberId == member.id
                        val name = member.name ?: member.email ?: "Miembro"
                        val initial = name.firstOrNull()?.toString()?.uppercase() ?: "?"
                        val itemShape = MaterialTheme.shapes.medium

                        Surface(
                            modifier = Modifier
                                .bounceClick { selectedMemberId = member.id },
                            shape = itemShape,
                            color = if (isSelected) VioletPrimary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(20.dp)
                                        .clip(CircleShape)
                                        .background(if (isSelected) Color.White.copy(alpha = 0.2f) else VioletPrimary.copy(alpha = 0.1f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = initial,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        color = if (isSelected) Color.White else VioletPrimary
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = name,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Confirm Button
            Button(
                onClick = {},
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .bounceClick(enabled = title.isNotEmpty()) {
                        if (title.isNotEmpty()) onConfirm(title, priority, selectedMemberId)
                    },
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(containerColor = VioletPrimary),
                enabled = title.isNotEmpty()
            ) {
                Text("Crear Tarea", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
            }
        }
    }
}
