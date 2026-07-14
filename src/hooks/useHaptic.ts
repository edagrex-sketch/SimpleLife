import { Platform } from 'react-native';

let RNHapticFeedback: any = null;
try {
  RNHapticFeedback = require('react-native-haptic-feedback').default;
} catch (e) {
  // Haptic feedback not available
}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: true,
};

export function hapticLight() {
  if (Platform.OS !== 'ios' || !RNHapticFeedback) return;
  try {
    RNHapticFeedback.trigger('impactLight', options);
  } catch (e) {}
}

export function hapticMedium() {
  if (Platform.OS !== 'ios' || !RNHapticFeedback) return;
  try {
    RNHapticFeedback.trigger('impactMedium', options);
  } catch (e) {}
}

export function hapticSuccess() {
  if (Platform.OS !== 'ios' || !RNHapticFeedback) return;
  try {
    RNHapticFeedback.trigger('notificationSuccess', options);
  } catch (e) {}
}

export function hapticWarning() {
  if (Platform.OS !== 'ios' || !RNHapticFeedback) return;
  try {
    RNHapticFeedback.trigger('notificationWarning', options);
  } catch (e) {}
}

export function hapticSelection() {
  if (Platform.OS !== 'ios' || !RNHapticFeedback) return;
  try {
    RNHapticFeedback.trigger('selection', options);
  } catch (e) {}
}
