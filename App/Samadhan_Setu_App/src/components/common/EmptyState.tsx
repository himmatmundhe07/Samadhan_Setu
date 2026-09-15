/**
 * Samadhan Setu — EmptyState Component
 * Encouraging illustration + Devanagari message.
 * Never makes user feel bad about having no data.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type EmptyVariant = 'no-complaints' | 'offline' | 'no-notifications' | 'no-data';

interface EmptyStateProps {
  variant: EmptyVariant;
  message?: string;
  submessage?: string;
}

const emptyConfig: Record<EmptyVariant, { emoji: string; defaultMsg: string; defaultSub: string }> = {
  'no-complaints': {
    emoji: '🌳',
    defaultMsg: 'अभी कोई शिकायत नहीं है',
    defaultSub: 'अपनी पहली शिकायत करो!',
  },
  offline: {
    emoji: '📡',
    defaultMsg: 'ऑफ़लाइन',
    defaultSub: 'नेटवर्क आते ही अपडेट हो जाएगा',
  },
  'no-notifications': {
    emoji: '🔔',
    defaultMsg: 'अभी कोई सूचना नहीं',
    defaultSub: 'जब कुछ अपडेट होगा, यहाँ दिखेगा',
  },
  'no-data': {
    emoji: '📊',
    defaultMsg: 'अभी कम डेटा है',
    defaultSub: 'जैसे-जैसे रिपोर्ट आएँगी यहाँ दिखेगा',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  message,
  submessage,
}) => {
  const config = emptyConfig[variant];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={styles.message}>{message || config.defaultMsg}</Text>
      <Text style={styles.submessage}>{submessage || config.defaultSub}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: fontSize.xl,
    color: colors.mudBrown,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submessage: {
    fontSize: fontSize.base,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: 24,
  },
});
