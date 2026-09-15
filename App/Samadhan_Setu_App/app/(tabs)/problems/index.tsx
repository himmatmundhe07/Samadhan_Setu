/**
 * Samadhan Setu — Problem List (Public Feed)
 * List view with category/district filters and inline voice/text search bar.
 * Reporter privacy: name/phone NEVER shown.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import { Search, Mic, X } from 'lucide-react-native';
import {
  Card,
  StatusBadge,
  VoiceGuideButton,
  SohraiTreeIllustration,
  TrustBadge,
} from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';
import { fontSize } from '../../../src/theme/typography';
import { spacing, screenPadding, borderRadius } from '../../../src/theme/spacing';
import { useProblemStore, Problem } from '../../../src/store/problemStore';
import { useAppStore } from '../../../src/store/appStore';
import { problemService } from '../../../src/services/problem.service';
import { categories, CategoryId, getCategoryById } from '../../../src/utils/categories';

export default function ProblemListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const { publicProblems, setPublicProblems, filters, setFilters } = useProblemStore();
  const [refreshing, setRefreshing] = useState(false);

  // Search & Voice states
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const voiceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    loadProblems();
  }, [filters]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const loadProblems = async () => {
    try {
      const problems = await problemService.getPublicProblems({
        category: filters.category || undefined,
        district: filters.district || undefined,
      });
      setPublicProblems(problems);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProblems();
    setRefreshing(false);
  };

  const toggleCategoryFilter = (catId: CategoryId) => {
    setFilters({ category: filters.category === catId ? null : catId });
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      setIsListening(false);
      Speech.stop();
      return;
    }

    setIsListening(true);
    // Voice prompt feedback
    Speech.speak("बोलिए, आप क्या खोजना चाहते हैं?", {
      language: 'hi-IN',
      rate: 0.9,
      onDone: () => {
        // Sample voice recognition response simulation (e.g. "पानी")
        const sampleQueries = ['पानी', 'सड़क', 'बिजली', 'स्वास्थ्य'];
        const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
        voiceTimeoutRef.current = setTimeout(() => {
          setSearchQuery(randomQuery);
          setIsListening(false);
        }, 1500);
      },
      onError: () => setIsListening(false),
    });
  };

  // Filter problems by active category AND search text/voice query
  const filteredProblems = publicProblems.filter((problem) => {
    if (filters.category && problem.category !== filters.category) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const category = getCategoryById(problem.category);
      const catHi = category?.labelHi.toLowerCase() || '';
      const catEn = category?.labelEn.toLowerCase() || '';
      const title = (problem.title || '').toLowerCase();
      const desc = (problem.description || '').toLowerCase();
      const address = (problem.location?.address || '').toLowerCase();
      return (
        title.includes(q) ||
        desc.includes(q) ||
        catHi.includes(q) ||
        catEn.includes(q) ||
        address.includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <VoiceGuideButton text={t('problems.voiceGuide')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.forestGreen]} />
        }
      >
        <Text style={styles.title}>📋 {t('problems.title')}</Text>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {categories.filter((c) => !c.isEmergency).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => toggleCategoryFilter(cat.id)}
              style={[
                styles.filterChip,
                filters.category === cat.id && styles.filterChipActive,
              ]}
            >
              <Text style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  filters.category === cat.id && styles.filterLabelActive,
                ]}
              >
                {language === 'hi' ? cat.labelHi : cat.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inline Search bar with Text + Voice input */}
        <View style={styles.searchBarRow}>
          <View style={[styles.searchContainer, isListening && styles.searchContainerListening]}>
            <Search size={20} color={colors.mudBrown} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="बोलकर या लिखकर खोजो"
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={18} color={colors.mudBrown} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={handleVoiceSearch} style={styles.micBtn} activeOpacity={0.7}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Mic size={20} color={isListening ? colors.sindoor : colors.forestGreen} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Problem cards */}
        {filteredProblems.length === 0 ? (
          <SohraiTreeIllustration
            title=""
            message={t('dashboard.noComplaints') || "अभी तक कोई शिकायत नहीं"}
            style={styles.emptyIllustration}
          />
        ) : (
          filteredProblems.map((problem) => {
            const category = getCategoryById(problem.category);
            return (
              <Card
                key={problem.id}
                onPress={() => router.push(`/(tabs)/problems/${problem.id}`)}
                style={styles.problemCard}
                borderAccent
              >
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryEmoji}>{category?.emoji}</Text>
                    <Text style={styles.categoryLabel}>
                      {language === 'hi' ? category?.labelHi : category?.labelEn}
                    </Text>
                  </View>
                  <StatusBadge status={problem.status} size="small" />
                </View>
                {problem.title && (
                  <Text style={styles.cardTitle} numberOfLines={2}>{problem.title}</Text>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.reportedBy}>👤 {t('problems.reportedBy')}</Text>
                  <TrustBadge supportCount={problem.supportCount} />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.chuna },
  scrollContent: { paddingHorizontal: screenPadding, paddingBottom: spacing['2xl'], paddingTop: 20 },
  title: { fontSize: fontSize['2xl'], color: colors.forestGreen, fontWeight: '700', marginBottom: spacing.base },
  filterRow: { marginBottom: spacing.xs, maxHeight: 46 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: borderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  filterChipActive: { borderColor: colors.forestGreen, backgroundColor: `${colors.forestGreen}10` },
  filterEmoji: { fontSize: 18 },
  filterLabel: { fontSize: fontSize.base, color: colors.mudBrown, fontWeight: '600' },
  filterLabelActive: { color: colors.forestGreen, fontWeight: '700' },
  
  // Search bar styles (16px spacing above and below)
  searchBarRow: {
    marginTop: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  searchContainerListening: {
    borderColor: colors.sindoor,
    backgroundColor: '#FFF8F6',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.charcoal,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  micBtn: {
    padding: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(45, 80, 22, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  problemCard: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  categoryEmoji: { fontSize: 18 },
  categoryLabel: { fontSize: fontSize.base, color: colors.terracotta, fontWeight: '600' },
  cardTitle: { fontSize: fontSize.base, color: colors.charcoal, fontWeight: '500', marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, justifyContent: 'space-between' },
  reportedBy: { fontSize: fontSize.base, color: colors.borderLight },
  emptyIllustration: { marginTop: spacing['2xl'] },
});
