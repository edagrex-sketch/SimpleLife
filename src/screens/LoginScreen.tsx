import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const logoAnim = useFadeIn({ delay: 0, translateY: 30 });
  const titleAnim = useFadeIn({ delay: 150, translateY: 20 });
  const cardAnim = useFadeIn({ delay: 300, translateY: 25 });
  const socialAnim = useFadeIn({ delay: 450, translateY: 20 });
  const registerAnim = useFadeIn({ delay: 550, translateY: 15 });

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const error = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert('Error', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnim.animatedStyle]}>
          <View style={styles.logoIcon}>
            <Ionicons name="sunny" size={28} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleAnim.animatedStyle}>
          <Text style={styles.title}>VidaSimple</Text>
          <Text style={styles.subtitle}>Tu vida, simplificada</Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View style={[styles.card, cardAnim.animatedStyle]}>
          <Text style={styles.inputLabel}>Correo Electrónica</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="nombre@ejemplo.com"
              placeholderTextColor="#BBBBBB"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <Pressable>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#BBBBBB"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#AAAAAA"
              />
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continua con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <Animated.View style={[styles.socialRow, socialAnim.animatedStyle]}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#333333" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#333333" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Register Link */}
        <Animated.View style={[styles.registerLink, registerAnim.animatedStyle]}>
          <Pressable onPress={onSwitchToRegister}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerBold}>Regístrate</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0EB',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#8B5E3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3D2B1F',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A7A6A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE8E3',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#3D2B1F',
  },
  eyeButton: {
    padding: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    color: '#C56A49',
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C56A49',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDE8E3',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#AAAAAA',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9F6F2',
    borderWidth: 1,
    borderColor: '#EDE8E3',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 28,
  },
  registerText: {
    fontSize: 14,
    color: '#8A7A6A',
  },
  registerBold: {
    color: '#C56A49',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
