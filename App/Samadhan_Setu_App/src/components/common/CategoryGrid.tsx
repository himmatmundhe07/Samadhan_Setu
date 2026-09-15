/**
 * Samadhan Setu — CategoryGrid Component
 * 8 categories + 1 emergency (sindoor red, visually distinct).
 * Icon + label, 72×72px icons, bold touch targets.
 * 3-column grid with generous spacing.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { categories, CategoryId, CategoryConfig } from '../../utils/categories';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, touchTargets } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';

interface CategoryGridProps {
  onSelect: (category: CategoryConfig) => void;
  selectedId?: CategoryId | null;
}

const GRID_PADDING = spacing.xl;
const COLUMN_GAP = spacing.md;
const COLUMNS = 3;

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelect,
  selectedId,
}) => {
  const language = useAppStore((s) => s.language);
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - GRID_PADDING * 2 - COLUMN_GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        const isEmergency = cat.isEmergency;
        const label = language === 'hi' ? cat.labelHi : cat.labelEn;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.item,
              { width: itemWidth },
              isSelected && styles.itemSelected,
              isEmergency && styles.itemEmergency,
              isSelected && isEmergency && styles.itemEmergencySelected,
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isEmergency
                    ? `${colors.sindoor}20`
                    : `${cat.color}15`,
                  borderColor: isSelected ? cat.color : 'transparent',
                },
                isEmergency && { borderColor: colors.sindoor },
              ]}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <Text
              style={[
                styles.label,
                isEmergency && styles.labelEmergency,
                isSelected && { fontWeight: '700' },
              ]}
              numberOfLines={2}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COLUMN_GAP,
    paddingVertical: spacing.base,
  },
  item: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: colors.forestGreen,
    backgroundColor: `${colors.forestGreen}08`,
  },
  itemEmergency: {
    borderColor: `${colors.sindoor}40`,
    backgroundColor: `${colors.sindoor}08`,
  },
  itemEmergencySelected: {
    borderColor: colors.sindoor,
    backgroundColor: `${colors.sindoor}15`,
  },
  iconCircle: {
    width: touchTargets.categoryIcon,
    height: touchTargets.categoryIcon,
    borderRadius: touchTargets.categoryIcon / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.mudBrown,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  labelEmergency: {
    color: colors.sindoor,
    fontWeight: '700',
  },
});
