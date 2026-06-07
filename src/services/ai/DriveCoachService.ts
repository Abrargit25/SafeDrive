import {
  deleteAiFeedbackBySessionId,
  getAiFeedbackBySessionId,
  upsertAiFeedback,
} from '@/db/databasehelper';
import { getDriveSessionDetails, loadDriveSessions } from '@/db/databasehelper/DriveDatabase';
import { getAiCoachConfig, isAiCoachConfigured, isGeminiDirect } from '@/config/ai';
import type { DriveEventType, DriveSession } from '@/types/drive';
import { summarizeEventsByType } from '@/utils/eventStats';
import { eventLabel } from '@/utils/eventLabels';
import { formatDuration } from '@/utils/date';

type HistoricalStats = {
  tripCount: number;
  avgScore: number;
  avgEvents: number;
  avgDistanceKm: number;
};

type AiCoachPayload = {
  sessionId: number;
  current: {
    score: number;
    safetyRating: string | null;
    distanceKm: number;
    durationSeconds: number;
    eventCount: number;
    eventsByType: Array<{ type: string; count: number }>;
    averageSpeed: number;
    maxSpeed: number;
  };
  historical: HistoricalStats | null;
};

function buildHistoricalStats(sessions: DriveSession[], currentId: string): HistoricalStats | null {
  const past = sessions.filter((s) => s.id !== currentId);
  if (!past.length) return null;

  const tripCount = past.length;
  const avgScore = Math.round(past.reduce((sum, s) => sum + s.score, 0) / tripCount);
  const avgEvents = Math.round(
    past.reduce((sum, s) => sum + s.events.length, 0) / tripCount,
  );
  const avgDistanceKm =
    past.reduce((sum, s) => sum + s.distanceMeters, 0) / tripCount / 1000;

  return { tripCount, avgScore, avgEvents, avgDistanceKm };
}

function buildPayload(
  sessionId: number,
  session: DriveSession,
  meta: { durationSeconds: number; averageSpeed: number; maxSpeed: number; safetyRating: string | null },
  history: HistoricalStats | null,
): AiCoachPayload {
  return {
    sessionId,
    current: {
      score: session.score,
      safetyRating: meta.safetyRating,
      distanceKm: session.distanceMeters / 1000,
      durationSeconds: meta.durationSeconds,
      eventCount: session.events.length,
      eventsByType: summarizeEventsByType(session.events).map((e) => ({
        type: eventLabel(e.type as DriveEventType),
        count: e.count,
      })),
      averageSpeed: meta.averageSpeed,
      maxSpeed: meta.maxSpeed,
    },
    historical: history,
  };
}

function buildLocalInsight(
  session: DriveSession,
  meta: { durationSeconds: number; averageSpeed: number; maxSpeed: number; safetyRating: string | null },
  history: HistoricalStats | null,
): string {
  const duration = formatDuration(meta.durationSeconds * 1000);
  const distanceKm = (session.distanceMeters / 1000).toFixed(1);
  const events = summarizeEventsByType(session.events);
  const eventLines = events.length
    ? events.map((e) => `• ${eventLabel(e.type as DriveEventType)}: ${e.count}`).join('\n')
    : '• No driving events detected — excellent control.';

  const historyBlock = history
    ? `Compared with your last ${history.tripCount} drives:
• Average score: ${history.avgScore} (this drive: ${session.score})
• Average events: ${history.avgEvents} (this drive: ${session.events.length})
• Average distance: ${history.avgDistanceKm.toFixed(1)} km (this drive: ${distanceKm} km)`
    : 'This is your first saved drive — future rides will be compared against this baseline.';

  const trend =
    history && session.score > history.avgScore
      ? 'You scored above your recent average.'
      : history && session.score < history.avgScore
        ? 'Your score is below your recent average.'
        : history
          ? 'Your score matches your recent average.'
          : 'This is your baseline drive — future trips will be compared against it.';

  const suggestions = buildLocalSuggestions(session.events);

  return `DRIVING FEEDBACK:
This ride scored ${session.score}/100 (${meta.safetyRating ?? 'N/A'}) over ${distanceKm} km in ${duration} with ${session.events.length} events detected. Average speed was ${meta.averageSpeed.toFixed(0)} km/h.

HISTORICAL COMPARISON:
${historyBlock}
${trend}

SUGGESTIONS:
${suggestions}

Event breakdown:
${eventLines}`;
}

