import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, EXPENSE_CATEGORIES, CATEGORY_COLORS, SHADOWS } from '../utils/colors';
import { useExpenses } from '../context/ExpensesContext';
import { useNotifications } from '../context/NotificationsContext';
import { today, formatAmount } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { hapticLight, hapticMedium, hapticSuccess } from '../hooks/useHaptic';
import ExpenseDonutChart from '../components/ExpenseDonutChart';

const EXPENSE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  Alimentos: { icon: 'restaurant-outline', color: '#1E40AF', bg: '#EFF6FF' },
  Transporte: { icon: 'bus-outline', color: '#047857', bg: '#ECFDF5' },
  Entretenimiento: { icon: 'film-outline', color: '#B45309', bg: '#FFFBEB' },
  Suscripciones: { icon: 'repeat-outline', color: '#6B21A8', bg: '#F5F3FF' },
  Salud: { icon: 'heart-outline', color: '#DC2626', bg: '#FEF2F2' },
  Ropa: { icon: 'shirt-outline', color: '#0369A1', bg: '#F0F9FF' },
  Vivienda: { icon: 'home-outline', color: '#92400E', bg: '#FEF3C7' },
  Servicios: { icon: 'flash-outline', color: '#4338CA', bg: '#EEF2FF' },
  Educación: { icon: 'book-outline', color: '#0F766E', bg: '#F0FDFA' },
  Ahorros: { icon: 'wallet-outline', color: '#15803D', bg: '#F0FDF4' },
  Viajes: { icon: 'airplane-outline', color: '#9333EA', bg: '#FAF5FF' },
  Otros: { icon: 'ellipsis-horizontal-outline', color: COLORS.textTertiary, bg: COLORS.surfaceSecondary },
};

const CATEGORY_CHART_COLORS: Record<string, string> = {
  Alimentos: '#1E40AF',
  Transporte: '#047857',
  Entretenimiento: '#B45309',
  Suscripciones: '#6B21A8',
  Salud: '#DC2626',
  Ropa: '#0369A1',
  Vivienda: '#92400E',
  Servicios: '#4338CA',
  Educación: '#0F766E',
  Ahorros: '#15803D',
  Viajes: '#9333EA',
  Otros: '#6B7280',
};

interface ExpensesScreenProps {
  onOpenNotifications?: () => void;
}

