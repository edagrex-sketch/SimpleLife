import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../utils/colors';
import { useNotifications } from '../context/NotificationsContext';
import { useStagger } from '../hooks/useStagger';
import Animated from 'react-native-reanimated';

interface NotificationsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, { name: string; color: string }> = {
  task_assigned: { name: 'checkbox-outline', color: COLORS.primary },
  space_invite: { name: 'people-outline', color: COLORS.secondary },
  event_reminder: { name: 'time-outline', color: COLORS.tertiary },
  general: { name: 'notifications-outline', color: COLORS.info },
};

function NotificationItem({ notification, index }: { notification: any; index: number }) {
  const { markAsRead } = useNotifications();
  const itemAnim = useStagger({ index, staggerDelay: 60, translateY: 12 });
  const iconInfo = TYPE_ICONS[notification.type] || TYPE_ICONS.general;

  const handlePress = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <Animated.View style={[itemAnim.animatedStyle]}>
      <Pressable
        style={[styles.notifCard, !notification.read && styles.notifCardUnread]}
        onPress={handlePress}
      >
        <View style={[styles.notifIcon, { backgroundColor: iconInfo.color + '15' }]}>
          <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <View style={styles.notifRight}>
          <Text style={styles.notifTime}>{timeAgo(notification.created_at)}</Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NotificationsSheet({ visible, onClose }: NotificationsSheetProps) {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Notificaciones</Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadLabel}>{unreadCount} sin leer</Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <Pressable style={styles.markAllButton} onPress={markAllAsRead}>
                  <Text style={styles.markAllText}>Marcar todo leído</Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="notifications-off-outline" size={40} color={COLORS.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Sin notificaciones</Text>
                <Text style={styles.emptyText}>
                  Cuando tengas nuevas notificaciones aparecerán aquí.
                </Text>
              </View>
            ) : (
              notifications.map((notif, index) => (
                <NotificationItem key={notif.id} notification={notif} index={index} />
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '80%',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  notifCardUnread: {
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    marginLeft: 12,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  notifRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
    gap: 6,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
