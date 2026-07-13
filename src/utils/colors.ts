export const COLORS = {
  // Primary: Terracota
  primary: '#C56A49',
  primaryLight: '#E8A287',
  primaryDark: '#9E4B2D',

  // Secondary: Sage Green
  secondary: '#91AC9F',
  secondaryLight: '#C2D4CC',
  secondaryDark: '#678275',

  // Tertiary: Gold
  tertiary: '#DFAD6D',
  tertiaryLight: '#F0D1A3',

  // Light Theme — Warm Sand
  background: '#F2EDE7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F7F3EE',
  surfaceTertiary: '#EAE5DF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#8A8A8A',
  textTertiary: '#AAAAAA',
  textInverse: '#F5F5F0',
  textInverseSecondary: '#9DB0A8',

  // Semantic
  success: '#4CAF50',
  successLight: '#C8E6C9',
  alert: '#E5B57A',
  alertLight: '#F5E3CE',
  error: '#D96B6B',
  errorLight: '#F5D6D6',
  info: '#74A0B8',
  infoLight: '#CBE2ED',

  // Misc
  divider: '#E8E3DD',
  overlay: 'rgba(0,0,0,0.50)',
  overlayLight: 'rgba(255,255,255,0.25)',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
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
