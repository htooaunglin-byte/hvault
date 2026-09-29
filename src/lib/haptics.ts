/**
 * Mobile Haptic Feedback & Touch Interaction Utilities
 * Provides tactile vibration feedback for mobile devices (Android / iOS webviews)
 * paired with visual active-state animations.
 */

export type HapticType = 'light' | 'selection' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'pull';

/**
 * Triggers hardware vibration if supported by the browser/device.
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'light':
        case 'selection':
          navigator.vibrate(8);
          break;
        case 'pull':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate([10, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'error':
          navigator.vibrate([40, 50, 40, 50, 40]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  } catch {
    // Gracefully ignore vibration errors on unsupported environments
  }
}

/**
 * Reusable Tailwind classes for high-responsiveness tactile active states
 */
export const HAPTIC_TOUCH_CLASS = 'active:scale-[0.92] active:brightness-125 active:shadow-inner transition-all duration-100 select-none touch-manipulation cursor-pointer';
export const HAPTIC_BUTTON_CLASS = 'active:scale-[0.94] active:brightness-125 transition-transform duration-75 select-none touch-manipulation cursor-pointer';
export const HAPTIC_CARD_CLASS = 'active:scale-[0.985] active:brightness-110 transition-transform duration-150 select-none touch-manipulation';
