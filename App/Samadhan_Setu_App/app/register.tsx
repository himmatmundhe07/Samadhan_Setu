/**
 * Samadhan Setu — Registration Screen
 * 3-step wizard with ProgressDots.
 * Step 1: Name + Phone (email optional)
 * Step 2: Location (GPS auto-fill + district dropdown)
 * Step 3: OTP verification (default) / Password (secondary)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import {
  Button,
  Input,
  ProgressDots,
  VoiceGuideButton,
  SohraiBorderHeader,
  SohraiTreeIllustration,
} from '../src/components/common';
import { colors } from '../src/theme/colors';
import { fontSize } from '../src/theme/typography';
import { spacing, screenPadding } from '../src/theme/spacing';
import { districts } from '../src/utils/districts';
import { useAuthStore } from '../src/store/authStore';
import { useAppStore } from '../src/store/appStore';
import { authService } from '../src/services/auth.service';
import {
  ArrowLeft,
  User,
  MapPin,
  Lock,
  Search,
  Check,
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Send,
} from 'lucide-react-native';
import {
  UnifiedLocationPicker,
  NumericPinKeypad,
} from '../src/components/common';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const triggerAlert = useAppStore((s) => s.triggerAlert);
  const { login } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 fields
  const [selectedDistrict, setSelectedDistrict] = useState('ranchi');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Step 3 fields: 4-digit numeric PIN
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await authService.sendOTP(phone);
      setOtpSent(true);
      setOtpCooldown(30);
      triggerAlert(
        language === 'hi'
          ? 'ओटीपी आपके नंबर पर भेज दिया गया है'
          : 'OTP has been sent to your mobile number',
        'info'
      );
      // Simulate auto-fill after 2.5s for seamless non-literate onboarding
      setTimeout(() => {
        setOtp('123456');
        triggerAlert(
          language === 'hi'
            ? 'ओटीपी कोड अपने आप भर दिया गया है'
            : 'OTP code detected and auto-filled',
          'success'
        );
      }, 2500);
    } catch (e: any) {
      triggerAlert(e.message || 'OTP भेजने में समस्या हुई', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithPin = async () => {
    if (pin.length < 4) {
      triggerAlert(
        language === 'hi'
          ? 'कृपया कम से कम ४ अंकों का पिन दर्ज करें'
          : 'Please enter a 4-digit PIN',
        'warning'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await authService.register({
        full_name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        password: pin,
        district: selectedDistrict || 'ranchi',
        pincode: '834001',
        village_or_city: selectedDistrict || 'Ranchi',
      });
      login(result.user, result.token);
      triggerAlert(
        language === 'hi'
          ? 'खाता सफलतापूर्वक बन गया है!'
          : 'Account created successfully!',
        'success'
      );
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      triggerAlert(e.message || 'पंजीकरण विफल रहा', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const registrationData = {
        full_name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        password: pin || '1234',
        district: selectedDistrict || 'ranchi',
        pincode: '834001',
        village_or_city: selectedDistrict || 'Ranchi',
      };
      const result = await authService.verifyOTP(phone, otp, registrationData);
      login(result.user, result.token);
      triggerAlert(
        language === 'hi' ? 'सत्यापन सफल रहा!' : 'Verification successful!',
        'success'
      );
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      triggerAlert(e.message || 'ओटीपी गलत है', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 0) return name.trim().length > 0 && phone.trim().length === 10;
    if (step === 1) return selectedDistrict !== '';
    return false;
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIconContainer}>
        <User size={48} color={colors.forestGreen} />
      </View>
      <Input
        label={t('register.nameLabel')}
        placeholder={t('register.namePlaceholder')}
        value={name}
        onChangeText={setName}
        showVoiceButton
        autoCapitalize="words"
        icon={<User size={20} color={colors.forestGreen} />}
      />
      <Input
        label={t('register.phoneLabel')}
        placeholder={t('register.phonePlaceholder')}
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
        icon={<ShieldCheck size={20} color={colors.forestGreen} />}
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <UnifiedLocationPicker
        selectedDistrict={selectedDistrict}
        onSelectDistrict={(distId, coords) => {
          setSelectedDistrict(distId);
          if (coords) setLocationCoords(coords);
        }}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <NumericPinKeypad
        pin={pin}
        onChangePin={setPin}
        maxLength={4}
        labelHi="४-अंकों का गुप्त पिन बनाएं"
        labelEn="Set your 4-digit secret PIN"
      />

      <View style={{ width: '100%', marginTop: spacing.md, gap: 10 }}>
        <Button
          title={language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
          onPress={handleRegisterWithPin}
          loading={loading}
          variant="primary"
          disabled={pin.length !== 4}
          icon={<UserPlus size={22} color="#FFFFFF" />}
        />

        {/* OTP Option */}
        <Button
          title={otpSent ? 'OTP से पुष्टि करें' : 'OTP भेजें'}
          onPress={otpSent ? handleVerifyOTP : handleSendOTP}
          loading={loading}
          variant="outline"
          icon={<Send size={20} color={colors.forestGreen} />}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('register.voiceGuide')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <SohraiBorderHeader width={Dimensions.get('window').width} height={50} style={styles.headerBorder} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.forestGreen} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('register.title')}</Text>
        </View>

        {/* Top Segmented Auth Switcher */}
        <View style={styles.authSegmentRow}>
          <TouchableOpacity
            style={styles.authSegmentActive}
            activeOpacity={1}
          >
            <UserPlus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.authSegmentActiveText}>
              {language === 'hi' ? '1. नया रजिस्ट्रेशन' : '1. Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authSegmentInactive}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <LogIn size={16} color="#5C4033" style={{ marginRight: 6 }} />
            <Text style={styles.authSegmentInactiveText}>
              {language === 'hi' ? '2. लॉगिन' : '2. Log In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Dots */}
        <ProgressDots total={3} current={step} />

        {/* Step Content */}
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        {/* Navigation */}
        {step < 2 && (
          <View style={styles.navButtons}>
            {step > 0 && (
              <Button
                title={t('common.back')}
                onPress={() => setStep(step - 1)}
                variant="ghost"
                fullWidth={false}
                style={{ flex: 1, marginRight: spacing.sm }}
                icon={<ArrowLeft size={20} color={colors.forestGreen} />}
              />
            )}
            <Button
              title={t('common.next')}
              onPress={() => setStep(step + 1)}
              variant="primary"
              disabled={!canGoNext()}
              fullWidth={false}
              style={{ flex: 2 }}
              icon={<ArrowRight size={20} color="#FFFFFF" />}
            />
          </View>
        )}

        {/* Already registered */}
        <Text
          style={styles.loginLink}
          onPress={() => router.push('/login')}
        >
          {t('register.alreadyRegistered')}
        </Text>

        <SohraiTreeIllustration 
          title=""
          message={t('register.welcomeMessage') || "समस्या समाधान में आपका स्वागत है"}
          style={styles.emptyIllustration}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  scrollContent: { flexGrow: 1, paddingBottom: spacing['2xl'] },
  headerBorder: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  header: { paddingTop: spacing.xl, marginBottom: spacing.base, paddingHorizontal: screenPadding, zIndex: 1 },
  backButton: { paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { fontSize: fontSize.base, color: colors.forestGreen, fontWeight: '600' },
  title: { fontSize: fontSize['3xl'], color: colors.forestGreen, fontWeight: '700', marginTop: spacing.sm },
  authSegmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(232, 223, 208, 0.9)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: screenPadding,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D8CBB7',
  },
  authSegmentActive: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#9E3C1B',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  authSegmentActiveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  authSegmentInactive: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSegmentInactiveText: {
    color: '#5C4033',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: { flex: 1, paddingVertical: spacing.lg, paddingHorizontal: screenPadding },
  stepIconContainer: { alignItems: 'center', marginBottom: spacing.lg },
  navButtons: { flexDirection: 'row', paddingTop: spacing.base, paddingHorizontal: screenPadding },
  label: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '500', marginBottom: spacing.sm },
  gpsBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: spacing.base,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
  },
  gpsEmoji: { fontSize: 20 },
  gpsText: { fontSize: fontSize.base, color: colors.mudBrown, flex: 1 },
  districtList: { maxHeight: 300, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: '#FFFFFF' },
  districtItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
    borderBottomWidth: 1, borderBottomColor: '#F0EBE0',
  },
  districtItemSelected: { backgroundColor: `${colors.forestGreen}10` },
  districtText: { fontSize: fontSize.base, color: colors.mudBrown },
  districtTextSelected: { color: colors.forestGreen, fontWeight: '600' },
  otpInfo: { fontSize: fontSize.lg, color: colors.mudBrown, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 28 },
  phoneDisplay: { fontSize: fontSize.xl, color: colors.forestGreen, fontWeight: '600', textAlign: 'center', marginBottom: spacing.lg },
  resendButton: { alignSelf: 'center', paddingVertical: spacing.md },
  resendText: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600' },
  passwordToggle: { alignSelf: 'center', paddingVertical: spacing.lg },
  passwordToggleText: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600' },
  passwordSection: { paddingTop: spacing.base },
  loginLink: {
    fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600',
    textAlign: 'center', marginTop: spacing.xl, textDecorationLine: 'underline',
  },
  emptyIllustration: { marginTop: spacing['2xl'] },
});
