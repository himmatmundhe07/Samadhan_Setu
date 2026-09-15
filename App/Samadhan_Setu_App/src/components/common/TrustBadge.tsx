import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface TrustBadgeProps {
  count?: number;
  supportCount?: number;
  label?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ 
  count,
  supportCount,
  label = "लोगों ने भी यह समस्या बताई" 
}) => {
  const actualCount = count ?? supportCount ?? 0;
  // If count is 0 or 1, hide badge entirely
  if (actualCount <= 1) return null;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${actualCount} ${label}`}
    >
      <View style={styles.iconContainer} importantForAccessibility="no">
        <Users size={14} color={colors.surface} />
      </View>
      <Text style={styles.text}>
        <Text style={styles.countText}>{actualCount} </Text>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6D2', // A slightly darker chuna for contrast
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    backgroundColor: colors.turmeric,
    borderRadius: borderRadius.full,
    padding: 4,
    marginRight: spacing.sm,
  },
  text: {
    ...textStyles.label,
    color: colors.textDark,
  },
  countText: {
    fontFamily: textStyles.bodyBold.fontFamily,
    color: colors.forestGreen,
    fontWeight: '700',
  },
});
