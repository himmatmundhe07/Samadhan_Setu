/**
 * Samadhan Setu — Profile Screen
 * Includes Login and Register options for guests & authenticated citizens.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/utils/i18n';
import { Button, Input, VoiceGuideButton, Card } from '../../src/components/common';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { spacing, screenPadding, borderRadius } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/store/authStore';
import { useAppStore, Language } from '../../src/store/appStore';
import { getDistrictName } from '../../src/utils/districts';
import {
  User,
  Smartphone,
  MapPin,
  Edit2,
  Globe,
  Volume2,
  Share2,
  BarChart2,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n: i18nInstance } = useTranslation();
  const { user, isAuthenticated, isGuest, logout, updateProfile } = useAuthStore();
  const { language, setLanguage, isVoiceGuideEnabled, setVoiceGuideEnabled } = useAppStore();

  const isHindi = i18nInstance.language === 'hi';
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleReferral = async () => {
    try {
      const message = t('profile.referralMessage', { link: 'https://samadhansetu.in' });
      await Share.share({ message });
    } catch {}
  };

  const handleSave = () => {
    updateProfile({ full_name: editName });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      isHindi ? 'लॉग आउट' : 'Logout',
      isHindi ? 'क्या आप निश्चित रूप से लॉग आउट करना चाहते हैं?' : 'Are you sure you want to log out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isHindi ? 'लॉग आउट' : 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('profile.voiceGuide') || 'प्रोफाइल और खाता प्रबंधन'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <User size={30} color={colors.forestGreen} style={{ marginRight: spacing.xs }} />
          <Text style={styles.title}>{isHindi ? 'प्रोफाइल एवं खाता' : 'Profile & Account'}</Text>
        </View>

        {/* 🔐 AUTHENTICATION OPTIONS CARD (PROMINENT LOGIN & REGISTER) */}
        {(!isAuthenticated || isGuest || !user) ? (
          <Card style={styles.authGateCard}>
            <View style={styles.authGateHeader}>
              <ShieldCheck size={28} color="#9E3C1B" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.authGateTitle}>
                  {isHindi ? 'नागरिक पोर्टल प्रवेश' : 'Citizen Portal Account'}
                </Text>
                <Text style={styles.authGateSubtitle}>
                  {isHindi
                    ? 'शिकायत ट्रैकिंग व स्थिति जानने के लिए अकाउंट बनाएं या साइन इन करें'
                    : 'Sign in or register to track your complaints'}
                </Text>
              </View>
            </View>

            <View style={styles.dualAuthRow}>
              {/* Register Button */}
              <TouchableOpacity
                style={styles.registerPortalBtn}
                onPress={() => router.push('/register')}
                activeOpacity={0.85}
              >
                <UserPlus size={20} color="#FFFFFF" style={{ marginBottom: 4 }} />
                <Text style={styles.registerPortalBtnText}>
                  {isHindi ? '1. नया रजिस्ट्रेशन' : '1. Register / Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginPortalBtn}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <LogIn size={20} color={colors.forestGreen} style={{ marginBottom: 4 }} />
                <Text style={styles.loginPortalBtnText}>
                  {isHindi ? '2. लॉगिन / साइन इन' : '2. Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          /* User Profile Details Card (When Logged In) */
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={44} color={colors.forestGreen} />
            </View>

            {editing ? (
              <View style={styles.editSection}>
                <Input
                  label={t('profile.nameLabel')}
                  value={editName}
                  onChangeText={setEditName}
                  showVoiceButton
                />
                <View style={styles.editButtons}>
                  <Button title={t('common.save')} onPress={handleSave} variant="primary" size="small" fullWidth={false} />
                  <Button title={t('common.cancel')} onPress={() => setEditing(false)} variant="ghost" size="small" fullWidth={false} />
                </View>
              </View>
            ) : (
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('profile.nameLabel')}</Text>
                  <Text style={styles.infoValue}>{user.full_name || 'नागरिक'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('profile.phoneLabel')}</Text>
                  <View style={styles.infoValueRow}>
                    <Smartphone size={16} color={colors.charcoal} />
                    <Text style={styles.infoValue}>{user.phone || '—'}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('profile.locationLabel')}</Text>
                  <View style={styles.infoValueRow}>
                    <MapPin size={16} color={colors.charcoal} />
                    <Text style={styles.infoValue}>
                      {user.district ? getDistrictName(user.district, language) : 'Ranchi'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                  <Edit2 size={16} color={colors.forestGreen} style={{ marginRight: spacing.xs }} />
                  <Text style={styles.editText}>{t('common.edit')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {/* Account Switcher Options for Logged-In Users */}
        {isAuthenticated && user && (
          <Card style={styles.switchAccountCard}>
            <Text style={styles.switchTitle}>
              {isHindi ? 'खाता बदलें / नया खाता जोड़ें' : 'Account Management'}
            </Text>
            <View style={styles.switchBtnRow}>
              <TouchableOpacity
                style={styles.smallOutlineBtn}
                onPress={() => router.push('/login')}
              >
                <LogIn size={16} color={colors.forestGreen} style={{ marginRight: 6 }} />
                <Text style={styles.smallOutlineBtnText}>{isHindi ? 'दूसरे खाते से लॉगिन' : 'Switch Account'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallTerracottaBtn}
                onPress={() => router.push('/register')}
              >
                <UserPlus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.smallTerracottaBtnText}>{isHindi ? 'नया रजिस्ट्रेशन' : 'Add Account'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Language Selection */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Globe size={20} color={colors.mudBrown} />
            <Text style={styles.sectionTitle}>{t('profile.changeLanguage')}</Text>
          </View>
          <View style={styles.langGrid}>
            {[
              { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
              { id: 'en', label: 'English', sub: 'English' },
              { id: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ', sub: 'Santhali' },
              { id: 'kht', label: 'खोरठा', sub: 'Khortha' },
              { id: 'nag', label: 'नागपुरी', sub: 'Nagpuri' },
              { id: 'bho', label: 'भोजपुरी', sub: 'Bhojpuri' },
              { id: 'anp', label: 'अंगिका', sub: 'Angika' },
              { id: 'mag', label: 'मगही', sub: 'Magahi' },
              { id: 'mai', label: 'मैथिली', sub: 'Maithili' },
              { id: 'kru', label: 'कुड़ुख़', sub: 'Kurukh' },
              { id: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
              { id: 'bn', label: 'বাংলা', sub: 'Bengali' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleLanguageChange(item.id as Language)}
                style={[styles.langButton, language === item.id && styles.langButtonActive]}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} (${item.sub})`}
              >
                <Text style={[styles.langText, language === item.id && styles.langTextActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.langSubText, language === item.id && styles.langSubTextActive]}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Voice Guide Toggle */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => setVoiceGuideEnabled(!isVoiceGuideEnabled)}
            style={styles.toggleRow}
          >
            <View style={styles.sectionTitleRow}>
              <Volume2 size={20} color={colors.mudBrown} />
              <Text style={styles.toggleLabel}>Voice Guide</Text>
            </View>
            <Text style={styles.toggleValue}>
              {isVoiceGuideEnabled ? '✅ ON' : '❌ OFF'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Referral */}
        <Button
          title={t('profile.referral')}
          onPress={handleReferral}
          variant="secondary"
          icon={<Share2 color={colors.surface} size={22} />}
        />

        {/* Analytics link */}
        <Button
          title={isHindi ? 'शिकायत आँकड़े देखें' : 'View Analytics'}
          onPress={() => router.push('/(tabs)/analytics')}
          variant="outline"
          style={{ marginTop: spacing.base }}
          icon={<BarChart2 color={colors.forestGreen} size={22} />}
        />

        {/* Logout (if authenticated) */}
        {isAuthenticated && user && (
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="ghost"
            style={styles.logoutButton}
            textStyle={{ color: colors.sindoor }}
            icon={<LogOut color={colors.sindoor} size={22} />}
          />
        )}

        <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <Text style={{ color: colors.mudBrown, fontWeight: '600', fontSize: fontSize.sm }}>
            Samadhan Setu v1.0 • Jharkhand Civic AI
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  scrollContent: { paddingHorizontal: screenPadding, paddingBottom: spacing['2xl'], paddingTop: spacing.md },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700' },
  
  // Auth Gate Card for Guest
  authGateCard: {
    backgroundColor: '#FAF4E8',
    borderWidth: 1.5,
    borderColor: '#E2D5C3',
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  authGateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authGateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  authGateSubtitle: {
    fontSize: 12,
    color: '#6B5446',
    fontWeight: '500',
    marginTop: 2,
  },
  dualAuthRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  registerPortalBtn: {
    flex: 1,
    backgroundColor: '#9E3C1B', // Terracotta
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  registerPortalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  loginPortalBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.forestGreen,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPortalBtnText: {
    color: colors.forestGreen,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  profileCard: { marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.lg },
  avatarContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${colors.forestGreen}15`, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  infoSection: { width: '100%' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F0EBE0' },
  infoLabel: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600' },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoValue: { fontSize: fontSize.base, color: colors.charcoal, fontWeight: '600' },
  editButton: { alignSelf: 'center', marginTop: spacing.md, paddingVertical: spacing.xs, flexDirection: 'row', alignItems: 'center' },
  editText: { fontSize: fontSize.base, color: colors.forestGreen, fontWeight: '600' },
  editSection: { width: '100%' },
  editButtons: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },

  switchAccountCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderColor: '#E8DFD0',
    borderWidth: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: spacing.sm,
  },
  switchBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
  },
  smallOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  smallTerracottaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#9E3C1B',
  },
  smallTerracottaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sectionCard: { marginBottom: spacing.lg, paddingVertical: spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  langButton: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md, borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', minWidth: '47%', flexGrow: 1, marginBottom: spacing.xs,
  },
  langButtonActive: { borderColor: colors.forestGreen, backgroundColor: `${colors.forestGreen}10` },
  langText: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '700' },
  langTextActive: { color: colors.forestGreen },
  langSubText: { fontSize: fontSize.xs, color: colors.mudBrown, opacity: 0.7, marginTop: 2 },
  langSubTextActive: { color: colors.forestGreen, opacity: 0.9, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '600' },
  toggleValue: { fontSize: fontSize.base, fontWeight: '600' },
  logoutButton: { marginTop: spacing.lg },
});
