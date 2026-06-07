import Constants from 'expo-constants';

const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function readExtra(): Record<string, unknown> {
  return (
    Constants.expoConfig?.extra ??
    (Constants as { manifest2?: { extra?: Record<string, unknown> } }).manifest2?.extra ??
    (Constants as { manifest?: { extra?: Record<string, unknown> } }).manifest?.extra ??
    {}
  );
}

export function buildGeminiApiUrl(model: string) {
  return `${GEMINI_API_BASE}/models/${model}:generateContent`;
}

/** Read at call time so manifest/extra is available after Metro reload. */
export function getAiCoachConfig() {
  const model = process.env.EXPO_PUBLIC_AI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  return {
    apiUrl:
      process.env.EXPO_PUBLIC_AI_COACH_API_URL?.trim() || buildGeminiApiUrl(model),
    model,
    apiKey: String(readExtra().geminiApiKey ?? '').trim(),
  };
}

export function isGeminiDirect() {
  return getAiCoachConfig().apiUrl.includes('generativelanguage.googleapis.com');
}

export function isAiCoachConfigured() {
  const config = getAiCoachConfig();
  if (isGeminiDirect()) {
    return config.apiKey.length > 0;
  }
  return config.apiUrl.length > 0;
}
