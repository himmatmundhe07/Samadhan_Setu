import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface SohraiTreeIllustrationProps {
  title?: string;
  message?: string;
  style?: ViewStyle;
}

export const SohraiTreeIllustration: React.FC<SohraiTreeIllustrationProps> = ({
  title,
  message,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/p4.webp')}
        style={styles.image}
        resizeMode="contain"
      />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.mudBrown,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.base,
    color: colors.charcoal,
    textAlign: 'center',
  },
});
