export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'El correo es requerido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Formato de correo inválido';
  return null;
}

export function validatePassword(password: string, minLength = 6): string | null {
  if (!password) return 'La contraseña es requerida';
  if (password.length < minLength) return `Mínimo ${minLength} caracteres`;
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'El nombre es requerido';
  if (trimmed.length < 2) return 'Mínimo 2 caracteres';
  if (trimmed.length > 100) return 'Máximo 100 caracteres';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} es requerido`;
  return null;
}

export function validateAmount(value: string): string | null {
  if (!value || !value.trim()) return 'El monto es requerido';
  const num = parseFloat(value);
  if (isNaN(num)) return 'Monto inválido';
  if (num <= 0) return 'Debe ser mayor a $0';
  if (num > 999999.99) return 'Monto demasiado alto';
  return null;
}

export function validateTime(time: string): string | null {
  if (!time || !time.trim()) return null; // optional field
  if (!/^\d{2}:\d{2}$/.test(time)) return 'Formato: HH:MM';
  const [h, m] = time.split(':').map(Number);
  if (h < 0 || h > 23) return 'Hora inválida (0-23)';
  if (m < 0 || m > 59) return 'Minutos inválidos (0-59)';
  return null;
}

export function validateTimeRange(startTime: string, endTime: string): string | null {
  const startErr = validateTime(startTime);
  if (startErr) return startErr;
  const endErr = validateTime(endTime);
  if (endErr) return endErr;
  if (startTime && endTime && startTime >= endTime) return 'Fin debe ser después del inicio';
  return null;
}

export function validateInviteCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return 'El código es requerido';
  if (trimmed.length < 4) return 'Código muy corto';
  return null;
}
