/**
 * Samadhan Setu — Spacing & Touch Target System
 * All interactive elements: minimum 48×48px touch target
 * Buttons: minimum 64px height
 * Screen padding: 24px
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,     // Screen padding — standard
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const touchTargets = {
  minimum: 48,        // Minimum touch target (px)
  buttonHeight: 64,   // Standard button height
  iconButton: 48,     // Icon-only button
  categoryIcon: 72,   // Category grid icon size
  fabSize: 64,        // Floating action button
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const screenPadding = spacing.xl; // 24px
