export const COLORS = {
  // Primary: Terracota
  primary: '#C56A49',
  primaryLight: '#E8A287',
  primaryDark: '#9E4B2D',
  primarySurface: 'rgba(197, 106, 73, 0.10)',

  // Secondary: Sage Green
  secondary: '#91AC9F',
  secondaryLight: '#C2D4CC',
  secondaryDark: '#678275',
  secondarySurface: 'rgba(145, 172, 159, 0.10)',

  // Tertiary: Gold
  tertiary: '#DFAD6D',
  tertiaryLight: '#F0D1A3',
  tertiaryDark: '#B88A4A',
  tertiarySurface: 'rgba(223, 173, 109, 0.10)',

  // Light Theme — Warm Sand
  background: '#F2EDE7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F7F3EE',
  surfaceTertiary: '#EAE5DF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6E6E6E',
  textTertiary: '#8A8A8A',
  textInverse: '#F5F5F0',
  textInverseSecondary: '#9DB0A8',

  // Semantic
  success: '#4CAF50',
  successLight: '#C8E6C9',
  alert: '#E5B57A',
  alertLight: '#F5E3CE',
  error: '#D96B6B',
  errorLight: '#F5D6D6',
  errorSurface: 'rgba(217, 107, 107, 0.10)',
  info: '#74A0B8',
  infoLight: '#CBE2ED',

  // Misc
  divider: '#E8E3DD',
  overlay: 'rgba(0,0,0,0.40)',
  overlayLight: 'rgba(255,255,255,0.25)',

  // Premium extras
  cardShadow: 'rgba(26, 26, 26, 0.05)',
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.30)',
};

export const FONTS = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
  fab: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const PRIORITY_COLORS: Record<string, string> = {
  baja: '#4CAF50',
  media: '#DFAD6D',
  alta: '#C56A49',
};

export const PRIORITY_LABELS: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

export const CATEGORY_COLORS: Record<string, string> = {
  General: COLORS.primary,
  Trabajo: '#5B8C7A',
  Personal: COLORS.secondary,
  Salud: COLORS.info,
  Finanzas: COLORS.tertiary,
  Educación: '#A68BB5',
  Otros: COLORS.textTertiary,
};

export const EXPENSE_CATEGORIES = [
  'Alimentos', 'Transporte', 'Vivienda', 'Servicios',
  'Salud', 'Entretenimiento', 'Ropa', 'Educación',
  'Ahorros', 'Suscripciones', 'Viajes', 'Otros',
];

export const EVENT_CATEGORIES = [
  'General', 'Trabajo', 'Personal', 'Salud', 'Social', 'Familia', 'Deporte',
];
