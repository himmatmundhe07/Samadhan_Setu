/**
 * Samadhan Setu — Audio-First Language Picker
 * Designed for non-literate tribal citizens:
 * - 12 large tappable language cards with distinct visual symbols and colors
 * - Auto-plays first 2-3 languages sequentially on screen load (with Pause/Resume button)
 * - Tapping any card immediately speaks: "अगर आप [भाषा] बोलते हैं, तो यहाँ दबाएँ" in that language
 * - Stores the selection so users never need to read text to configure their app
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  Volume2,
  VolumeX,
  Check,
  Sparkles,
  TreePine,
  Feather,
  Flame,
  Sun,
  Waves,
  Mountain,
  Flower2,
  Shield,
  Disc,
  Play,
  Pause,
} from 'lucide-react-native';
import i18n from '../../utils/i18n';
import { useAppStore, Language } from '../../store/appStore';
import { colors } from '../../theme/colors';
import { playLanguageAudioSample, stopSpeech } from '../../services/voiceFeedback.service';

export interface LanguageOption {
  id: Language;
  label: string;
  sub: string;
  symbolName: string;
  bgColor: string;
  accentColor: string;
  IconComponent: any;
}

export const ALL_LANGUAGES: LanguageOption[] = [
  {
    id: 'hi',
    label: 'हिंदी',
    sub: 'Hindi',
    symbolName: 'सूर्य / Sun',
    bgColor: '#FFF3E0',
    accentColor: '#E65100',
    IconComponent: Sun,
  },
  {
    id: 'sat',
    label: 'ᱥᱟᱱᱛᱟᱲᱤ',
    sub: 'Santhali',
    symbolName: 'धनुष-पंख / Feather',
    bgColor: '#E8F5E9',
    accentColor: '#2E7D32',
    IconComponent: Feather,
  },
  {
    id: 'kht',
    label: 'खोरठा',
    sub: 'Khortha',
    symbolName: 'साल वृक्ष / Sal Tree',
    bgColor: '#F1F8E9',
    accentColor: '#33691E',
    IconComponent: TreePine,
  },
  {
    id: 'nag',
    label: 'नागपुरी',
    sub: 'Nagpuri',
    symbolName: 'मांदर / Drum',
    bgColor: '#FBE9E7',
    accentColor: '#BF360C',
    IconComponent: Disc,
  },
  {
    id: 'kru',
    label: 'कुड़ुख़',
    sub: 'Kurukh',
    symbolName: 'ढाल / Shield',
    bgColor: '#EDE7F6',
    accentColor: '#4A148C',
    IconComponent: Shield,
  },
  {
    id: 'bho',
    label: 'भोजपुरी',
    sub: 'Bhojpuri',
    symbolName: 'दीपक / Lamp',
    bgColor: '#FFF8E1',
    accentColor: '#FF6F00',
    IconComponent: Flame,
  },
  {
    id: 'anp',
    label: 'अंगिका',
    sub: 'Angika',
    symbolName: 'नदी / River',
    bgColor: '#E0F7FA',
    accentColor: '#006064',
    IconComponent: Waves,
  },
  {
    id: 'mag',
    label: 'मगही',
    sub: 'Magahi',
    symbolName: 'कमल / Lotus',
    bgColor: '#FCE4EC',
    accentColor: '#880E4F',
    IconComponent: Flower2,
  },
  {
    id: 'mai',
    label: 'मैथिली',
    sub: 'Maithili',
    symbolName: 'पहाड़ / Hill',
    bgColor: '#E1F5FE',
    accentColor: '#01579B',
    IconComponent: Mountain,
  },
  {
    id: 'bn',
    label: 'বাংলা',
    sub: 'Bengali',
    symbolName: 'তরঙ্গ / Waves',
    bgColor: '#F3E5F5',
    accentColor: '#4A148C',
    IconComponent: Sparkles,
  },
  {
    id: 'or',
    label: 'ଓଡ଼ିଆ',
    sub: 'Odia',
    symbolName: 'ଶଙ୍ଖ / Conch',
    bgColor: '#FFFDE7',
    accentColor: '#F57F17',
    IconComponent: Sun,
  },
  {
    id: 'en',
    label: 'English',
    sub: 'English',
    symbolName: 'Global',
    bgColor: '#ECEFF1',
    accentColor: '#263238',
    IconComponent: Disc,
  },
];

interface AudioLanguagePickerProps {
  onLanguageSelected?: (lang: Language) => void;
  isEmbedded?: boolean; // When rendered inside Profile screen vs Full-Screen First Launch
}

export function AudioLanguagePicker({
  onLanguageSelected,
  isEmbedded = false,
}: AudioLanguagePickerProps) {
  const currentLang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setHasSelectedLanguage = useAppStore((s) => s.setHasSelectedLanguage);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayCancelled = useRef(false);

  // Auto-play top 3 languages on initial load if not embedded
  useEffect(() => {
    if (isEmbedded) return;

    let timeoutId: any = null;
    autoPlayCancelled.current = false;
    setIsAutoPlaying(true);

    const runAutoPlay = async () => {
      // Sequence: Hindi, Santhali, Nagpuri
      const initialSequence = ['hi', 'sat', 'nag'];
      for (const langId of initialSequence) {
        if (autoPlayCancelled.current) break;
        setPlayingId(langId);
        try {
          await playLanguageAudioSample(langId);
          // Wait ~2.5s between prompts
          await new Promise((res) => {
            timeoutId = setTimeout(res, 2600);
          });
        } catch {
          // ignore
        }
      }
      if (!autoPlayCancelled.current) {
        setPlayingId(null);
        setIsAutoPlaying(false);
      }
    };

    // Small delay after mount before starting auto-play
    const initialDelay = setTimeout(() => {
      runAutoPlay();
    }, 600);

    return () => {
      autoPlayCancelled.current = true;
      clearTimeout(initialDelay);
      if (timeoutId) clearTimeout(timeoutId);
      stopSpeech();
    };
  }, [isEmbedded]);

  const handleToggleAutoPlay = async () => {
    if (isAutoPlaying) {
      autoPlayCancelled.current = true;
      setIsAutoPlaying(false);
      setPlayingId(null);
      await stopSpeech();
    } else {
      autoPlayCancelled.current = false;
      setIsAutoPlaying(true);
      // Play current or Hindi
      setPlayingId(currentLang);
      await playLanguageAudioSample(currentLang);
    }
  };

  const handleSelectLanguage = async (item: LanguageOption) => {
    autoPlayCancelled.current = true;
    setIsAutoPlaying(false);
    setPlayingId(item.id);

    try {
      // Play audio audition immediately
      await playLanguageAudioSample(item.id);
    } catch {}

    // Apply language globally
    setLanguage(item.id);
    i18n.changeLanguage(item.id);
    setHasSelectedLanguage(true);

    if (onLanguageSelected) {
      onLanguageSelected(item.id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isEmbedded && styles.containerEmbedded]}>
      {/* Header with audio instructions and Pause/Resume button */}
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Volume2 size={32} color={colors.forestGreen} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>अपनी भाषा चुनें / Choose Language</Text>
          <Text style={styles.subtitle}>
            आवाज सुनकर पहचानें और दबाएं • Listen and tap your language
          </Text>
        </View>

        {!isEmbedded && (
          <TouchableOpacity
            style={[styles.pauseBtn, isAutoPlaying && styles.pauseBtnActive]}
            onPress={handleToggleAutoPlay}
            accessibilityLabel={isAutoPlaying ? 'Pause Audio Guide' : 'Play Audio Guide'}
          >
            {isAutoPlaying ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color={colors.forestGreen} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 12-Language Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {ALL_LANGUAGES.map((item) => {
            const isSelected = currentLang === item.id;
            const isPlaying = playingId === item.id;
            const Icon = item.IconComponent;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSelectLanguage(item)}
                style={[
                  styles.card,
                  { backgroundColor: item.bgColor },
                  isSelected && styles.cardSelected,
                  isPlaying && styles.cardPlaying,
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} (${item.sub})`}
              >
                {/* Visual Icon Badge */}
                <View style={[styles.iconCircle, { backgroundColor: item.accentColor }]}>
                  <Icon size={26} color="#FFFFFF" />
                </View>

                {/* Primary Script Label */}
                <Text style={[styles.langLabel, { color: item.accentColor }]}>
                  {item.label}
                </Text>

                {/* Secondary English Subtext */}
                <Text style={styles.langSub}>{item.sub}</Text>

                {/* Audio Playing Wave / Speaker Indicator */}
                <View style={styles.bottomRow}>
                  {isPlaying ? (
                    <View style={styles.audioWaveBadge}>
                      <Volume2 size={16} color={item.accentColor} />
                      <Text style={[styles.audioWaveText, { color: item.accentColor }]}>
                        बोल रहा है...
                      </Text>
                    </View>
                  ) : isSelected ? (
                    <View style={styles.selectedBadge}>
                      <Check size={14} color="#FFFFFF" />
                      <Text style={styles.selectedBadgeText}>चुना हुआ</Text>
                    </View>
                  ) : (
                    <View style={styles.listenHint}>
                      <Volume2 size={14} color={colors.mudBrown} opacity={0.6} />
                      <Text style={styles.listenHintText}>सुनें</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5EE',
  },
  containerEmbedded: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DFD0',
    gap: 12,
  },
  headerIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.forestGreen}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.mudBrown,
  },
  subtitle: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  pauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.forestGreen}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
  },
  pauseBtnActive: {
    backgroundColor: colors.forestGreen,
  },
  gridContent: {
    padding: 12,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 4,
  },
  cardSelected: {
    borderColor: colors.forestGreen,
    borderWidth: 2.5,
    transform: [{ scale: 1.02 }],
  },
  cardPlaying: {
    borderColor: '#E65100',
    borderWidth: 2.5,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
  },
  langLabel: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  langSub: {
    fontSize: 12,
    color: colors.mudBrown,
    opacity: 0.75,
    fontWeight: '600',
    marginBottom: 8,
  },
  bottomRow: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  audioWaveText: {
    fontSize: 10,
    fontWeight: '700',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listenHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listenHintText: {
    fontSize: 11,
    color: colors.mudBrown,
    opacity: 0.6,
    fontWeight: '600',
  },
});
