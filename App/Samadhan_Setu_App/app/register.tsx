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
import { ArrowLeft, User, MapPin, Lock, Search, Check, X, LogIn, UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const { login } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 fields
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'detecting' | 'found' | 'failed'>('detecting');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Step 3 fields
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const [password, setPassword] = useState('');

  // GPS auto-detect on Step 2
  useEffect(() => {
    if (step === 1) {
      detectLocation();
    }
  }, [step]);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const detectLocation = async () => {
    try {
      setGpsStatus('detecting');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('failed');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setLocationCoords({ latitude, longitude });

      // Reverse geocode to automatically resolve district and location details
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocoded && geocoded.length > 0) {
        const g = geocoded[0];
        const detectedName = (g.district || g.subregion || g.city || '').toLowerCase();
        const matched = districts.find(
          (d) =>
            detectedName.includes(d.id) ||
            detectedName.includes(d.nameEn.toLowerCase()) ||
            d.nameEn.toLowerCase().includes(detectedName)
        );
        if (matched) {
          setSelectedDistrict(matched.id);
        } else if (!selectedDistrict) {
          setSelectedDistrict('ranchi');
        }
      } else if (!selectedDistrict) {
        setSelectedDistrict('ranchi');
      }
      setGpsStatus('found');
    } catch {
      setGpsStatus('failed');
    }
  };

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await authService.sendOTP(phone);
      setOtpSent(true);
      setOtpCooldown(30);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const registrationData = {
        full_name: name,
        phone: phone,
        email: email ? email.trim() : undefined,
        password: password || undefined,
        district: selectedDistrict,
        pincode: '834001',
        village_or_city: selectedDistrict || 'Ranchi',
      };
      const result = await authService.verifyOTP(phone, otp, registrationData);
      login(result.user, result.token);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithPassword = async () => {
    try {
      setLoading(true);
      const result = await authService.register({
        full_name: name,
        phone,
        email: email ? email.trim() : undefined,
        password,
        district: selectedDistrict,
        pincode: '834001',
        village_or_city: selectedDistrict || 'Ranchi',
      });
      login(result.user, result.token);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message);
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
      />
      <Input
        label={t('register.phoneLabel')}
        placeholder={t('register.phonePlaceholder')}
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Input
        label={t('register.emailLabel')}
        placeholder={t('register.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIconContainer}>
        <MapPin size={48} color={colors.forestGreen} />
      </View>

      {/* GPS Status */}
      <View style={styles.gpsBar}>
        {gpsStatus === 'detecting' ? (
          <Search size={20} color={colors.mudBrown} />
        ) : gpsStatus === 'found' ? (
          <Check size={20} color={colors.leafGreen} />
        ) : (
          <X size={20} color={colors.sindoor} />
        )}
        <Text style={styles.gpsText}>
          {gpsStatus === 'detecting'
            ? t('register.gpsDetecting')
            : gpsStatus === 'found'
            ? t('register.gpsDetected')
            : t('register.gpsFailed')}
        </Text>
      </View>

      {/* District Dropdown */}
      <Text style={styles.label}>{t('register.districtLabel')}</Text>
      <ScrollView
        style={styles.districtList}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {districts.map((d) => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setSelectedDistrict(d.id)}
            style={[
              styles.districtItem,
              selectedDistrict === d.id && styles.districtItemSelected,
            ]}
          >
            <Text
              style={[
                styles.districtText,
                selectedDistrict === d.id && styles.districtTextSelected,
              ]}
            >
              {language === 'hi' ? d.nameHi : d.nameEn}
            </Text>
            {selectedDistrict === d.id && <Check size={20} color={colors.forestGreen} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIconContainer}>
        <Lock size={48} color={colors.forestGreen} />
      </View>

      {!otpSent ? (
        <>
          <Text style={styles.otpInfo}>
            {t('register.otpTitle')}
          </Text>
          <Text style={styles.phoneDisplay}>📱 {phone}</Text>
          <Button
            title={t('login.sendOtp')}
            onPress={handleSendOTP}
            loading={loading}
            variant="primary"
          />
        </>
      ) : (
        <>
          <Text style={styles.otpInfo}>{t('register.otpSent')} 📱 {phone}</Text>
          <Input
            label="OTP"
            placeholder={t('register.otpPlaceholder')}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            title={t('common.submit')}
            onPress={handleVerifyOTP}
            loading={loading}
            variant="primary"
            disabled={otp.length !== 6}
          />

          {/* Resend OTP */}
          <TouchableOpacity
            onPress={otpCooldown > 0 ? undefined : handleSendOTP}
            disabled={otpCooldown > 0}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, otpCooldown > 0 && { opacity: 0.5 }]}>
              {otpCooldown > 0
                ? t('register.otpResendIn', { seconds: otpCooldown })
                : t('register.otpResend')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Password fallback option */}
      <TouchableOpacity
        onPress={() => setShowPasswordOption(!showPasswordOption)}
        style={styles.passwordToggle}
      >
        <Text style={styles.passwordToggleText}>
          {t('register.passwordOption')} {showPasswordOption ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showPasswordOption && (
        <View style={styles.passwordSection}>
          <Input
            label={t('register.passwordLabel')}
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={t('register.title')}
            onPress={handleRegisterWithPassword}
            loading={loading}
            variant="secondary"
            disabled={password.length < 6}
          />
        </View>
      )}
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
              />
            )}
            <Button
              title={t('common.next')}
              onPress={() => setStep(step + 1)}
              variant="primary"
              disabled={!canGoNext()}
              fullWidth={false}
              style={{ flex: 2 }}
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
