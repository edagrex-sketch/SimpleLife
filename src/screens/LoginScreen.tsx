import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const error = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert('Error', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌅</Text>
          <Text style={styles.title}>SimpleLife</Text>
          <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Iniciar Sesión'}</Text>
          </Pressable>
          <Pressable onPress={onSwitchToRegister} style={styles.link}>
            <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text></Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'Outfit' },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  form: { gap: 12 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.divider,
    fontFamily: 'Inter',
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, color: COLORS.textSecondary },
  linkBold: { color: COLORS.primary, fontWeight: '600' },
});
