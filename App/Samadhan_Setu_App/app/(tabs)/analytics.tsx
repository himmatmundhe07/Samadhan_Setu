/**
 * Samadhan Setu — Analytics Screen (Simplified, citizen-facing)
 * NOT an admin dashboard — simple, visual, non-technical.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { VoiceGuideButton, Card, SohraiTreeIllustration } from '../../src/components/common';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { spacing, screenPadding, borderRadius } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/appStore';
import { problemService } from '../../src/services/problem.service';
import { getCategoryById, CategoryId } from '../../src/utils/categories';
import { BarChart2, FileText, CheckCircle } from 'lucide-react-native';
import { Dimensions } from 'react-native';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const [data, setData] = useState<{
    thisMonth: { total: number; resolved: number };
    byCategory: { category: CategoryId; count: number; resolved: number }[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const analytics = await problemService.getAnalytics();
      setData(analytics);
    } catch {}
  };

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SohraiTreeIllustration
          title=""
          message={t('analytics.noData') || "कोई डेटा उपलब्ध नहीं"}
        />
      </SafeAreaView>
    );
  }

  const maxCount = Math.max(...data.byCategory.map((c) => c.count), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('analytics.voiceGuide')} />


      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <BarChart2 size={32} color={colors.forestGreen} style={{ marginRight: spacing.sm }} />
          <Text style={styles.title}>{t('analytics.title')}</Text>
        </View>

        {/* This Month Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('analytics.thisMonth')}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{data.thisMonth.total}</Text>
              <View style={styles.summaryDescRow}>
                <FileText size={16} color={colors.mudBrown} style={{ marginRight: 4 }} />
                <Text style={styles.summaryDesc}>{t('analytics.totalReports')}</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.leafGreen }]}>
                {data.thisMonth.resolved}
              </Text>
              <View style={styles.summaryDescRow}>
                <CheckCircle size={16} color={colors.mudBrown} style={{ marginRight: 4 }} />
                <Text style={styles.summaryDesc}>{t('analytics.totalResolved')}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>{t('analytics.byCategory')}</Text>
        {data.byCategory.map((item) => {
          const cat = getCategoryById(item.category);
          const barWidth = (item.count / maxCount) * 100;
          const resolvedWidth = (item.resolved / maxCount) * 100;

          return (
            <View key={item.category} style={styles.barItem}>
              <View style={styles.barLabel}>
                <Text style={styles.barEmoji}>{cat?.emoji}</Text>
                <Text style={styles.barText}>
                  {language === 'hi' ? cat?.labelHi : cat?.labelEn}
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${barWidth}%` }]} />
                <View style={[styles.barResolved, { width: `${resolvedWidth}%` }]} />
              </View>
              <Text style={styles.barCount}>
                {item.resolved}/{item.count}
              </Text>
            </View>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.turmeric }]} />
            <Text style={styles.legendText}>{t('analytics.totalReports')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.leafGreen }]} />
            <Text style={styles.legendText}>{t('analytics.totalResolved')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  headerBorder: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  scrollContent: { paddingHorizontal: screenPadding, paddingBottom: spacing['2xl'], paddingTop: 60 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700' },
  summaryCard: { marginBottom: spacing.xl, paddingVertical: spacing.xl },
  summaryLabel: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600', textAlign: 'center', marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: fontSize['4xl'], color: colors.forestGreen, fontWeight: '700' },
  summaryDescRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  summaryDesc: { fontSize: fontSize.base, color: colors.mudBrown, textAlign: 'center', fontWeight: '500' },
  summaryDivider: { width: 1, height: 50, backgroundColor: colors.borderLight },
  sectionTitle: { fontSize: fontSize.lg, color: colors.mudBrown, fontWeight: '600', marginBottom: spacing.lg },
  barItem: { marginBottom: spacing.lg },
  barLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  barEmoji: { fontSize: 18 },
  barText: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '600' },
  barContainer: { height: 16, backgroundColor: '#E8E2D6', borderRadius: 8, overflow: 'hidden' },
  barFill: { position: 'absolute', height: '100%', backgroundColor: colors.turmeric, borderRadius: 8 },
  barResolved: { position: 'absolute', height: '100%', backgroundColor: colors.leafGreen, borderRadius: 8 },
  barCount: { fontSize: fontSize.sm, color: colors.terracotta, marginTop: 4, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '500' },
});
