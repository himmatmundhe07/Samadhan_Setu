import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface SohraiCardCornerProps {
  style?: ViewStyle;
  color?: string;
  size?: number;
}

export const SohraiCardCorner: React.FC<SohraiCardCornerProps> = ({
  style,
  color = colors.terracotta,
  size = 26,
}) => {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        {/* Sohrai leaf line-art motif in vector SVG */}
        <Path
          d="M 14 3 C 20 6, 25 12, 25 21 C 21 25, 12 25, 14 3 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M 14 3 C 15 10, 17 16, 21 21"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <Circle cx="8" cy="8" r="1.5" fill={colors.ochre} />
        <Circle cx="12" cy="6" r="1" fill={color} />
        <Circle cx="6" cy="12" r="1" fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 0,
    opacity: 0.85,
  },
});
