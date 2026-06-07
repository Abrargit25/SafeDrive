export const palette = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  blue: '#3B82F6',
  blueDark: '#2563EB',
  purple: '#8B5CF6',
  orange: '#F97316',
  red: '#EF4444',
  yellow: '#EAB308',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  heroGradientStart: '#3B82F6',
  heroGradientEnd: '#1D4ED8',
  liveGreen: '#22C55E',
  liveRed: '#EF4444',
} as const;

export function scoreColor(score: number) {
  if (score >= 80) return palette.primary;
  if (score >= 60) return palette.orange;
  return palette.red;
}

export function scoreLabel(score: number) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}
