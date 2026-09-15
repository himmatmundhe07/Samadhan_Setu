/**
 * Samadhan Setu — StatusBadge Component
 * RULE: Always shows color + icon + text together. NEVER color alone.
 * This is the core accessibility component for colorblind-safe status display.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProblemStatus, statusConfig } from '../../utils/statusConfig';
import { useAppStore } from '../../store/appStore';
import { fontSize } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface StatusBadgeProps {
  status: ProblemStatus;
  size?: 'small' | 'default' | 'large';
}

// Map status icon names to emoji fallbacks (avoids Lucide dependency in this file)
const statusEmojis: Record<ProblemStatus, string> = {
  submitted: '📤',
  verified: '✅',
  assigned: '👤',
  in_progress: '⏳',
  resolved: '✔️',
  disputed: '⚠️',
  pending_confirmation: '❓',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'default',
}) => {
  const language = useAppStore((s) => s.language);
  const config = statusConfig[status];

  if (!config) return null;

  const label = language === 'hi' ? config.labelHi : config.labelEn;
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          paddingHorizontal: isSmall ? 8 : isLarge ? 16 : 12,
          paddingVertical: isSmall ? 4 : isLarge ? 10 : 6,
        },
      ]}
    >
      <Text
        style={[
          styles.emoji,
          { fontSize: isSmall ? 12 : isLarge ? 20 : 16 },
        ]}
      >
        {statusEmojis[status]}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: isSmall ? 11 : isLarge ? fontSize.lg : fontSize.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: 6,
    alignSelf: 'flex-start',
  },
  emoji: {
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
  },
});
