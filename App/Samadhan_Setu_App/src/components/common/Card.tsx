/**
 * Samadhan Setu — Card Component
 * chuna background with terracotta border accent.
 * Slots for photo thumbnail and status badge.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { SohraiCardCorner } from './SohraiCardCorner';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  borderAccent?: boolean;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = true,
  borderAccent = false,
  accessibilityLabel,
}) => {
  const cardStyle = useMemo(
    () => [
      styles.card,
      elevated && styles.elevated,
      borderAccent && styles.borderAccent,
      style,
    ],
    [elevated, borderAccent, style]
  );

  const content = (
    <>
      {/* Decorative Sohrai corner motif, positioned top-right behind content */}
      <SohraiCardCorner />
      <View style={styles.contentContainer}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: false, ...({ pressed: false } as any) }}
        accessibilityLabel={accessibilityLabel || 'Card'}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative', // for absolute corner motif
    overflow: 'hidden', // keep motif inside card bounds
  },
  contentContainer: {
    padding: spacing.base,
    zIndex: 1, // ensure content sits above the corner motif
  },
  elevated: {
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4, // React Native Android shadow
    backgroundColor: colors.surface,
  },
  borderAccent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.terracotta,
  },
  cornerMotif: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 0,
    opacity: 0.8,
  },
});
