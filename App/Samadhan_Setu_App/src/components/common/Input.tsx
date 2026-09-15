/**
 * Samadhan Setu — Input Component
 * Large touch target, 16px+ text, adjacent 🎤 voice button.
 * Label above (never floating), error state with sindoor border.
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, touchTargets } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showVoiceButton?: boolean;
  onVoicePress?: () => void;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  showVoiceButton = false,
  onVoicePress,
  containerStyle,
  icon,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? { paddingLeft: 0 } : null]}
          placeholderTextColor={colors.borderLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={textInputProps.accessibilityLabel || label || (typeof textInputProps.placeholder === 'string' ? textInputProps.placeholder : undefined)}
          {...textInputProps}
        />
        {showVoiceButton && (
          <TouchableOpacity
            onPress={onVoicePress}
            style={styles.voiceButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Voice input"
            accessibilityRole="button"
          >
            <Text style={styles.voiceEmoji}>🎤</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fontSize.base,
    color: colors.mudBrown,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    minHeight: touchTargets.minimum + 8, // 56px
    paddingHorizontal: spacing.base,
  },
  inputFocused: {
    borderColor: colors.forestGreen,
  },
  inputError: {
    borderColor: colors.sindoor,
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.charcoal,
    paddingVertical: spacing.md,
    minHeight: touchTargets.minimum,
  },
  voiceButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  voiceEmoji: {
    fontSize: 24,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.sindoor,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