export default function ExpensesScreen({ onOpenNotifications }: ExpensesScreenProps) {
  const { expenses, addExpense } = useExpenses();
  const { unreadCount } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otros');
  const [date, setDate] = useState(today());
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const balanceAnim = useFadeIn({ delay: 100, translateY: 20 });
  const chartAnim = useFadeIn({ delay: 200, translateY: 20 });
  const ctaAnim = useFadeIn({ delay: 300, translateY: 20 });
  const savingsAnim = useFadeIn({ delay: 400, translateY: 20 });
  const recentAnim = useFadeIn({ delay: 500, translateY: 15 });
  const tipAnim = useFadeIn({ delay: 600, translateY: 15 });

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const lastMonthTotal = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return expenses
      .filter((e) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d >= lastMonth && d <= endOfLastMonth;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const trendPercent = useMemo(() => {
    if (lastMonthTotal === 0) return 0;
    return Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100);
  }, [total, lastMonthTotal]);

  const monthlySavings = useMemo(() => {
    const budget = 5000;
    return Math.max(budget - total, 0);
  }, [total]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Otros';
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_CHART_COLORS[name] || COLORS.textTertiary,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const chartSegments = useMemo(() => {
    return categoryData.map((c) => ({ value: c.value, color: c.color }));
  }, [categoryData]);

  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'Todos') return expenses;
    return expenses.filter((e) => e.category === activeFilter);
  }, [expenses, activeFilter]);

  const filters = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category || 'Otros'));
    return ['Todos', ...Array.from(cats)];
  }, [expenses]);

  const handleAdd = async () => {
    if (!title.trim() || !amount) return;
    hapticSuccess();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[d.getDay()];
    }
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const renderExpense = ({ item }: { item: typeof expenses[0] }) => {
    const catConfig = EXPENSE_ICONS[item.category || 'Otros'] || EXPENSE_ICONS.Otros;
    return (
      <View style={styles.expenseRow}>
        <View style={[styles.expenseIcon, { backgroundColor: catConfig.bg }]}>
          <Ionicons name={catConfig.icon as any} size={20} color={catConfig.color} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.expenseMeta}>
            {item.date ? formatRelativeDate(item.date) : ''}
            {item.category ? ` · ${item.category}` : ''}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.headerAppName}>VidaSimple</Text>
        </View>
        <Pressable style={styles.headerButton} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </Pressable>
      </Animated.View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        ListHeaderComponent={
          <>
            {/* Balance Mensual */}
            <Animated.View style={[styles.balanceCard, balanceAnim.animatedStyle]}>
              <View style={styles.balanceTop}>
                <Text style={styles.balanceLabel}>BALANCE MENSUAL</Text>
                <Pressable style={styles.downloadButton}>
                  <Ionicons name="download-outline" size={18} color={COLORS.textTertiary} />
                </Pressable>
              </View>
              <Text style={styles.balanceAmount}>{formatAmount(monthlySavings)}</Text>
              <View style={styles.trendRow}>
                <Ionicons
                  name={trendPercent >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={COLORS.success}
                />
                <Text style={[styles.trendText, { color: COLORS.success }]}>
                  {trendPercent >= 0 ? '+' : ''}{trendPercent}% respecto al mes anterior
                </Text>
              </View>
            </Animated.View>

            {/* Distribución */}
            <Animated.View style={[styles.distributionCard, chartAnim.animatedStyle]}>
              <Text style={styles.cardTitle}>Distribución</Text>
              <View style={styles.chartRow}>
                <ExpenseDonutChart segments={chartSegments} />
                <View style={styles.legend}>
                  {categoryData.slice(0, 4).map((c) => (
                    <View key={c.name} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                      <Text style={styles.legendLabel}>{c.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Nuevo Gasto CTA */}
            <Animated.View style={ctaAnim.animatedStyle}>
              <Pressable
                style={styles.ctaCard}
                onPress={() => { hapticMedium(); setShowModal(true); }}
              >
                <View style={styles.ctaIconContainer}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
                <Text style={styles.ctaText}>Nuevo Gasto</Text>
              </Pressable>
            </Animated.View>

            {/* Ahorro Mensual */}
            <Animated.View style={[styles.savingsCard, savingsAnim.animatedStyle]}>
              <View>
                <Text style={styles.savingsLabel}>Ahorro Mensual</Text>
                <Text style={styles.savingsAmount}>{formatAmount(monthlySavings)}</Text>
              </View>
              <View style={styles.savingsIconContainer}>
                <Ionicons name="wallet-outline" size={28} color="#fff" />
              </View>
            </Animated.View>

            {/* Gastos Recientes Header */}
            <Animated.View style={[styles.recentHeader, recentAnim.animatedStyle]}>
              <Text style={styles.sectionTitle}>Gastos Recientes</Text>
              <Pressable>
                <Text style={styles.seeAll}>Ver todo</Text>
              </Pressable>
            </Animated.View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Sin gastos</Text>
            <Text style={styles.emptyText}>Registra tu primer gasto tocando "Nuevo Gasto"</Text>
          </View>
        }
        ListFooterComponent={
          <>
            {/* Consejo de ahorro */}
            <Animated.View style={[styles.tipCard, tipAnim.animatedStyle]}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="bulb-outline" size={22} color="#fff" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Consejo de ahorro</Text>
                <Text style={styles.tipText}>
                  Has gastado un 15% menos en Alimentos este mes. ¡Sigue así para alcanzar tu meta!
                </Text>
              </View>
            </Animated.View>
            <View style={{ height: 100 }} />
          </>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalOverlayBg} onPress={() => setShowModal(false)} />
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>

            <Text style={styles.inputLabel}>Descripción</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nombre del gasto"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <Text style={styles.inputLabel}>Monto</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="$0.00"
                placeholderTextColor={COLORS.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.inputLabel}>Categoría</Text>
            <FlatList
              horizontal
              data={EXPENSE_CATEGORIES}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item: c }) => {
                const catConf = EXPENSE_ICONS[c] || EXPENSE_ICONS.Otros;
                const isActive = category === c;
                return (
                  <Pressable
                    style={[
                      styles.categoryChip,
                      isActive && { backgroundColor: catConf.color + '15', borderColor: catConf.color },
                    ]}
                    onPress={() => { hapticLight(); setCategory(c); }}
                  >
                    <Ionicons
                      name={catConf.icon as any}
                      size={14}
                      color={isActive ? catConf.color : COLORS.textTertiary}
                    />
                    <Text style={[
                      styles.categoryText,
                      isActive && { color: catConf.color },
                    ]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => { hapticLight(); setShowModal(false); }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, (!title.trim() || !amount) && styles.saveButtonDisabled]}
                onPress={handleAdd}
                disabled={!title.trim() || !amount}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAppName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Distribution Card
  distributionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // CTA Button
  ctaCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },

  // Savings Card
  savingsCard: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  savingsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  savingsIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recent Header
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Expense Row
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  expenseMeta: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },

  // Tip Card
  tipCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    gap: 14,
    ...SHADOWS.medium,
  },
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 16,
  },
  input: {
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  categoryList: {
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
    minHeight: 44,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minHeight: 48,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
