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
import { COLORS, SHADOWS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useFadeIn } from '../hooks/useFadeIn';
import { validateEmail, validatePassword } from '../utils/validation';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const logoAnim = useFadeIn({ delay: 0, translateY: 30 });
  const titleAnim = useFadeIn({ delay: 150, translateY: 20 });
  const cardAnim = useFadeIn({ delay: 300, translateY: 25 });
  const socialAnim = useFadeIn({ delay: 450, translateY: 20 });
  const registerAnim = useFadeIn({ delay: 550, translateY: 15 });

  const handleLogin = async () => {
    setServerError('');
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr || '');
    setPasswordError(pErr || '');
    if (eErr || pErr) return;

    setLoading(true);
    const error = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setServerError(error);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (serverError) setServerError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (serverError) setServerError('');
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
            <Ionicons name="sunny" size={28} color={COLORS.textInverse} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleAnim.animatedStyle}>
          <Text style={styles.title}>VidaSimple</Text>
          <Text style={styles.subtitle}>Tu vida, simplificada</Text>
        </Animated.View>

        {/* Server Error */}
        {serverError ? (
          <View style={styles.serverErrorContainer}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <Animated.View style={[styles.card, cardAnim.animatedStyle]}>
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <View style={[styles.inputContainer, emailError && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="nombre@ejemplo.com"
              placeholderTextColor={COLORS.textTertiary}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <Pressable style={styles.forgotPasswordTouchable}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>
          <View style={[styles.inputContainer, passwordError && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textTertiary}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textTertiary}
              />
            </Pressable>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Login Button */}
          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.textInverse} />
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
              <Ionicons name="logo-google" size={20} color={COLORS.textPrimary} />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color={COLORS.textPrimary} />
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  serverErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorSurface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  serverErrorText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.medium,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorSurface,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  forgotPasswordTouchable: {
    padding: 4,
  },
  forgotPassword: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    minHeight: 50,
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.textInverse,
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
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: COLORS.textTertiary,
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 48,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 28,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerBold: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
