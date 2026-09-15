/**
 * Samadhan Setu — Typography System
 * Minimum sizes for low-literacy, rural users.
 * Devanagari support mandatory for all fonts.
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Devanagari fallback
  devanagari: 'NotoSansDevanagari_400Regular',
  devanagariBold: 'NotoSansDevanagari_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,    // Minimum body text — NEVER go below this
  lg: 18,      // Button text minimum
  xl: 20,
  '2xl': 24,
  '3xl': 28,   // H1
  '4xl': 32,
  '5xl': 40,   // Hero numbers (counters)
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,   // Default — generous for reading fatigue reduction
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const textStyles = {
  h1: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.bold,
    lineHeight: lineHeight.tight,
  },
  h2: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.semiBold,
    lineHeight: lineHeight.tight,
  },
  h3: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
    lineHeight: lineHeight.normal,
  },
  body: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    lineHeight: lineHeight.normal,
  },
  bodyBold: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.bold,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semiBold,
    lineHeight: lineHeight.tight,
  },
  caption: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    lineHeight: lineHeight.normal,
  },
  label: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.medium,
    lineHeight: lineHeight.tight,
  },
  heroNumber: {
    fontSize: fontSize['5xl'],
    fontFamily: fontFamily.bold,
    lineHeight: lineHeight.tight,
  },
} as const;
