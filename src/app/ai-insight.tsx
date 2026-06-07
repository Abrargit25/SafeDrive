import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Button, Card, ScreenContainer, SectionTitle } from '@/components';
import { isAiCoachConfigured } from '@/config/ai';
import { useFocusedStatusBar } from '@/hooks/useFocusedStatusBar';
import {
  getOrGenerateDriveInsight,
  parseCoachFeedbackSections,
} from '@/services/ai/DriveCoachService';
import { palette } from '@/theme/colors';

export default function AiInsightScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  useFocusedStatusBar({ style: 'dark', translucent: false });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [usedAi, setUsedAi] = useState(false);

  const loadInsight = useCallback(async (explain = false) => {
    if (!sessionId) return;
    if (explain) {
      setExplaining(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const result = await getOrGenerateDriveInsight(Number(sessionId), { regenerate: explain });
      setFeedback(result.feedback);
      setFromCache(result.fromCache);
      setUsedAi(result.usedAi);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate explanation');
      if (explain) {
        setFeedback(null);
        setUsedAi(false);
        setFromCache(false);
      }
    } finally {
      setLoading(false);
      setExplaining(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadInsight();
  }, [loadInsight]);

  const sections = useMemo(
    () => (feedback ? parseCoachFeedbackSections(feedback) : null),
    [feedback],
  );

  const showContent = !loading && feedback;

  return (
    <ScreenContainer>
      <AppHeader title="Explain" showBack onBack={() => router.back()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} size="large" />
          <Text style={styles.loadingText}>Generating driving feedback…</Text>
        </View>
      ) : error && !feedback ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Button label="Explain" onPress={() => loadInsight(true)} />
        </View>
      ) : showContent ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {error ? (
            <Card style={styles.errorCard}>
              <Text style={styles.error}>{error}</Text>
            </Card>
          ) : null}

          {!usedAi && !error ? (
            <Card style={styles.hintCard}>
              <Text style={styles.hintText}>
                {isAiCoachConfigured()
                  ? 'Showing a local summary. Tap Explain for AI-generated feedback with historical comparison.'
                  : 'Add GEMINI_API_KEY to `.env` (not .env.example), restart Metro with --clear, then tap Explain.'}
              </Text>
            </Card>
          ) : null}

          <Card>
            <Text style={styles.cardTitle}>
              {usedAi ? 'AI-generated driving feedback' : 'Driving feedback'}
            </Text>
            <View style={styles.badgeRow}>
              <Text style={styles.badge}>
                {fromCache ? 'Saved' : 'New'}
                {usedAi ? ' · Gemini AI' : ' · Local'}
              </Text>
              {usedAi ? (
                <>
                  <Text style={styles.featureBadge}>Historical comparison</Text>
                  <Text style={styles.featureBadge}>Personalized tips</Text>
                </>
              ) : null}
            </View>

            {sections ? (
              <View style={styles.sections}>
                {sections.map((section) => (
                  <View key={section.title} style={styles.section}>
                    <SectionTitle title={section.title} />
                    <Text style={styles.feedback}>{section.body}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.feedback}>{feedback}</Text>
            )}
          </Card>

          <Button
            label={explaining ? 'Explaining…' : 'Explain'}
            variant="secondary"
            disabled={explaining}
            onPress={() => loadInsight(true)}
          />
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    color: palette.textSecondary,
  },
  error: {
    fontSize: 15,
    color: palette.red,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorCard: {
    backgroundColor: `${palette.red}10`,
    borderColor: `${palette.red}30`,
  },
  scroll: {
    paddingBottom: 32,
    gap: 12,
  },
  hintCard: {
    backgroundColor: `${palette.orange}12`,
    borderColor: `${palette.orange}35`,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.textSecondary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.primaryDark,
    backgroundColor: `${palette.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.purple,
    backgroundColor: `${palette.purple}14`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sections: {
    gap: 16,
  },
  section: {
    gap: 4,
  },
  feedback: {
    fontSize: 15,
    lineHeight: 24,
    color: palette.text,
  },
});
