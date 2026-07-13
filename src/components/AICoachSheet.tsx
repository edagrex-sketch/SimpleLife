import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../utils/colors';

interface AICoachSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function AICoachSheet({ visible, onClose }: AICoachSheetProps) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChat(prev => [...prev, { role: 'user', text: message.trim() }]);
    setChat(prev => [...prev, { role: 'ai', text: '¡Hola! Soy tu asistente SimpleLife. Estoy aquí para ayudarte a organizar tu día, establecer metas, y mantenerte motivado. ¿En qué puedo ayudarte hoy?' }]);
    setMessage('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>🤖 AI Coach</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.chat} showsVerticalScrollIndicator={false}>
            {chat.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🌅</Text>
                <Text style={styles.emptyTitle}>Bienvenido a SimpleLife AI</Text>
                <Text style={styles.emptyText}>
                  Puedo ayudarte con:{'\n'}
                  • Organizar tu día{'\n'}
                  • Sugerencias de productividad{'\n'}
                  • Resumen de tareas{'\n'}
                  • Consejos de bienestar
                </Text>
              </View>
            ) : (
              chat.map((msg, i) => (
                <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                    {msg.text}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Pregúntale a SimpleLife AI..."
              placeholderTextColor={COLORS.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Pressable style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendText}>→</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '80%', padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.divider, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  close: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  chat: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.divider },
  bubbleText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  userBubbleText: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  input: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: COLORS.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: COLORS.divider,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 18, color: '#fff', fontWeight: '600' },
});
