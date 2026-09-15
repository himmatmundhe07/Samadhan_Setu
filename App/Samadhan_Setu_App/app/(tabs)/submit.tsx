/**
 * Samadhan Setu — Submit Problem Screen (MOST CRITICAL)
 * Camera-first flow, in this exact order:
 * 1. Photo capture (biggest element)
 * 2. GPS auto-capture (background, draggable pin fallback)
 * 3. Icon-grid category selection (8 + emergency)
 * 4. Voice note (optional)
 * 5. Text field (optional, last)
 * Pre-submit: TTS read-back confirmation with large Yes/No
 * Duplicate detection, emergency shortcut, offline-first.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import {
  Button,
  CategoryGrid,
  VoiceGuideButton,
  VoiceRecorder,
} from '../../src/components/common';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { spacing, screenPadding, borderRadius, touchTargets } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/appStore';
import { useProblemStore } from '../../src/store/problemStore';
import { useAuthStore } from '../../src/store/authStore';
import { problemService } from '../../src/services/problem.service';
import { offlineQueueService } from '../../src/services/offlineQueue.service';
import { ApiError, ApiErrorKind } from '../../src/services/apiError';
import { showAlert, showConfirm } from '../../src/utils/alert';
import { CategoryConfig, getCategoryById } from '../../src/utils/categories';
import { getDistrictName, districts } from '../../src/utils/districts';
import { Camera, Image as ImageIcon, Mic, RefreshCcw, Check, X, Search, ArrowLeft, Users, Home } from 'lucide-react-native';
import { Dimensions } from 'react-native';

export type SubmitStep = 'photo' | 'location' | 'category' | 'voice' | 'confirm' | 'duplicate' | 'done';

export default function SubmitScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const isOffline = useAppStore((s) => s.isOffline);
  const { isAuthenticated, isGuest } = useAuthStore();
  const { addMyProblem } = useProblemStore();

  // Form state
  const [step, setStep] = useState<SubmitStep>('photo');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationDistrict, setLocationDistrict] = useState('ranchi');
  const [locationAddress, setLocationAddress] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'detecting' | 'found' | 'failed'>('detecting');
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [description, setDescription] = useState('');
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const resetForm = () => {
    setStep('photo');
    setImageUri(null);
    setSelectedCategory(null);
    setDescription('');
    setVoiceUri(null);
    setVoiceRecorded(false);
    setDuplicates([]);
    setQueuedOffline(false);
    setLoading(false);
    detectLocation();
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  // Reset form when the screen is re-entered after a completed submission.
  // The callback must not depend on `step`, otherwise it re-fires as soon as
  // the submission sets step to 'done' and wipes the success screen.
  useFocusEffect(
    React.useCallback(() => {
      if (stepRef.current === 'done') {
        resetForm();
      }
    }, [])
  );

  // Auto-detect GPS when reaching location step
  useEffect(() => {
    if (step === 'location' || step === 'photo') {
      detectLocation();
    }
  }, []);

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

      // Automatic Reverse Geocoding with expo-location
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocoded && geocoded.length > 0) {
        const g = geocoded[0];
        const addrParts = [
          g.name,
          g.street,
          g.subregion,
          g.city,
          g.district,
          g.postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        if (addrParts) {
          setLocationAddress(addrParts);
        }

        const detectedName = (g.district || g.subregion || g.city || '').toLowerCase();
        const matched = districts.find(
          (d) =>
            detectedName.includes(d.id) ||
            detectedName.includes(d.nameEn.toLowerCase()) ||
            d.nameEn.toLowerCase().includes(detectedName)
        );
        if (matched) {
          setLocationDistrict(matched.id);
        }
      }
      setGpsStatus('found');
    } catch {
      setGpsStatus('failed');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7, // Compress to save data
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setStep('category');
      }
    } catch (e) {
      console.error('Camera error:', e);
    }
  };

  const handleChoosePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setStep('category');
      }
    } catch (e) {
      console.error('Gallery error:', e);
    }
  };

  const handleCategorySelect = async (category: CategoryConfig) => {
    setSelectedCategory(category);

    // Emergency fast-track
    if (category.isEmergency) {
      setStep('confirm');
      return;
    }

    // Check for duplicates
    if (locationCoords) {
      try {
        const dupes = await problemService.checkDuplicates(
          category.id,
          locationCoords.latitude,
          locationCoords.longitude
        );
        if (dupes.length > 0) {
          setDuplicates(dupes);
          setStep('duplicate');
          return;
        }
      } catch {
        // Fail silently — skip duplicate check
      }
    }

    setStep('voice');
  };

  const handleDuplicateSupport = async () => {
    if (duplicates.length > 0) {
      try {
        await problemService.addSupport(duplicates[0].id);
        Alert.alert('✅', t('submit.duplicateSupport'));
        router.back();
      } catch {
        // Fail silently
      }
    }
  };

  const handleSkipToConfirm = () => {
    setStep('confirm');
  };

  const promptLogin = () => {
    showConfirm(
      t('submit.loginRequiredTitle'),
      t('submit.loginRequiredMessage'),
      t('submit.loginAction'),
      t('common.cancel'),
      () => router.push('/login')
    );
  };

  const handleVoiceRecord = () => {
    // Simulated — in production, use expo-av Audio.Recording
    setVoiceRecorded(true);
    setTimeout(() => {
      setStep('confirm');
    }, 500);
  };

  const handleConfirmSubmit = async () => {
    const submissionData = {
      images: imageUri ? [imageUri] : [],
      voiceNote: voiceUri || undefined,
      title: selectedCategory
        ? (language === 'hi' ? selectedCategory.labelHi : selectedCategory.labelEn)
        : '',
      description,
      category: selectedCategory!.id,
      location: {
        latitude: locationCoords?.latitude || 23.3441,
        longitude: locationCoords?.longitude || 85.3096,
        district: locationDistrict,
        address: locationAddress,
      },
      isEmergency: selectedCategory?.isEmergency || false,
    };

    if (!isOffline && !isAuthenticated) {
      promptLogin();
      return;
    }

    try {
      setLoading(true);

      // Enforce 3 reports per day limit
      const { isLimitReached, countToday } = await problemService.checkDailyLimitReached();
      if (isLimitReached) {
        const isHindi = language === 'hi';
        showAlert(
          isHindi ? 'दैनिक सीमा पूरी (3/3)' : 'Daily Limit Reached (3/3)',
          isHindi
            ? `आप आज पहले ही ${countToday} शिकायतें दर्ज कर चुके हैं। एक दिन में अधिकतम 3 शिकायतें ही दर्ज की जा सकती हैं।`
            : `You have already submitted ${countToday} reports today. Maximum limit is 3 reports per day.`
        );
        setLoading(false);
        return;
      }

      if (isOffline) {
        // Offline: save to queue
        await offlineQueueService.enqueue({ data: submissionData });
        setQueuedOffline(true);
        setStep('done');
      } else {
        // Online: submit directly
        const problem = await problemService.submitProblem(submissionData);
        addMyProblem(problem);
        setQueuedOffline(false);
        setStep('done');
      }
    } catch (e: any) {
      const kind: ApiErrorKind | undefined = e instanceof ApiError ? e.kind : undefined;

      if (kind === 'network') {
        // Backend unreachable — really queue the report instead of pretending to
        await offlineQueueService.enqueue({ data: submissionData });
        setQueuedOffline(true);
        setStep('done');
      } else if (kind === 'auth') {
        promptLogin();
      } else if (e.message?.includes('limit') || e.message?.includes('Limit')) {
        showAlert('सीमा त्रुटि', e.message);
      } else {
        showAlert(
          t('submit.submitFailedTitle'),
          e.message || t('submit.submitFailedRetry')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // TTS read-back
  const speakConfirmation = () => {
    const categoryName = selectedCategory
      ? (language === 'en' ? selectedCategory.labelEn : selectedCategory.labelHi)
      : '';
    const districtName = getDistrictName(locationDistrict, language);
    const message = t('submit.confirmMessage', {
      category: categoryName,
      location: districtName,
    });
    // sat/ho/mun → fall back to Hindi TTS (not supported by device engines)
    const ttsLang = language === 'en' ? 'en-US' : 'hi-IN';
    Speech.speak(message, {
      language: ttsLang,
      rate: 0.8,
    });
  };

  // ====== RENDER STEPS ======

  const renderPhotoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepIconContainer}>
        <Camera size={48} color={colors.forestGreen} />
      </View>
      <Text style={styles.stepTitle}>{t('submit.takePhoto')}</Text>

      {imageUri ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: imageUri }} style={styles.photoImage} />
          <TouchableOpacity onPress={() => { setImageUri(null); }} style={styles.retakeButton}>
            <Text style={styles.retakeText}>🔄 {t('submit.retakePhoto')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoButtons}>
          <Button
            title={t('submit.takePhoto')}
            onPress={handleTakePhoto}
            variant="primary"
            icon={<Camera color={colors.surface} size={24} />}
          />
          <Button
            title={t('submit.choosePhoto')}
            onPress={handleChoosePhoto}
            variant="outline"
            icon={<ImageIcon color={colors.forestGreen} size={24} />}
          />
        </View>
      )}

      {/* GPS status inline */}
      <View style={styles.gpsInline}>
        {gpsStatus === 'detecting' ? (
          <Search size={20} color={colors.mudBrown} />
        ) : gpsStatus === 'found' ? (
          <Check size={20} color={colors.leafGreen} />
        ) : (
          <X size={20} color={colors.sindoor} />
        )}
        <Text style={styles.gpsText}>
          {gpsStatus === 'detecting'
            ? t('submit.locationDetecting')
            : gpsStatus === 'found'
            ? t('submit.locationDetected')
            : t('submit.locationFailed')}
        </Text>
      </View>
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('submit.categoryTitle')}</Text>
      <CategoryGrid
        onSelect={handleCategorySelect}
        selectedId={selectedCategory?.id}
      />
    </View>
  );

  const renderDuplicateStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepIconContainer}>
        <Users size={48} color={colors.forestGreen} />
      </View>
      <Text style={styles.duplicateTitle}>
        {t('submit.duplicateFound', { count: duplicates[0]?.supportCount || 1 })}
      </Text>
      <Text style={styles.duplicateDesc}>
        {duplicates[0]?.title || ''}
      </Text>
      <View style={styles.duplicateButtons}>
        <Button
          title={t('submit.duplicateSupport')}
          onPress={handleDuplicateSupport}
          variant="primary"
          icon={<Text style={{ fontSize: 20 }}>🤝</Text>}
        />
        <Button
          title={t('submit.duplicateNew')}
          onPress={() => setStep('voice')}
          variant="outline"
        />
      </View>
    </View>
  );

  const renderVoiceStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('submit.voiceNote')}</Text>

      {/* Real Audio Recorder (expo-av) */}
      <VoiceRecorder
        initialUri={voiceUri}
        onRecordingComplete={(uri) => {
          setVoiceUri(uri);
          setVoiceRecorded(!!uri);
        }}
        onTranscript={(text) => {
          if (text) {
            setDescription((prev) => (prev ? `${prev}\n${text}` : text));
          }
        }}
      />

      {/* Optional text description */}
      <Text style={styles.optionalLabel}>{t('submit.descriptionLabel')}</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder={t('submit.descriptionPlaceholder')}
        placeholderTextColor={colors.borderLight}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Button
        title={t('common.next')}
        onPress={handleSkipToConfirm}
        variant="primary"
      />
    </View>
  );

  const renderConfirmStep = () => {
    const categoryName = selectedCategory
      ? (language === 'hi' ? selectedCategory.labelHi : selectedCategory.labelEn)
      : '';
    const districtName = getDistrictName(locationDistrict, language);

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          <Check size={48} color={colors.forestGreen} />
        </View>
        <Text style={styles.confirmTitle}>{t('submit.confirmTitle')}</Text>

        {/* Summary */}
        <View style={styles.confirmSummary}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.confirmPhoto} />
          )}
          <View style={styles.confirmDetails}>
            <Text style={styles.confirmCategory}>
              {selectedCategory?.emoji} {categoryName}
            </Text>
            <Text style={styles.confirmLocation}>📍 {districtName}</Text>
          </View>
        </View>

        {/* TTS Read-back */}
        <TouchableOpacity onPress={speakConfirmation} style={styles.ttsButton}>
          <Text style={styles.ttsText}>🔊 सुनो</Text>
        </TouchableOpacity>

        {selectedCategory?.isEmergency && (
          <View style={styles.emergencyWarning}>
            <Text style={styles.emergencyText}>
              🚨 {t('submit.emergencyTitle')}
            </Text>
          </View>
        )}

        {/* Large Yes/No buttons */}
        <View style={styles.confirmButtons}>
          <Button
            title={t('submit.confirmYes')}
            onPress={handleConfirmSubmit}
            variant={selectedCategory?.isEmergency ? 'emergency' : 'primary'}
            loading={loading}
            icon={<Text style={{ fontSize: 20 }}>✅</Text>}
          />
          <Button
            title={t('submit.confirmNo')}
            onPress={() => setStep('category')}
            variant="outline"
            icon={<Text style={{ fontSize: 20 }}>↩️</Text>}
          />
        </View>
      </View>
    );
  };

  const renderDoneStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.doneEmoji}>🎉</Text>
      <Text style={styles.doneTitle}>
        {queuedOffline ? t('submit.offlineSaved') : t('submit.submitted')}
      </Text>
      <Text style={styles.doneSubtitle}>
        {t('submit.editWindow', { minutes: 10 })}
      </Text>

      <View style={{ gap: 12, width: '100%', marginTop: spacing.md }}>
        <Button
          title={language === 'hi' ? '📝 दूसरी शिकायत दर्ज करें' : 'Submit Another Report'}
          onPress={resetForm}
          variant="primary"
          icon={<Text style={{ fontSize: 20 }}>📝</Text>}
        />

        <Button
          title={t('common.done')}
          onPress={() => {
            resetForm();
            router.push('/(tabs)/dashboard');
          }}
          variant="outline"
          icon={<Text style={{ fontSize: 20 }}>🏠</Text>}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('submit.voiceGuide')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Clean Header without distracting background images */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={colors.forestGreen} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📝 {t('submit.title')}</Text>
        </View>

        {/* Step Content */}
        {step === 'photo' && renderPhotoStep()}
        {step === 'category' && renderCategoryStep()}
        {step === 'duplicate' && renderDuplicateStep()}
        {step === 'voice' && renderVoiceStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'done' && renderDoneStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  scrollContent: {
    flexGrow: 1, paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: screenPadding,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(45, 80, 22, 0.08)',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  backText: {
    fontSize: 14,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    color: colors.forestGreen,
    fontWeight: '800',
    marginTop: 4,
  },
  stepContainer: { flex: 1, paddingVertical: spacing.lg, paddingHorizontal: screenPadding },
  stepIconContainer: { alignItems: 'center', marginBottom: spacing.lg },
  stepTitle: {
    fontSize: fontSize.xl, color: colors.mudBrown, fontWeight: '600',
    textAlign: 'center', marginBottom: spacing.lg,
  },
  // Photo step
  photoButtons: { gap: spacing.base },
  photoPreview: { alignItems: 'center', marginBottom: spacing.lg },
  photoImage: {
    width: '100%', height: 250, borderRadius: borderRadius.lg,
    backgroundColor: '#E0E0E0',
  },
  retakeButton: { marginTop: spacing.md, paddingVertical: spacing.sm },
  retakeText: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '500' },
  gpsInline: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.xl, backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md, padding: spacing.base,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  gpsEmoji: { fontSize: 18 },
  gpsText: { fontSize: fontSize.base, color: colors.mudBrown, flex: 1 },
  // Duplicate step
  duplicateTitle: {
    fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600',
    textAlign: 'center', marginBottom: spacing.md, lineHeight: 28,
  },
  duplicateDesc: {
    fontSize: fontSize.base, color: colors.terracotta, textAlign: 'center',
    marginBottom: spacing.xl,
  },
  duplicateButtons: { gap: spacing.base },
  // Voice step
  voiceButton: {
    alignSelf: 'center', width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.forestGreen, justifyContent: 'center',
    alignItems: 'center', marginBottom: spacing.xl,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  voiceButtonDone: { backgroundColor: colors.leafGreen },
  voiceButtonEmoji: { fontSize: 40 },
  voiceButtonText: { fontSize: fontSize.base, color: '#FFFFFF', fontWeight: '600', marginTop: 4 },
  optionalLabel: {
    fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600',
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF', borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.borderLight,
    padding: spacing.base, fontSize: fontSize.base,
    color: colors.charcoal, minHeight: 80, textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
  // Confirm step
  confirmTitle: {
    fontSize: fontSize.xl, color: colors.forestGreen, fontWeight: '700',
    textAlign: 'center', marginBottom: spacing.xl,
  },
  confirmSummary: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg, padding: spacing.base,
    borderWidth: 1, borderColor: colors.borderLight,
    marginBottom: spacing.lg, gap: spacing.base,
  },
  confirmPhoto: {
    width: 80, height: 80, borderRadius: borderRadius.md,
    backgroundColor: '#E0E0E0',
  },
  confirmDetails: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  confirmCategory: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600' },
  confirmLocation: { fontSize: fontSize.base, color: colors.terracotta },
  ttsButton: {
    alignSelf: 'center', backgroundColor: colors.forestGreen,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, marginBottom: spacing.lg,
  },
  ttsText: { fontSize: fontSize.base, color: '#FFFFFF', fontWeight: '600' },
  emergencyWarning: {
    backgroundColor: `${colors.sindoor}15`, borderRadius: borderRadius.md,
    padding: spacing.base, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.sindoor,
  },
  emergencyText: {
    fontSize: fontSize.base, color: colors.sindoor, fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtons: {
    gap: spacing.base,
    width: '75%',
    alignSelf: 'center',
    marginTop: 'auto',
  },
  // Done step
  doneEmoji: { fontSize: 72, textAlign: 'center', marginBottom: spacing.lg },
  doneTitle: {
    fontSize: fontSize.xl, color: colors.forestGreen, fontWeight: '700',
    textAlign: 'center', marginBottom: spacing.md,
  },
  doneSubtitle: {
    fontSize: fontSize.base, color: colors.terracotta, textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyIllustration: { marginTop: 'auto', paddingTop: spacing.xl },
});
