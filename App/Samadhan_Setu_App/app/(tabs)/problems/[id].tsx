/**
 * Samadhan Setu — Problem Detail Screen
 * Timeline, confirmation gate, rating, reopen.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, StatusBadge, VoiceGuideButton, Card, SohraiBorderHeader, TrustBadge, VoiceRecorder } from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';
import { fontSize } from '../../../src/theme/typography';
import { spacing, screenPadding, borderRadius } from '../../../src/theme/spacing';
import { useProblemStore, Problem } from '../../../src/store/problemStore';
import { useAppStore } from '../../../src/store/appStore';
import { useAuthStore } from '../../../src/store/authStore';
import { problemService } from '../../../src/services/problem.service';
import { getCategoryById } from '../../../src/utils/categories';
import { statusConfig, timelineSteps, ProblemStatus } from '../../../src/utils/statusConfig';
import { getDistrictName } from '../../../src/utils/districts';
import { ArrowLeft, Check, X, RefreshCcw } from 'lucide-react-native';
import { Dimensions } from 'react-native';

export default function ProblemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const { user } = useAuthStore();
  const { currentProblem, setCurrentProblem, confirmResolution, rateProblem } = useProblemStore();
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      const problem = await problemService.getProblemById(id!);
      if (problem) setCurrentProblem(problem);
    } catch {}
  };

  if (!currentProblem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>लोड हो रहा है...</Text>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(currentProblem.category);
  const isOwner = currentProblem.submittedBy === user?.id;
  const isPendingConfirmation = currentProblem.status === 'pending_confirmation';
  const isResolved = currentProblem.status === 'resolved' && currentProblem.isConfirmedResolved;

  // Timeline
  const currentStepIndex = timelineSteps.indexOf(currentProblem.status as any);
  const effectiveStepIndex = isPendingConfirmation
    ? timelineSteps.indexOf('resolved')
    : currentStepIndex;

  const handleConfirm = async (confirmed: boolean) => {
    try {
      setLoading(true);
      await problemService.confirmResolution(currentProblem.id, confirmed);
      confirmResolution(currentProblem.id, confirmed);
      if (confirmed) {
        Alert.alert('✅', language === 'hi' ? 'धन्यवाद! समस्या हल हो गई।' : 'Thank you! Problem resolved.');
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    setSelectedRating(rating);
    try {
      await problemService.rateProblem(currentProblem.id, rating);
      rateProblem(currentProblem.id, rating);
    } catch {}
  };

  const handleReopen = async () => {
    try {
      setLoading(true);
      await problemService.reopenProblem(currentProblem.id);
      setCurrentProblem({ ...currentProblem, status: 'submitted' as ProblemStatus, isConfirmedResolved: false });
      Alert.alert('🔄', t('problemDetail.reopened'));
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('problemDetail.voiceGuide')} />

      <SohraiBorderHeader width={Dimensions.get('window').width} height={50} style={styles.headerBorder} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.forestGreen} />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>

        {/* Photo */}
        {currentProblem.images.length > 0 && (
          <Image source={{ uri: currentProblem.images[0] }} style={styles.mainImage} />
        )}

        {/* Category + Status */}
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{category?.emoji}</Text>
            <Text style={styles.categoryLabel}>
              {language === 'hi' ? category?.labelHi : category?.labelEn}
            </Text>
          </View>
          <StatusBadge status={currentProblem.status} size="large" />
        </View>

        {currentProblem.title && (
          <Text style={styles.title}>{currentProblem.title}</Text>
        )}

        {/* Location */}
        <Text style={styles.location}>
          📍 {getDistrictName(currentProblem.location.district, language)}
          {currentProblem.location.address ? ` — ${currentProblem.location.address}` : ''}
        </Text>

        {/* Support count */}
        {currentProblem.supportCount > 1 && (
          <View style={styles.supportContainer}>
            <TrustBadge supportCount={currentProblem.supportCount} />
          </View>
        )}

        {/* Voice Note Audio Playback */}
        {currentProblem.voiceNote && (
          <View style={{ marginVertical: spacing.md }}>
            <Text style={styles.sectionTitle}>🎙️ रिकॉर्डेड आवाज़</Text>
            <VoiceRecorder initialUri={currentProblem.voiceNote} onRecordingComplete={() => {}} />
          </View>
        )}

        {/* ====== VISUAL TIMELINE ====== */}
        <Text style={styles.sectionTitle}>📊 {t('problemDetail.timeline')}</Text>
        <View style={styles.timeline}>
          {timelineSteps.map((step, index) => {
            const config = statusConfig[step];
            const isCompleted = index <= effectiveStepIndex;
            const isCurrent = index === effectiveStepIndex;
            const statusEmojis: Record<string, string> = {
              submitted: '📤', verified: '✅', assigned: '👤',
              in_progress: '⏳', resolved: '✔️',
            };

            return (
              <View key={step} style={styles.timelineStep}>
                <View style={styles.timelineDotRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && { backgroundColor: config.color },
                      isCurrent && styles.timelineDotCurrent,
                      !isCompleted && styles.timelineDotEmpty,
                    ]}
                  >
                    {isCompleted && (
                      <Text style={styles.timelineDotEmoji}>{statusEmojis[step]}</Text>
                    )}
                  </View>
                  {index < timelineSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && index < effectiveStepIndex
                          ? { backgroundColor: config.color }
                          : { backgroundColor: colors.borderLight },
                      ]}
                    />
                  )}
                </View>
                <Text style={[
                  styles.timelineLabel,
                  isCompleted && { color: config.color, fontWeight: '600' },
                ]}>
                  {language === 'hi' ? config.labelHi : config.labelEn}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Responsible entity */}
        {currentProblem.assignedTo && (
          <Card style={styles.entityCard}>
            <Text style={styles.entityEmoji}>🏢</Text>
            <Text style={styles.entityText}>{t('problemDetail.responsibleEntity')}</Text>
            <Text style={styles.entityName}>{currentProblem.assignedTo}</Text>
          </Card>
        )}

        {/* ====== CITIZEN CONFIRMATION GATE ====== */}
        {isPendingConfirmation && isOwner && (
          <Card style={styles.confirmationCard}>
            <Text style={styles.confirmTitle}>❓ {t('problemDetail.confirmResolution')}</Text>
            <View style={styles.confirmButtons}>
              <Button
                title={t('problemDetail.confirmYes')}
                onPress={() => handleConfirm(true)}
                variant="primary"
                loading={loading}
                icon={<Check size={20} color={colors.surface} />}
              />
              <Button
                title={t('problemDetail.confirmNo')}
                onPress={() => handleConfirm(false)}
                variant="emergency"
                loading={loading}
                icon={<X size={20} color={colors.sindoor} />}
              />
            </View>
          </Card>
        )}

        {/* ====== RATING (after confirmed resolution) ====== */}
        {isResolved && isOwner && (
          <Card style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>⭐ {t('problemDetail.rating')}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  style={styles.starButton}
                >
                  <Text style={styles.starEmoji}>
                    {star <= (selectedRating || currentProblem.rating || 0) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* ====== REOPEN — "happened again?" ====== */}
        {(isResolved || currentProblem.status === 'disputed') && isOwner && (
          <Button
            title={t('problemDetail.happenedAgain')}
            onPress={handleReopen}
            variant="outline"
            loading={loading}
            icon={<RefreshCcw size={20} color={colors.forestGreen} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  headerBorder: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  scrollContent: { paddingHorizontal: screenPadding, paddingBottom: spacing['2xl'], paddingTop: 60 },
  loadingText: { fontSize: fontSize.lg, color: colors.mudBrown, textAlign: 'center', marginTop: 100 },
  backButton: { paddingVertical: spacing.sm, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { fontSize: fontSize.base, color: colors.forestGreen, fontWeight: '600' },
  mainImage: { width: '100%', height: 200, borderRadius: borderRadius.lg, marginBottom: spacing.base, backgroundColor: '#E0E0E0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: { fontSize: fontSize.lg, color: colors.terracotta, fontWeight: '600' },
  title: { fontSize: fontSize.xl, color: colors.charcoal, fontWeight: '600', marginBottom: spacing.sm },
  location: { fontSize: fontSize.base, color: colors.mudBrown, marginBottom: spacing.sm },
  supportContainer: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600', marginBottom: spacing.base, marginTop: spacing.lg },
  // Timeline
  timeline: { paddingLeft: spacing.sm, marginBottom: spacing.xl },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  timelineDotRow: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  timelineDotCurrent: { borderColor: colors.ochre, borderWidth: 3 },
  timelineDotEmpty: { backgroundColor: colors.borderLight, borderColor: '#D4C4A8' },
  timelineDotEmoji: { fontSize: 14 },
  timelineLine: { width: 3, height: 24, marginVertical: 2 },
  timelineLabel: { fontSize: fontSize.base, color: colors.borderLight, marginLeft: spacing.md, marginTop: 6 },
  // Entity
  entityCard: { alignItems: 'center', marginVertical: spacing.base, paddingVertical: spacing.lg },
  entityEmoji: { fontSize: 32, marginBottom: spacing.sm },
  entityText: { fontSize: fontSize.base, color: colors.mudBrown, textAlign: 'center', marginBottom: spacing.xs },
  entityName: { fontSize: fontSize.base, color: colors.forestGreen, fontWeight: '600', textAlign: 'center' },
  // Confirmation gate
  confirmationCard: {
    marginVertical: spacing.lg, paddingVertical: spacing.xl,
    borderWidth: 2, borderColor: colors.ochre, backgroundColor: `${colors.ochre}08`,
  },
  confirmTitle: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600', textAlign: 'center', marginBottom: spacing.lg },
  confirmButtons: { gap: spacing.base },
  // Rating
  ratingCard: { alignItems: 'center', marginVertical: spacing.base, paddingVertical: spacing.lg },
  ratingTitle: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600', marginBottom: spacing.base },
  stars: { flexDirection: 'row', gap: spacing.md },
  starButton: { padding: spacing.sm },
  starEmoji: { fontSize: 32 },
});
