/**
 * Samadhan Setu — ProgressDots Component
 * Visual dots: filled = completed, pulsing = current, empty = upcoming.
 * No "Step X of Y" text — only visual.
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ProgressDotsProps {
  total: number;
  current: number; // 0-indexed
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ total, current }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        const isUpcoming = i > current;

        return (
          <View key={i} style={styles.dotWrapper}>
            <View
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isCurrent && styles.dotCurrent,
                isUpcoming && styles.dotUpcoming,
              ]}
            />
            {/* Connector line between dots */}
            {i < total - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted ? styles.connectorCompleted : styles.connectorUpcoming,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
  },
  dotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotCompleted: {
    backgroundColor: colors.forestGreen,
  },
  dotCurrent: {
    backgroundColor: colors.ochre,
    borderWidth: 3,
    borderColor: colors.turmeric,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dotUpcoming: {
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: '#D4C4A8',
  },
  connector: {
    height: 3,
    width: 32,
    marginHorizontal: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.forestGreen,
  },
  connectorUpcoming: {
    backgroundColor: colors.borderLight,
  },
});
