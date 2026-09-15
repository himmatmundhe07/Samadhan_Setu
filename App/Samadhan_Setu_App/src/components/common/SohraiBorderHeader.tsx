import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';

interface SohraiBorderHeaderProps {
  style?: ViewStyle;
  width?: number;
  height?: number;
}

export const SohraiBorderHeader: React.FC<SohraiBorderHeaderProps> = ({
  style,
  width,
  height = 50,
}) => {
  return (
    <View pointerEvents="none" style={[styles.container, { width, height }, style]}>
      <Image
        source={require('../../../assets/p2.webp')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
