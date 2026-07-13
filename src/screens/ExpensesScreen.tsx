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
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, EXPENSE_CATEGORIES } from '../utils/colors';
import { useExpenses } from '../context/ExpensesContext';
import { today, formatAmount } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';

const CATEGORY_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  Alimentos: { label: 'ALIMENTOS', color: '#C56A49', bg: '#FDEEE8' },
  Transporte: { label: 'TRANSPORTE', color: '#91AC9F', bg: '#EEF4F0' },
  Entretenimiento: { label: 'ENTRETENIMIENTO', color: '#DFAD6D', bg: '#FDF5E6' },
  Suscripciones: { label: 'SUSCRIPCIONES', color: '#8A7A6A', bg: '#F5F0EB' },
  Salud: { label: 'SALUD', color: '#74A0B8', bg: '#E8F2F8' },
  Otros: { label: 'OTROS', color: '#AA9A8A', bg: '#F5F0EB' },
};

const FILTERS = ['Todos', 'Alimentos', 'Transporte'];

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otros');
  const [date, setDate] = useState(today());
  const [activeFilter, setActiveFilter] = useState('Todos');

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses =
    activeFilter === 'Todos'
      ? expenses
      : expenses.filter((e) => e.category === activeFilter);

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const titleAnim = useFadeIn({ delay: 100, translateY: 15 });
  const budgetAnim = useFadeIn({ delay: 200, translateY: 20 });
  const filtersAnim = useFadeIn({ delay: 300, translateY: 15 });
  const sectionAnim = useFadeIn({ delay: 400, translateY: 15 });

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

  const formatExpenseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <View>
          <Text style={styles.headerAppName}>VidaSimple</Text>
        </View>
        <Pressable style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color="#3D2B1F" />
        </Pressable>
      </Animated.View>

      <Animated.View style={titleAnim.animatedStyle}>
        <Text style={styles.title}>Gastos</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Budget Card */}
        <Animated.View style={[styles.budgetCard, budgetAnim.animatedStyle]}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Gasto Total Mensual</Text>
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetBadgeText}>Limite 2026</Text>
            </View>
          </View>
          <Text style={styles.budgetAmount}>{formatAmount(total)}</Text>

          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBarBg}>
              <View
                style={[
                  styles.budgetBarFill,
                  { width: `${Math.min((total / 5000) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.budgetPercent}>
              {Math.round((total / 5000) * 100)}% utilizado
            </Text>
          </View>

          <View style={styles.budgetDetails}>
            <Text style={styles.budgetDetail}>
              Presupuesto: <Text style={styles.budgetDetailBold}>$5,000.00</Text>
            </Text>
            <Text style={styles.budgetDetail}>
              Quedan <Text style={[styles.budgetDetailBold, { color: '#91AC9F' }]}>
                {formatAmount(Math.max(5000 - total, 0))}
              </Text> este mes
            </Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View style={filtersAnim.animatedStyle}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersRow}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map((f) => (
              <Pressable
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[styles.filterText, activeFilter === f && styles.filterTextActive]}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Transactions */}
        <Animated.View style={sectionAnim.animatedStyle}>
          <Text style={styles.sectionTitle}>RECIENTE</Text>

          {filteredExpenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="wallet-outline" size={40} color="#CCC" />
              <Text style={styles.emptyText}>Sin gastos registrados</Text>
            </View>
          ) : (
            filteredExpenses.map((expense, index) => {
              const badge = CATEGORY_BADGES[expense.category || 'Otros'] || CATEGORY_BADGES.Otros;
              const itemAnim = useStagger({ index, staggerDelay: 60, translateY: 16 });
              return (
                <Animated.View key={expense.id} style={itemAnim.animatedStyle}>
                  <View style={styles.transactionCard}>
                    <View style={styles.transactionLeft}>
                      <View style={[styles.transactionIcon, { backgroundColor: badge.bg }]}>
                        <Ionicons name="receipt-outline" size={18} color={badge.color} />
                      </View>
                      <View>
                        <Text style={styles.transactionTitle}>{expense.title}</Text>
                        <Text style={styles.transactionDate}>
                          {expense.date ? formatExpenseDate(expense.date) : ''}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.transactionAmount}>
                      -${expense.amount.toFixed(2)}
                    </Text>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>

            <Text style={styles.inputLabel}>Descripción</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nombre del gasto"
                placeholderTextColor="#BBBBBB"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.inputLabel}>Monto</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="$0.00"
                placeholderTextColor="#BBBBBB"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.inputLabel}>Categoría</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[styles.categoryText, category === c && styles.categoryTextActive]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Guardar</Text>
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
    backgroundColor: '#F5F0EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerAppName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C56A49',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3D2B1F',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    color: '#AA9A8A',
    fontWeight: '500',
  },
  budgetBadge: {
    backgroundColor: '#91AC9F20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#91AC9F',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D2B1F',
    marginBottom: 16,
  },
  budgetBarContainer: {
    marginBottom: 12,
  },
  budgetBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0EBE5',
    overflow: 'hidden',
    marginBottom: 6,
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C56A49',
  },
  budgetPercent: {
    fontSize: 12,
    color: '#AA9A8A',
    textAlign: 'right',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetDetail: {
    fontSize: 12,
    color: '#AA9A8A',
  },
  budgetDetailBold: {
    fontWeight: '700',
    color: '#3D2B1F',
  },
  filtersRow: {
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  filterChipActive: {
    backgroundColor: '#C56A49',
    borderColor: '#C56A49',
  },
  filterText: {
    fontSize: 13,
    color: '#8A7A6A',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AA9A8A',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#AA9A8A',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  transactionDate: {
    fontSize: 11,
    color: '#AA9A8A',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C56A49',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3D2B1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EDE8E3',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D2B1F',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F9F6F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE8E3',
    marginBottom: 16,
  },
  input: {
    paddingVertical: 14,
    fontSize: 15,
    color: '#3D2B1F',
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F9F6F2',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  categoryChipActive: {
    backgroundColor: '#C56A49',
    borderColor: '#C56A49',
  },
  categoryText: {
    fontSize: 12,
    color: '#8A7A6A',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A7A6A',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#C56A49',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
