/**
 * Samadhan Setu — Button Component
 * Variants: primary (forestGreen), secondary (ochre), emergency (sindoor), outline
 * Min height: 64px, min touch target: 48×48px
 * Icon + label layout (icon left, label right)
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { touchTargets, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'outline' | 'ghost' | 'terracotta';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'default' | 'small';
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.forestGreen, text: '#FFFFFF', border: colors.forestGreen },
  secondary: { bg: colors.ochre, text: '#FFFFFF', border: colors.ochre },
  terracotta: { bg: colors.terracotta, text: '#FFFFFF', border: colors.terracotta },
  emergency: { bg: colors.sindoor, text: '#FFFFFF', border: colors.sindoor },
  outline: { bg: 'transparent', text: colors.forestGreen, border: colors.forestGreen },
  ghost: { bg: 'transparent', text: colors.mudBrown, border: 'transparent' },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  size = 'default',
}) => {
  const varStyle = variantStyles[variant];
  const isSmall = size === 'small';
  const opacity = disabled || loading ? 0.6 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: varStyle.bg,
          borderColor: varStyle.border,
          minHeight: isSmall ? touchTargets.minimum : touchTargets.buttonHeight,
          opacity,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={varStyle.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: varStyle.text,
                fontSize: isSmall ? 16 : textStyles.button.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
