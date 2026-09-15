import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore, Language } from '../../store/appStore';
import i18n from '../../utils/i18n';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SamadhanHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  style?: any;
}

export function SamadhanLogo({ size = 42 }: { size?: number }) {
  return (
    <View
      style={[
        styles.logoCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100">
        {/* Central stem */}
        <Path
          d="M50 92 L50 42"
          stroke="#1B4D3E"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Central top leaf */}
        <Path
          d="M50 42 C40 28, 44 14, 50 8 C56 14, 60 28, 50 42 Z"
          fill="#1B4D3E"
        />
        {/* Left top leaf */}
        <Path
          d="M48 50 C32 40, 22 28, 22 16 C32 20, 42 34, 48 50 Z"
          fill="#1B4D3E"
        />
        {/* Right top leaf */}
        <Path
          d="M52 50 C68 40, 78 28, 78 16 C68 20, 58 34, 52 50 Z"
          fill="#1B4D3E"
        />
        {/* Left bottom leaf */}
        <Path
          d="M49 66 C30 64, 16 54, 14 42 C26 44, 40 56, 49 66 Z"
          fill="#1B4D3E"
        />
        {/* Right bottom leaf */}
        <Path
          d="M51 66 C70 64, 84 54, 86 42 C74 44, 60 56, 51 66 Z"
          fill="#1B4D3E"
        />
      </Svg>
    </View>
  );
}

export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

const LANGUAGES: Language[] = ['hi', 'en', 'sat', 'kht', 'nag', 'bho', 'anp', 'mag', 'mai', 'kru', 'or', 'bn'];
const LANG_DISPLAY: Record<string, string> = {
  hi: 'HI',
  en: 'EN',
  sat: 'ᱥᱟᱱ',
  kht: 'खोर',
  nag: 'नाग',
  bho: 'भोज',
  anp: 'अंग',
  mag: 'मग',
  mai: 'मैथ',
  kru: 'कुड़',
  or: 'ଓଡ଼ି',
  bn: 'বাং',
};

export function SamadhanHeader({ showBack = false, onBack, style }: SamadhanHeaderProps) {
  const router = useRouter();
  const { language, setLanguage } = useAppStore();

  const handleLanguageToggle = () => {
    const currentIndex = LANGUAGES.indexOf(language as Language);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % LANGUAGES.length;
    const nextLang = LANGUAGES[nextIndex];
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <SamadhanLogo size={42} />

        <View style={styles.titleColumn}>
          <View style={styles.brandRow}>
            <Text style={styles.brandMain}>SAMADHANSETU </Text>
            <Text style={styles.brandAi}>AI</Text>
          </View>
          <Text style={styles.tagline} numberOfLines={1}>
            From a citizen's problem to a scalable solution.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.langPill}
        onPress={handleLanguageToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.langText}>
          {LANG_DISPLAY[language] || language.toUpperCase()}
        </Text>
        <ChevronDown size={14} color="#FFFFFF" style={{ marginLeft: 3 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 10,
    zIndex: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: 4,
  },
  logoCircle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandAi: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF9933', // saffron / vibrant warm accent
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10,
    color: '#D2E7D6',
    fontWeight: '500',
    marginTop: 1,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
