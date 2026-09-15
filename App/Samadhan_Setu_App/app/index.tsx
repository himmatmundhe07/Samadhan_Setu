/**
 * Samadhan Setu — Home Screen (Public Landing & Auth Gateway)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  VoiceGuideButton,
  SamadhanHeader,
  GoogleLogo,
} from '../src/components/common';
import { colors } from '../src/theme/colors';
import { spacing, screenPadding } from '../src/theme/spacing';
import { useAuthStore } from '../src/store/authStore';
import { problemService } from '../src/services/problem.service';
import { ArrowRight, LogIn, UserPlus, FileText } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, setGuest } = useAuthStore();
  const [stats, setStats] = useState({ totalComplaints: 12450, totalResolved: 9820 });
  const [counterAnim] = useState(new Animated.Value(0));

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  // Load live stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await problemService.getStats();
        if (data && (data.totalComplaints > 0 || data.totalResolved > 0)) {
          setStats(data);
        }
      } catch (e) {
        // Fallback
      } finally {
        Animated.timing(counterAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }).start();
      }
    };
    loadStats();
  }, []);

  const handleStartReport = () => {
    setGuest(true);
    router.push('/(tabs)/submit');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleGoogleSignIn = () => {
    setGuest(true);
    router.push('/(tabs)/dashboard');
  };

  const isHindi = i18n.language === 'hi';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Background with Top Green Wave & Bottom Sohrai Art */}
      <Image
        source={require('../assets/home_bg_v2.jpg')}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', zIndex: -1 }]}
        resizeMode="cover"
      />

      {/* Top Header inside Green Banner */}
      <SamadhanHeader showBack={false} />

      {/* Floating Voice Guide at top */}
      <View style={styles.voiceGuideWrapper}>
        <VoiceGuideButton text={t('home.voiceGuide') || 'समाधान सेतु में आपका स्वागत है। अगर आप नए हैं तो पहले रजिस्ट्रेशन करें या लॉगिन करें।'} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Main Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeText}>
              {isHindi ? 'जय जोहार!' : 'Jai Johar!'}
            </Text>
            <Text style={styles.subWelcomeText}>
              {isHindi
                ? 'झारखंड के बेहतर कल के लिए एक कदम'
                : 'Together for a better Jharkhand'}
            </Text>
          </View>

          {/* Live Counter — Trust Signal */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: counterAnim,
                transform: [
                  {
                    scale: counterAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats.totalComplaints.toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}
              </Text>
              <Text style={styles.statLabel}>
                {isHindi ? 'कुल शिकायतें' : 'Total Complaints'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.leafGreen }]}>
                {stats.totalResolved.toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}
              </Text>
              <Text style={styles.statLabel}>
                {isHindi ? 'सुलझाए गए' : 'Resolved'}
              </Text>
            </View>
          </Animated.View>

          {/* Auth Portal & Gateway Options */}
          <View style={styles.authPortalCard}>
            <Text style={styles.portalTitle}>
              {isHindi ? 'पोर्टल प्रवेश / Auth Gateway' : 'Citizen Portal Access'}
            </Text>
            <Text style={styles.portalSubtitle}>
              {isHindi
                ? 'नए नागरिक पहले रजिस्ट्रेशन करें, फिर लॉगिन करें'
                : 'New users register first, then log in'}
            </Text>

            <View style={styles.dualBtnRow}>
              {/* Option 1: Register First */}
              <TouchableOpacity
                style={styles.registerOptionBtn}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <View style={styles.btnBadge}>
                  <Text style={styles.badgeText}>{isHindi ? '1. नया' : '1. New'}</Text>
                </View>
                <UserPlus size={22} color="#FFFFFF" />
                <Text style={styles.registerOptionBtnText}>
                  {isHindi ? 'रजिस्ट्रेशन करें' : 'Sign Up / Register'}
                </Text>
              </TouchableOpacity>

              {/* Option 2: Login */}
              <TouchableOpacity
                style={styles.loginOptionBtn}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <View style={[styles.btnBadge, { backgroundColor: '#E8DFD0' }]}>
                  <Text style={[styles.badgeText, { color: colors.forestGreen }]}>
                    {isHindi ? '2. लॉगिन' : '2. Login'}
                  </Text>
                </View>
                <LogIn size={22} color={colors.forestGreen} />
                <Text style={styles.loginOptionBtnText}>
                  {isHindi ? 'साइन इन / लॉगिन' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{isHindi ? 'या सीधे शिकायत करें' : 'or guest report'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Report Button */}
            <TouchableOpacity
              style={styles.guestReportBtn}
              onPress={handleStartReport}
              activeOpacity={0.85}
            >
              <FileText size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.guestReportBtnText}>
                {isHindi ? 'बिना लॉगिन शिकायत दर्ज करें' : 'Report Problem as Guest'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Google Sign-in Fast Pass */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              activeOpacity={0.85}
            >
              <GoogleLogo size={18} />
              <Text style={styles.googleBtnText}>
                {isHindi ? 'Google से जल्दी शुरू करें' : 'Fast Pass with Google'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomArtSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF6EC',
  },
  voiceGuideWrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.base,
    marginTop: -4,
    marginBottom: 4,
    zIndex: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 4,
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1B4D3E',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subWelcomeText: {
    fontSize: 15,
    color: '#5C4033',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8DFD0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    color: colors.forestGreen,
    fontWeight: '800',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B3410',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8DFD0',
    marginHorizontal: spacing.sm,
  },
  authPortalCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2D5C3',
    shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
    textAlign: 'center',
  },
  portalSubtitle: {
    fontSize: 13,
    color: '#6B5446',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  registerOptionBtn: {
    flex: 1,
    backgroundColor: '#9E3C1B', // Rich Terracotta
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  registerOptionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  loginOptionBtn: {
    flex: 1,
    backgroundColor: '#FAF6EC',
    borderWidth: 2,
    borderColor: '#1B4D3E',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginOptionBtnText: {
    color: colors.forestGreen,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  btnBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A2810',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8CBB7',
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 12,
    color: '#8C7A6B',
    fontWeight: '600',
  },
  guestReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreen,
    borderRadius: 14,
    height: 48,
    marginBottom: 10,
  },
  guestReportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C4A8',
    borderRadius: 14,
    height: 46,
    gap: 8,
  },
  googleBtnText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomArtSpacer: {
    height: 20,
  },
});
