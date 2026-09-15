/**
 * Samadhan Setu — Sohrai-Inspired Color Palette
 * Inspired by Jharkhand's Sohrai-Khovar tribal painting tradition.
 * Earthy, warm tones that feel familiar to rural Jharkhand users.
 */

export const colors = {
  // Primary palette
  forestGreen: '#2D5016',   // Primary CTA, headers
  leafGreen: '#4A7C2E',     // Success, resolved status
  turmeric: '#E4A853',      // Pending, warning
  ochre: '#D89B3C',         // Secondary buttons, accents
  terracotta: '#C44536',    // Headings, borders
  mudBrown: '#6B3410',      // Body text
  chuna: '#FAF6EC',         // Background (never pure white)
  sindoor: '#8B1A1A',       // Errors, urgent/emergency
  charcoal: '#1A1A1A',      // Icon outlines

  // Functional aliases
  primary: '#2D5016',
  primaryLight: '#4A7C2E',
  secondary: '#D89B3C',
  background: '#FAF6EC',
  surface: '#FFFFFF',
  text: '#6B3410',
  textDark: '#1A1A1A',
  error: '#8B1A1A',
  warning: '#E4A853',
  success: '#4A7C2E',
  border: '#C44536',
  borderLight: '#D4C4A8',
  overlay: 'rgba(26, 26, 26, 0.5)',

  // Status colors (always used WITH icon + text, never alone)
  status: {
    submitted: '#C44536',         // terracotta
    verified: '#4A7C2E',          // leafGreen
    assigned: '#E4A853',          // turmeric
    in_progress: '#D89B3C',       // ochre
    resolved: '#2D5016',          // forestGreen
    disputed: '#8B1A1A',          // sindoor
    pending_confirmation: '#D89B3C', // ochre
  },
} as const;

export type ColorToken = keyof typeof colors;
export type StatusType = keyof typeof colors.status;
