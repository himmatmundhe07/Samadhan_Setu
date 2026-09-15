/**
 * Samadhan Setu — Numeric PIN Keypad
 * Designed for non-literate tribal citizens:
 * - 4-6 digit visual bubble/dot display
 * - Large tactile on-screen numeric keypad (no typed keyboard needed)
 * - Auditory verification: Speaks every pressed digit aloud in the citizen's language
 * - Auditory and visual delete/clear buttons
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { Delete, RotateCcw, Lock } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { speakDigit } from '../../services/voiceFeedback.service';

interface NumericPinKeypadProps {
  pin: string;
  onChangePin: (pin: string) => void;
  maxLength?: number;
  labelHi?: string;
  labelEn?: string;
  onComplete?: (pin: string) => void;
}

export function NumericPinKeypad({
  pin,
  onChangePin,
  maxLength = 4,
  labelHi = '४-अंकों का गुप्त पिन बनाएं / दर्ज करें',
  labelEn = 'Enter your 4-digit secret PIN',
  onComplete,
}: NumericPinKeypadProps) {
  const language = useAppStore((s) => s.language);

  const handleKeyPress = async (digit: string) => {
    if (pin.length >= maxLength) return;

    try {
      Vibration.vibrate(25);
    } catch {}

    const nextPin = pin + digit;
    onChangePin(nextPin);

    // Speak digit aloud in selected language
    speakDigit(digit, language).catch(() => {});

    if (nextPin.length === maxLength && onComplete) {
      setTimeout(() => onComplete(nextPin), 300);
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) return;
    try {
      Vibration.vibrate(35);
    } catch {}
    onChangePin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (pin.length === 0) return;
    try {
      Vibration.vibrate(50);
    } catch {}
    onChangePin('');
  };

  return (
    <View style={styles.container}>
      {/* Label and Lock Icon */}
      <View style={styles.labelRow}>
        <Lock size={20} color={colors.forestGreen} />
        <Text style={styles.labelHi}>{labelHi}</Text>
      </View>
      <Text style={styles.labelEn}>{labelEn}</Text>

      {/* Visual Dot Bubbles */}
      <View style={styles.dotsRow}>
        {Array.from({ length: maxLength }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isFilled && styles.dotFilled,
                index === pin.length && styles.dotCurrent,
              ]}
            >
              {isFilled && <View style={styles.dotInner} />}
            </View>
          );
        })}
      </View>

      {/* On-Screen Keypad Grid */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['clear', '0', 'backspace'],
        ].map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keyRow}>
            {row.map((item) => {
              if (item === 'clear') {
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={handleClear}
                    style={[styles.keyButton, styles.specialKey]}
                    accessibilityRole="button"
                    accessibilityLabel="Clear PIN"
                  >
                    <RotateCcw size={24} color={colors.mudBrown} />
                  </TouchableOpacity>
                );
              }

              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={handleDelete}
                    style={[styles.keyButton, styles.specialKey]}
                    accessibilityRole="button"
                    accessibilityLabel="Backspace"
                  >
                    <Delete size={26} color={colors.sindoor} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleKeyPress(item)}
                  style={styles.keyButton}
                  activeOpacity={0.65}
                  accessibilityRole="button"
                  accessibilityLabel={`Digit ${item}`}
                >
                  <Text style={styles.keyText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  labelHi: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
    textAlign: 'center',
  },
  labelEn: {
    fontSize: 12,
    color: colors.mudBrown,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#D7CCC8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    borderColor: colors.forestGreen,
    backgroundColor: '#E8F5E9',
  },
  dotCurrent: {
    borderColor: colors.terracotta,
    transform: [{ scale: 1.15 }],
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forestGreen,
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyButton: {
    flex: 1,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8DFD0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  specialKey: {
    backgroundColor: '#F8F5EE',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.mudBrown,
  },
});
