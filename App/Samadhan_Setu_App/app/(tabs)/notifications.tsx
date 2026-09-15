/**
 * Samadhan Setu — Notifications Screen
 * Icon + one-line Hindi text per notification.
 * Per-item 🔊 voice playback, read/unread state.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, VoiceGuideButton, SohraiBellEmpty, Button } from '../../src/components/common';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { spacing, screenPadding, borderRadius, touchTargets } from '../../src/theme/spacing';
import { useNotificationStore, Notification } from '../../src/store/notificationStore';
import { notificationService } from '../../src/services/notification.service';
import { useAppStore } from '../../src/store/appStore';
import * as Speech from 'expo-speech';
import { Bell, Volume2, AlertCircle, CheckCheck, RotateCcw } from 'lucide-react-native';

const typeEmojis: Record<string, string> = {
  problem_verified: '✅',
  problem_assigned: '👤',
  project_active: '⏳',
  problem_resolved_pending_confirmation: '❓',
  general: '📢',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setErrorMessage(null);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error('[Notifications] Failed to load notifications:', err);
      setErrorMessage(err?.message || 'सूचनाएं लोड करने में असमर्थ। कृपया पुनः प्रयास करें।');
    }
  };

  const handleSpeak = (message: string) => {
    Speech.speak(message, {
      language: language === 'en' ? 'en-US' : 'hi-IN',
      rate: 0.85,
    });
  };

  const handlePress = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.problemId) {
      router.push(`/(tabs)/problems/${notif.problemId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('notifications.voiceGuide')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Bell size={32} color={colors.forestGreen} style={{ marginRight: spacing.sm }} />
            <Text style={styles.title}>{t('notifications.title')}</Text>
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel={t('notifications.markAllRead')}
              style={styles.markAllBtn}
            >
              <CheckCheck size={16} color={colors.terracotta} style={{ marginRight: 4 }} />
              <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={colors.sindoor} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              onPress={loadNotifications}
              style={styles.retryButton}
              accessibilityRole="button"
              accessibilityLabel="पुनः प्रयास करें"
            >
              <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.retryText}>पुनः प्रयास करें</Text>
            </TouchableOpacity>
          </View>
        )}

        {notifications.length === 0 ? (
          <SohraiBellEmpty
            title=""
            message={t('notifications.empty') || "कोई नई सूचना नहीं"}
            style={styles.emptyIllustration}
          />
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              onPress={() => handlePress(notif)}
              style={StyleSheet.flatten([styles.notifCard, !notif.isRead ? styles.notifUnread : null])}
            >
              <View style={styles.notifRow}>
                <Text style={styles.notifEmoji}>{typeEmojis[notif.type] || '📢'}</Text>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {notif.message}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSpeak(notif.message)}
                  style={styles.speakButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('notifications.speak', { defaultValue: 'सूचना सुनाएं' })}
                >
                  <Volume2 size={20} color={colors.forestGreen} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  headerBorder: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  scrollContent: { paddingHorizontal: screenPadding, paddingBottom: spacing['2xl'], paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700' },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: `${colors.terracotta}10`,
  },
  markAllText: { fontSize: fontSize.sm, color: colors.terracotta, fontWeight: '700' },
  notifCard: { marginBottom: spacing.md },
  notifUnread: { borderLeftWidth: 4, borderLeftColor: colors.forestGreen, backgroundColor: `${colors.forestGreen}05` },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notifEmoji: { fontSize: 24 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '600', marginBottom: 2 },
  notifTitleUnread: { fontWeight: '700', color: colors.charcoal },
  notifMessage: { fontSize: fontSize.base, color: colors.terracotta, lineHeight: 22 },
  speakButton: {
    width: touchTargets.minimum, height: touchTargets.minimum,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: `${colors.forestGreen}10`, borderRadius: touchTargets.minimum / 2,
  },
  emptyIllustration: { marginTop: spacing['2xl'] },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.sindoor}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.sindoor,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sindoor,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