function buildLocalSuggestions(events: DriveSession['events']): string {
  const byType = summarizeEventsByType(events);
  const tips: string[] = [];

  for (const row of byType) {
    if (tips.length >= 3) break;
    switch (row.type) {
      case 'harsh_brake':
        tips.push(`${tips.length + 1}. Harsh braking detected — brake earlier and more gradually, especially in traffic.`);
        break;
      case 'harsh_acceleration':
        tips.push(`${tips.length + 1}. Hard acceleration detected — ease onto the throttle for smoother, safer starts.`);
        break;
      case 'sharp_turn':
        tips.push(`${tips.length + 1}. Sharp turns detected — slow down before corners and steer smoothly.`);
        break;
      case 'aggressive_steering':
        tips.push(`${tips.length + 1}. Frequent sharp turns — plan lane changes ahead and avoid sudden steering.`);
        break;
      case 'phone_handling':
        tips.push(`${tips.length + 1}. Phone movement while driving — mount the phone before you start and avoid handling it on the road.`);
        break;
      case 'excessive_movement':
        tips.push(`${tips.length + 1}. Phone instability detected — secure the device in a stable mount to improve sensor accuracy.`);
        break;
      default:
        break;
    }
  }

  if (!tips.length) {
    return '1. Excellent control — keep maintaining smooth braking and steady steering.\n2. Stay aware of speed in changing conditions.\n3. Keep your phone mounted to preserve accurate tracking.';
  }

  while (tips.length < 3) {
    tips.push(`${tips.length + 1}. Keep reviewing your trip history to spot patterns and improve over time.`);
  }

  return tips.join('\n');
}

function isLocalCoachInsight(feedback: string) {
  return feedback.startsWith('Drive Coach Summary');
}

function isStaleLocalCoachInsight(feedback: string) {
  return (
    isLocalCoachInsight(feedback) &&
    (feedback.includes('Add OPENAI_API_KEY') ||
      feedback.includes('Add ANTHROPIC_API_KEY') ||
      feedback.includes('Add GEMINI_API_KEY'))
  );
}

function buildHistoryContext(
  current: AiCoachPayload['current'],
  historical: HistoricalStats | null,
): string {
  if (!historical) {
    return 'No prior drives on record — this is the user\'s first saved session.';
  }

  const scoreDelta = current.score - historical.avgScore;
  const eventsDelta = current.eventCount - historical.avgEvents;
  const distanceDelta = current.distanceKm - historical.avgDistanceKm;

  return `Prior ${historical.tripCount} drives baseline:
- Average score: ${historical.avgScore} (this drive: ${current.score}, delta ${scoreDelta >= 0 ? '+' : ''}${scoreDelta})
- Average events: ${historical.avgEvents} (this drive: ${current.eventCount}, delta ${eventsDelta >= 0 ? '+' : ''}${eventsDelta})
- Average distance: ${historical.avgDistanceKm.toFixed(1)} km (this drive: ${current.distanceKm.toFixed(1)} km, delta ${distanceDelta >= 0 ? '+' : ''}${distanceDelta.toFixed(1)} km)`;
}

function buildCoachPrompt(payload: AiCoachPayload): string {
  const { current, historical } = payload;
  const events = current.eventsByType.map((e) => `${e.type}: ${e.count}`).join(', ');
  const topEvents = current.eventsByType
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((e) => `${e.type} (${e.count})`)
    .join(', ');

  return `Analyze this phone-sensor driving session and write personalized coaching feedback.

CURRENT DRIVE DATA
- Score: ${current.score}/100 (${current.safetyRating ?? 'N/A'})
- Distance: ${current.distanceKm.toFixed(1)} km
- Duration: ${formatDuration(current.durationSeconds * 1000)}
- Total events: ${current.eventCount}
- Events by type: ${events || 'none'}
- Top issues: ${topEvents || 'none'}
- Avg speed: ${current.averageSpeed.toFixed(0)} km/h, max: ${current.maxSpeed.toFixed(0)} km/h

HISTORICAL DATA
${buildHistoryContext(current, historical)}

OUTPUT FORMAT — use these exact section labels, plain text only (no markdown, no bullets with *):

DRIVING FEEDBACK:
2–3 sentences summarizing how this drive went, what the score means, and the main safety pattern you see.

HISTORICAL COMPARISON:
2–3 sentences comparing this drive to the user's prior average. Say whether score, events, and consistency improved or worsened. If no history, explain this sets their baseline.

SUGGESTIONS:
Give exactly 3 numbered, actionable tips tailored to their top events (e.g. harsh braking, sharp turns, phone handling). Each tip must be specific and practical for everyday driving.

Keep total response under 280 words. Be encouraging but honest.`;
}

export type CoachFeedbackSection = {
  title: string;
  body: string;
};

export function parseCoachFeedbackSections(feedback: string): CoachFeedbackSection[] | null {
  const markers = [
    { key: 'DRIVING FEEDBACK:', title: 'Driving Feedback' },
    { key: 'HISTORICAL COMPARISON:', title: 'Historical Comparison' },
    { key: 'SUGGESTIONS:', title: 'Suggestions' },
  ];

  const upper = feedback.toUpperCase();
  const positions = markers
    .map((m) => ({ ...m, index: upper.indexOf(m.key) }))
    .filter((m) => m.index >= 0)
    .sort((a, b) => a.index - b.index);

  if (positions.length < 2) return null;

  const sections: CoachFeedbackSection[] = [];
  for (let i = 0; i < positions.length; i += 1) {
    const start = positions[i].index + positions[i].key.length;
    const end = i + 1 < positions.length ? positions[i + 1].index : feedback.length;
    const body = feedback.slice(start, end).trim();
    if (body) sections.push({ title: positions[i].title, body });
  }

  return sections.length ? sections : null;
}

