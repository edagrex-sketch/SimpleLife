import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExpenseCard from '../components/ExpenseCard';
import { COLORS, SHADOWS, EXPENSE_CATEGORIES } from '../utils/colors';
import { useExpenses } from '../context/ExpensesContext';
import { today, formatAmount } from '../utils/helpers';

const CATEGORY_ICONS: Record<string, string> = {
  Comida: 'restaurant-outline',
  Transporte: 'car-outline',
  Casa: 'home-outline',
  Salud: 'medical-outline',
  Entretenimiento: 'game-controller-outline',
  Educación: 'school-outline',
  Ropa: 'shirt-outline',
  Otros: 'ellipsis-horizontal-outline',
};

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otros');
  const [date, setDate] = useState(today());

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async () => {
    if (!title.trim() || !amount) return;
    await addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
    });
    setTitle('');
    setAmount('');
    setCategory('Otros');
    setDate(today());
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gastos</Text>
          <Text style={styles.subtitle}>{expenses.length} registros</Text>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Este mes</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.tertiary }]}>
              {formatAmount(monthTotal)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((monthTotal / (total || 1)) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Expenses List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="wallet-outline"
              size={48}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyTitle}>Sin gastos</Text>
            <Text style={styles.emptyText}>Registra tu primer gasto</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={() => deleteExpense(expense.id)}
            />
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Monto"
                placeholderTextColor={COLORS.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.label}>Categoría</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.categoryChip,
                    category === c && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Ionicons
                    name={
                      (CATEGORY_ICONS[c] as any) ||
                      'ellipsis-horizontal-outline'
                    }
                    size={16}
                    color={category === c ? '#FFFFFF' : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === c && styles.categoryTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Guardar Gasto</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
  summaryProgress: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceSecondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categoryScroll: {
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
