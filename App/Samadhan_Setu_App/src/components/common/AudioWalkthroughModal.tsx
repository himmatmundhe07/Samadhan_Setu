/**
 * Samadhan Setu — First-Launch Audio Walkthrough Modal
 * Visual-first, zero-reading onboarding walkthrough:
 * - 4 large illustrated slides explaining the core grievance reporting steps
 * - Auto-plays audio narration in the citizen's selected language on each slide
 * - Prominent Skip icon button (Fast-Forward arrow)
 * - Accessible again anytime via the "Help" icon in Profile
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Camera,
  Mic,
  MapPin,
  CheckCircle2,
  FastForward,
  ChevronRight,
  ChevronLeft,
  Volume2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { WALKTHROUGH_SLIDES, playSpeech, stopSpeech } from '../../services/voiceFeedback.service';

const { width } = Dimensions.get('window');

interface AudioWalkthroughModalProps {
  visible: boolean;
  onFinish: () => void;
}

export function AudioWalkthroughModal({ visible, onFinish }: AudioWalkthroughModalProps) {
  const language = useAppStore((s) => s.language);
  const setHasCompletedWalkthrough = useAppStore((s) => s.setHasCompletedWalkthrough);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slide = WALKTHROUGH_SLIDES[currentSlideIndex];

  // Auto-play narration whenever slide changes or modal becomes visible
  useEffect(() => {
    if (!visible) {
      stopSpeech();
      return;
    }

    const narration = (slide.audioText as any)[language] || slide.audioText.hi;
    const timer = setTimeout(() => {
      playSpeech(narration, language);
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [visible, currentSlideIndex, language]);

  const handleNext = () => {
    if (currentSlideIndex < WALKTHROUGH_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    stopSpeech();
    setHasCompletedWalkthrough(true);
    onFinish();
  };

  const renderSlideIllustration = () => {
    const iconSize = 72;
    switch (slide.id) {
      case 'photo':
        return (
          <View style={[styles.illustrationCircle, { backgroundColor: '#E8F5E9' }]}>
            <Camera size={iconSize} color="#2E7D32" />
          </View>
        );
      case 'voice':
        return (
          <View style={[styles.illustrationCircle, { backgroundColor: '#FFF3E0' }]}>
            <Mic size={iconSize} color="#E65100" />
          </View>
        );
      case 'location':
        return (
          <View style={[styles.illustrationCircle, { backgroundColor: '#E1F5FE' }]}>
            <MapPin size={iconSize} color="#0288D1" />
          </View>
        );
      case 'track':
        return (
          <View style={[styles.illustrationCircle, { backgroundColor: '#EDE7F6' }]}>
            <CheckCircle2 size={iconSize} color="#512DA8" />
          </View>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Top bar with large Skip Icon button */}
        <View style={styles.topBar}>
          <View style={styles.audioIndicator}>
            <Volume2 size={20} color={colors.forestGreen} />
            <Text style={styles.audioIndicatorText}>सुनिए • Audio Guide</Text>
          </View>

          <TouchableOpacity
            onPress={handleComplete}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip Walkthrough"
          >
            <FastForward size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Hero Visual Card */}
        <View style={styles.cardContainer}>
          {renderSlideIllustration()}

          {/* Dual bilingual label for visual accessibility */}
          <Text style={styles.titleHi}>{slide.titleHi}</Text>
          <Text style={styles.titleEn}>{slide.titleEn}</Text>

          {/* Spoken text display (secondary reinforcement) */}
          <View style={styles.speechBubble}>
            <Volume2 size={22} color={colors.terracotta} style={{ marginRight: 8 }} />
            <Text style={styles.speechText}>
              {(slide.audioText as any)[language] || slide.audioText.hi}
            </Text>
          </View>

          {/* Stepper Dots */}
          <View style={styles.dotsRow}>
            {WALKTHROUGH_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentSlideIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomBar}>
          {currentSlideIndex > 0 ? (
            <TouchableOpacity onPress={handlePrev} style={styles.navButtonSecondary}>
              <ChevronLeft size={28} color={colors.forestGreen} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          <TouchableOpacity onPress={handleNext} style={styles.navButtonPrimary}>
            {currentSlideIndex === WALKTHROUGH_SLIDES.length - 1 ? (
              <CheckCircle2 size={32} color="#FFFFFF" />
            ) : (
              <ChevronRight size={34} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5EE',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  audioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audioIndicatorText: {
    color: colors.forestGreen,
    fontWeight: '700',
    fontSize: 13,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mudBrown,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  titleHi: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.forestGreen,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleEn: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mudBrown,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8DFD0',
    elevation: 3,
    maxWidth: width - 48,
  },
  speechText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.mudBrown,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.forestGreen,
  },
  dotInactive: {
    width: 10,
    backgroundColor: '#D7CCC8',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navButtonPrimary: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  navButtonSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
