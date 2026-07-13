import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/colors';
import { useExpenses } from '../context/ExpensesContext';
import { EXPENSE_CATEGORIES } from '../utils/colors';
import { today, formatDate, formatAmount } from '../utils/helpers';

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otros');
  const [date, setDate] = useState(today());

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

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
      <View style={styles.header}>
        <Text style={styles.title}>Gastos</Text>
        <Text style={styles.total}>{formatAmount(total)}</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total gastado</Text>
        <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {expenses.length === 0 ? (
          <EmptyState icon="💰" title="Sin gastos" subtitle="Registra tu primer gasto" />
        ) : (
          expenses.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} onDelete={() => deleteExpense(expense.id)} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>
            <TextInput style={styles.input} placeholder="Título" placeholderTextColor={COLORS.textTertiary} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Monto" placeholderTextColor={COLORS.textTertiary} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Text style={styles.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {EXPENSE_CATEGORIES.map(c => (
                <Pressable key={c} style={[styles.categoryChip, category === c && styles.categoryChipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  total: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  summary: { marginHorizontal: 20, marginTop: 16, marginBottom: 12, padding: 20, backgroundColor: COLORS.surface, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.divider },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryAmount: { fontSize: 32, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  list: { flex: 1, paddingHorizontal: 20 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1, borderColor: COLORS.divider },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  categoryTextActive: { color: '#fff' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
