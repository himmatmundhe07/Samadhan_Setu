/**
 * Samadhan Setu — OfflineBanner Component
 * Warm, reassuring banner when offline — never scary.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const isOffline = useAppStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.emoji}>📡</Text>
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.turmeric}30`,
    borderBottomWidth: 1,
    borderBottomColor: colors.turmeric,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.mudBrown,
    fontWeight: '500',
  },
});
