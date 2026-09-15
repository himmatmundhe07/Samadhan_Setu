import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, Image } from 'react-native';

interface SohraiBorderFullProps {
  variant?: 'full' | 'footer';
  style?: ViewStyle;
}

const { width, height } = Dimensions.get('window');

export const SohraiBorderFull: React.FC<SohraiBorderFullProps> = ({
  variant = 'full',
  style,
}) => {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Image
        source={require('../../../assets/p5.webp')}
        style={[
          styles.image,
          variant === 'footer' ? styles.footerImage : styles.fullImage
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  image: {
    width: '100%',
  },
  fullImage: {
    height: height,
  },
  footerImage: {
    height: 100,
    position: 'absolute',
    bottom: 0,
  }
});
