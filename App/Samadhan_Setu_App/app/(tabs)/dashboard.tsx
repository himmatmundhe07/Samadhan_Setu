/**
 * Samadhan Setu — Dashboard Screen
 * Stats cards, my reports list, floating FAB.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Card,
  StatusBadge,
  VoiceGuideButton,
  SohraiCardCorner,
  OfflineBanner,
  TrustBadge,
} from '../../src/components/common';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { spacing, screenPadding, touchTargets, borderRadius } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/store/authStore';
import { useProblemStore, Problem } from '../../src/store/problemStore';
import { useAppStore } from '../../src/store/appStore';
import { problemService } from '../../src/services/problem.service';
import { getCategoryById } from '../../src/utils/categories';
import { Plus } from 'lucide-react-native';
import { Dimensions } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const language = useAppStore((s) => s.language);
  const { myProblems, setMyProblems, pendingSyncCount } = useProblemStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyProblems();
  }, []);

  const loadMyProblems = async () => {
    try {
      const problems = await problemService.getMyProblems();
      setMyProblems(problems);
    } catch (e) {
      // Fail silently — show cached data
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProblems();
    setRefreshing(false);
  };

  // Calculate stats
  const totalReports = myProblems.length;
  const inProgress = myProblems.filter(
    (p) => ['submitted', 'verified', 'assigned', 'in_progress'].includes(p.status)
  ).length;
  const resolved = myProblems.filter(
    (p) => p.status === 'resolved' && p.isConfirmedResolved
  ).length;

  const getTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'hi') {
      if (diffMins < 60) return `${diffMins} मिनट पहले`;
      if (diffHours < 24) return `${diffHours} घंटे पहले`;
      return `${diffDays} दिन पहले`;
    }
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderProblemCard = ({ item }: { item: Problem }) => {
    const category = getCategoryById(item.category);
    return (
      <Card
        onPress={() => router.push(`/(tabs)/problems/${item.id}`)}
        style={styles.problemCard}
        borderAccent
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{category?.emoji || '📌'}</Text>
            <Text style={styles.categoryLabel}>
              {language === 'hi' ? category?.labelHi : category?.labelEn}
            </Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>

        {item.title && (
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.timeAgo}>{getTimeAgo(item.updatedAt)}</Text>
          {!item.isSynced && (
            <View style={styles.syncingBadge}>
              <Text style={styles.syncingText}>⏳ {t('common.syncing')}</Text>
            </View>
          )}
          {item.supportCount > 1 && (
            <TrustBadge supportCount={item.supportCount} />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('dashboard.voiceGuide')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.forestGreen]}
            tintColor={colors.forestGreen}
          />
        }
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          {t('dashboard.greeting', { name: user?.full_name || 'नागरिक' })}
        </Text>

        {/* Pending sync banner */}
        {pendingSyncCount > 0 && (
          <View style={styles.syncBanner}>
            <Text style={styles.syncBannerText}>
              ⏳ {pendingSyncCount} {t('common.syncing')}
            </Text>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: colors.forestGreen }]}>
            <SohraiCardCorner color={colors.forestGreen} />
            <Text style={styles.statNumber}>{totalReports}</Text>
            <Text style={styles.statLabel}>📊 {t('dashboard.totalReports')}</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: colors.ochre }]}>
            <SohraiCardCorner color={colors.ochre} />
            <Text style={[styles.statNumber, { color: colors.ochre }]}>{inProgress}</Text>
            <Text style={styles.statLabel}>⏳ {t('dashboard.inProgress')}</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: colors.leafGreen }]}>
            <SohraiCardCorner color={colors.leafGreen} />
            <Text style={[styles.statNumber, { color: colors.leafGreen }]}>{resolved}</Text>
            <Text style={styles.statLabel}>✅ {t('dashboard.resolved')}</Text>
          </View>
        </View>

        {/* My Complaints Section */}
        <Text style={styles.sectionTitle}>📋 {t('dashboard.myComplaints')}</Text>

        {myProblems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>
              {t('dashboard.noComplaints') || "अभी तक कोई शिकायत नहीं"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('dashboard.firstComplaint') || "अपनी पहली शिकायत यहाँ दर्ज करें"}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(tabs)/submit')}
              activeOpacity={0.85}
            >
              <Plus color="#FFFFFF" size={20} strokeWidth={2.5} />
              <Text style={styles.emptyActionBtnText}>
                {language === 'hi' ? 'नई शिकायत दर्ज करें' : 'Report New Problem'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          myProblems.map((problem) => (
            <View key={problem.id}>
              {renderProblemCard({ item: problem })}
            </View>
          ))
        )}

        {/* Bottom Citizen Reporting Illustration */}
        <View style={styles.bottomIllustrationWrapper}>
          <Image
            source={require('../../assets/man_reporting_pothole.jpg')}
            style={styles.bottomIllustration}
            resizeMode="contain"
          />
          <Text style={styles.bottomIllustrationText}>
            {language === 'hi'
              ? 'समस्या की तस्वीर लें और समाधान पाएं'
              : 'Click a photo of the problem and get it resolved'}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/submit')}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={24} strokeWidth={3} />
        <Text style={styles.fabLabel}>{t('dashboard.newReport')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingBottom: 100,
    paddingTop: spacing.base,
  },
  greeting: {
    fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700',
    marginBottom: spacing.lg,
  },
  syncBanner: {
    backgroundColor: `${colors.turmeric}25`, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.base,
    borderWidth: 1, borderColor: colors.turmeric,
  },
  syncBannerText: { fontSize: fontSize.sm, color: colors.mudBrown, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
    borderTopWidth: 3, borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statNumber: {
    fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs, color: colors.mudBrown, fontWeight: '600', textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.xl, color: colors.mudBrown, fontWeight: '600',
    marginBottom: spacing.base,
  },
  problemCard: { marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  categoryEmoji: { fontSize: 18 },
  categoryLabel: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600' },
  cardTitle: {
    fontSize: fontSize.base, color: colors.charcoal, fontWeight: '500',
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  timeAgo: { fontSize: fontSize.sm, color: colors.borderLight },
  syncingBadge: {
    backgroundColor: `${colors.turmeric}20`, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 8,
  },
  syncingText: { fontSize: 11, color: colors.ochre },
  supportCount: { fontSize: fontSize.sm, color: colors.terracotta },
  fab: {
    position: 'absolute', bottom: 85, right: screenPadding,
    backgroundColor: colors.forestGreen, borderRadius: borderRadius.full,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, height: touchTargets.fabSize,
    shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
    gap: spacing.sm,
  },
  fabIcon: { fontSize: 20, color: '#FFFFFF' },
  fabLabel: {
    fontSize: fontSize.base, color: '#FFFFFF', fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.forestGreen,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.mudBrown,
    textAlign: 'center',
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  bottomIllustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  bottomIllustration: {
    width: 220,
    height: 170,
  },
  bottomIllustrationText: {
    fontSize: 13,
    color: colors.mudBrown,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
