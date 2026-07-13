import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SpaceCard from '../components/SpaceCard';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/colors';
import { useSpaces } from '../context/SpacesContext';

export default function SpacesScreen() {
  const { spaces, createSpace, joinSpace, leaveSpace } = useSpaces();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createSpace(name.trim());
    setName('');
    setShowCreate(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    const error = await joinSpace(inviteCode.trim().toUpperCase());
    if (error) {
      Alert.alert('Error', error);
    } else {
      setInviteCode('');
      setShowJoin(false);
    }
  };

  const handleLeave = (spaceId: string) => {
    Alert.alert('Salir del espacio', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => leaveSpace(spaceId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Espacios</Text>
        <Text style={styles.count}>{spaces.length} espacios</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => setShowJoin(true)}>
          <Text style={styles.actionText}>🔗 Unirse</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.actionButtonPrimary]} onPress={() => setShowCreate(true)}>
          <Text style={[styles.actionText, styles.actionTextPrimary]}>+ Crear</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {spaces.length === 0 ? (
          <EmptyState icon="🏠" title="Sin espacios" subtitle="Crea o únete a un espacio compartido" />
        ) : (
          spaces.map(space => (
            <SpaceCard key={space.id} space={space} onPress={() => handleLeave(space.id)} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Crear Espacio</Text>
            <TextInput style={styles.input} placeholder="Nombre del espacio" placeholderTextColor={COLORS.textTertiary} value={name} onChangeText={setName} />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleCreate}>
                <Text style={styles.saveText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showJoin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Unirse a Espacio</Text>
            <TextInput style={styles.input} placeholder="Código de invitación" placeholderTextColor={COLORS.textTertiary} value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowJoin(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleJoin}>
                <Text style={styles.saveText}>Unirse</Text>
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
  count: { fontSize: 13, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.divider },
  actionButtonPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  actionText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  actionTextPrimary: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
