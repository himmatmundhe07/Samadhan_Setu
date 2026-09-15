/**
 * Samadhan Setu — Login Screen
 * Styled to match the Jharkhand Sohrai visual identity:
 * - Top green wave header with SAMADHANSETU AI logo and language pill
 * - Clean form inputs with icons
 * - Remember me & Forgot password
 * - Terracotta Login button with arrow
 * - Continue with Google
 * - Bottom village art background
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  SamadhanHeader,
  Input,
  GoogleLogo,
  VoiceGuideButton,
} from '../src/components/common';
import { colors } from '../src/theme/colors';
import { spacing, screenPadding } from '../src/theme/spacing';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth.service';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Square,
  Smartphone,
  Check,
  UserPlus,
  LogIn,
} from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ registeredPhone?: string; registeredEmail?: string; justRegistered?: string }>();
  const { t, i18n } = useTranslation();
  const { login } = useAuthStore();

  const isHindi = i18n.language === 'hi';

  const [phoneOrEmail, setPhoneOrEmail] = useState(params.registeredPhone || params.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [justRegisteredMsg, setJustRegisteredMsg] = useState(params.justRegistered === 'true');

  useEffect(() => {
    if (params.registeredPhone || params.registeredEmail) {
      setPhoneOrEmail(params.registeredPhone || params.registeredEmail || '');
    }
  }, [params.registeredPhone, params.registeredEmail]);

  // OTP flow support
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOTP = async () => {
    const cleanPhone = phoneOrEmail.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('Error', isHindi ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number');
      return;
    }
    try {
      setLoading(true);
      await authService.sendOTP(cleanPhone);
      setOtpSent(true);
      setOtpCooldown(30);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const cleanPhone = phoneOrEmail.replace(/[^0-9]/g, '');
    try {
      setLoading(true);
      const result = await authService.verifyOTP(cleanPhone, otp);
      login(result.user, result.token);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!phoneOrEmail) {
      Alert.alert('Error', isHindi ? 'कृपया मोबाइल या ईमेल दर्ज करें' : 'Please enter Mobile Number or Email');
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert('Error', isHindi ? 'कृपया मान्य पासवर्ड दर्ज करें' : 'Please enter a valid password');
      return;
    }
    try {
      setLoading(true);
      const result = await authService.loginWithPassword(phoneOrEmail, password);
      login(result.user, result.token);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('लॉगिन त्रुटि', e.message || 'गलत मोबाइल/ईमेल या पासवर्ड');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Sign-In', isHindi ? 'कृपया मोबाइल/ईमेल और पासवर्ड से लॉगिन करें' : 'Please log in with Email/Mobile and Password');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Background with Top Green Wave & Bottom Sohrai Art */}
      <Image
        source={require('../assets/home_bg_v2.jpg')}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', zIndex: -1 }]}
        resizeMode="cover"
      />

      {/* Top Header inside Green Banner */}
      <SamadhanHeader showBack={true} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Top Segmented Auth Switcher */}
          <View style={styles.authSegmentRow}>
            <TouchableOpacity
              style={styles.authSegmentInactive}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <UserPlus size={16} color="#5C4033" style={{ marginRight: 6 }} />
              <Text style={styles.authSegmentInactiveText}>
                {isHindi ? '1. नया रजिस्ट्रेशन' : '1. Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authSegmentActive}
              activeOpacity={1}
            >
              <LogIn size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.authSegmentActiveText}>
                {isHindi ? '2. लॉगिन' : '2. Log In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Success Banner if redirected after registration */}
          {justRegisteredMsg && (
            <View style={styles.justRegisteredBanner}>
              <Check size={18} color={colors.leafGreen} style={{ marginRight: 6 }} />
              <Text style={styles.justRegisteredBannerText}>
                {isHindi
                  ? 'रजिस्ट्रेशन सफल रहा! अब अपना पासवर्ड डालकर लॉगिन करें।'
                  : 'Registration successful! Please log in with your credentials.'}
              </Text>
            </View>
          )}

          {/* Headline & Subtitle */}
          <View style={styles.titleSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.title}>
                {isHindi ? 'लॉगिन करें' : 'Log In'}
              </Text>
              <VoiceGuideButton text={t('login.voiceGuide') || 'समाधान सेतु में लॉगिन करें। अपना मोबाइल नंबर या ईमेल और पासवर्ड भरें।'} />
            </View>
            <Text style={styles.subtitle}>
              {isHindi ? 'अगर आपका खाता नहीं है, तो ऊपर "1. नया रजिस्ट्रेशन" चुनें' : 'New users: choose "1. Sign Up" above first'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Mobile / Email Input */}
            <Input
              placeholder={isHindi ? 'मोबाइल नंबर / ईमेल' : 'Mobile Number / Email'}
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<User size={20} color="#7A6855" />}
              containerStyle={styles.inputContainer}
            />

            {!useOtp ? (
              /* Password Field */
              <View style={styles.passwordWrapper}>
                <Input
                  placeholder={isHindi ? 'पासवर्ड' : 'Password'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  icon={<Lock size={20} color="#7A6855" />}
                  containerStyle={styles.inputContainer}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#7A6855" />
                  ) : (
                    <Eye size={20} color="#7A6855" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* OTP Field */
              <View>
                {!otpSent ? (
                  <TouchableOpacity
                    style={styles.sendOtpBtn}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    <Smartphone size={18} color="#9E3C1B" style={{ marginRight: 6 }} />
                    <Text style={styles.sendOtpText}>
                      {loading ? 'Sending...' : (isHindi ? 'OTP भेजें' : 'Send OTP')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View>
                    <View style={styles.otpSentBadge}>
                      <Check size={16} color={colors.leafGreen} />
                      <Text style={styles.otpSentText}>
                        {isHindi ? 'OTP भेजा गया' : 'OTP sent to mobile'}
                      </Text>
                    </View>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                {rememberMe ? (
                  <CheckSquare size={18} color="#9E3C1B" />
                ) : (
                  <Square size={18} color="#7A6855" />
                )}
                <Text style={styles.rememberText}>
                  {isHindi ? 'याद रखें' : 'Remember me'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setUseOtp(!useOtp);
                }}
              >
                <Text style={styles.forgotText}>
                  {useOtp
                    ? (isHindi ? 'पासवर्ड से लॉगिन करें' : 'Login with Password')
                    : (isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Primary Terracotta Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={useOtp && otpSent ? handleVerifyOTP : handlePasswordLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.loginBtnText}>
                {loading
                  ? '...'
                  : (isHindi ? 'लॉगिन करें' : 'Login')}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{isHindi ? 'या' : 'or'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue with Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
            >
              <GoogleLogo size={20} />
              <Text style={styles.googleBtnText}>
                {isHindi ? 'Google से जारी रखें' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>
                {isHindi ? 'खाता नहीं है? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>
                  {isHindi ? 'रजिस्टर करें' : 'Register'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Space so bottom Sohrai artwork is visible */}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  authSegmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(232, 223, 208, 0.9)',
    borderRadius: 14,
    padding: 4,
    width: '100%',
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
  justRegisteredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    width: '100%',
  },
  justRegisteredBannerText: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  titleSection: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#5C4033',
    fontWeight: '500',
    marginTop: 4,
  },
  formCard: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 18,
    zIndex: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: -4,
    paddingHorizontal: 4,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '600',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9E3C1B', // Terracotta saddle tone from reference mockup
    borderRadius: 14,
    height: 52,
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8CBB7',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: '#8C7A6B',
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C4A8',
    borderRadius: 14,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  googleBtnText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  registerPrompt: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 14,
    color: '#9E3C1B',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3EAE0',
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  sendOtpText: {
    color: '#9E3C1B',
    fontWeight: '600',
    fontSize: 14,
  },
  otpSentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  otpSentText: {
    fontSize: 13,
    color: colors.leafGreen,
    fontWeight: '600',
  },
  bottomArtSpacer: {
    height: 180,
  },
});