function formatNetworkError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('connection timeout') ||
    lower.includes('upstream connect error') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch')
  ) {
    return 'Could not reach Gemini (connection timed out). Use Wi‑Fi, turn off VPN, and ensure your network allows generativelanguage.googleapis.com.';
  }
  return message;
}

function formatAiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; type?: string };
      type?: string;
    };
    const message = parsed.error?.message;
    if (parsed.error?.type === 'authentication_error') {
      return 'Invalid Anthropic API key. Check ANTHROPIC_API_KEY in .env and restart Metro with --clear.';
    }
    if (parsed.error?.type === 'rate_limit_error') {
      return 'Claude rate limit reached. Wait a moment and tap Explain again.';
    }
    if (message) return message;
  } catch {
    // use raw body below
  }
  return body.trim() || `AI request failed (${status})`;
}

function toCoachError(err: unknown): Error {
  const message =
    err instanceof Error ? err.message : 'AI coach request failed';
  return new Error(formatNetworkError(message));
}

function parseGeminiResponse(data: unknown): string {
  if (!data || typeof data !== 'object') throw new Error('Invalid AI response');

  const response = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) throw new Error('Empty AI response');
  return text;
}

function parseCustomBackendResponse(data: unknown): string {
  if (!data || typeof data !== 'object') throw new Error('Invalid AI response');

  const payload = data as {
    feedback?: string;
    insight?: string;
    message?: string;
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const fromGeminiShape = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  const text = payload.feedback ?? payload.insight ?? payload.message ?? fromGeminiShape;
  if (!text?.trim()) throw new Error('Empty AI response');
  return text.trim();
}

async function callAiCoach(payload: AiCoachPayload): Promise<string> {
  const config = getAiCoachConfig();
  const prompt = buildCoachPrompt(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: object;

  if (isGeminiDirect()) {
    if (!config.apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    headers['X-goog-api-key'] = config.apiKey;
    body = {
      systemInstruction: {
        parts: [
          {
            text:
              'You are an expert driving safety coach for a phone-sensor mobile app. ' +
              'Give honest, encouraging feedback with clear historical comparison and practical numbered suggestions. ' +
              'Follow the output format exactly.',
          },
        ],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 700,
      },
    };
  } else {
    body = payload;
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(formatAiError(response.status, err));
  }

  const data = await response.json();
  return isGeminiDirect() ? parseGeminiResponse(data) : parseCustomBackendResponse(data);
}

export async function getOrGenerateDriveInsight(
  sessionId: number,
  options?: { regenerate?: boolean },
): Promise<{
  feedback: string;
  fromCache: boolean;
  usedAi: boolean;
}> {
  const forceFresh = options?.regenerate === true;

  if (forceFresh) {
    await deleteAiFeedbackBySessionId(sessionId);
  }

  if (!forceFresh) {
    const cached = await getAiFeedbackBySessionId(sessionId);
    if (cached?.feedback) {
      const local = isLocalCoachInsight(cached.feedback);
      const stale = isStaleLocalCoachInsight(cached.feedback);
      const shouldUseCache = !stale && !local;
      if (shouldUseCache) {
        return { feedback: cached.feedback, fromCache: true, usedAi: true };
      }
      if (stale || local) {
        await deleteAiFeedbackBySessionId(sessionId);
      }
    }
  }

  const details = await getDriveSessionDetails(sessionId);
  if (!details?.session) {
    throw new Error('Drive session not found');
  }

  const allSessions = await loadDriveSessions();
  const history = buildHistoricalStats(allSessions, details.session.id);
  const payload = buildPayload(sessionId, details.session, details.meta, history);

  if (!isAiCoachConfigured()) {
    if (forceFresh) {
      throw new Error(
        'AI coach is not configured. Add GEMINI_API_KEY to `.env` (not .env.example), then restart Metro with --clear.',
      );
    }
    const feedback = buildLocalInsight(details.session, details.meta, history);
    return { feedback, fromCache: false, usedAi: false };
  }

  try {
    const feedback = await callAiCoach(payload);
    await upsertAiFeedback(sessionId, feedback);
    return { feedback, fromCache: false, usedAi: true };
  } catch (err) {
    if (forceFresh) {
      throw toCoachError(err);
    }
    const feedback = buildLocalInsight(details.session, details.meta, history);
    return { feedback, fromCache: false, usedAi: false };
  }
}
