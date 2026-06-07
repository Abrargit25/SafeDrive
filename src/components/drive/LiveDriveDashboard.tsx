import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTabBarHeight } from '@/constants/layout';
import { thresholds } from '@/constants/thresholds';
import { useDrive } from '@/features/drive/store/DriveContext';
import { palette } from '@/theme/colors';
import { DRIVE_EVENT_TYPES, type DriveEventType } from '@/types/drive';
import { getAdaptiveCoverLayout } from '@/utils/adaptiveImage';
import { buildEventStatsMap, formatPeakValue } from '@/utils/eventStats';
import { eventIcon, eventLabel } from '@/utils/eventLabels';

const DRIVE_BG = require('../../../assets/StartAndEndDriveImg.png');
const IMG = Image.resolveAssetSource(DRIVE_BG);

const eventColors: Record<DriveEventType, { bg: string; color: string }> = {
  harsh_brake: { bg: 'rgba(239,68,68,0.25)', color: '#FCA5A5' },
  harsh_acceleration: { bg: 'rgba(249,115,22,0.25)', color: '#FDBA74' },
  sharp_turn: { bg: 'rgba(234,179,8,0.25)', color: '#FDE047' },
  aggressive_steering: { bg: 'rgba(139,92,246,0.25)', color: '#C4B5FD' },
  excessive_movement: { bg: 'rgba(59,130,246,0.25)', color: '#93C5FD' },
  phone_handling: { bg: 'rgba(239,68,68,0.25)', color: '#FCA5A5' },
};

function formatTimer(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type GlassProps = { children: React.ReactNode; style?: object };

function GlassPanel({ children, style }: GlassProps) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

type SpeedGaugeProps = { speed: number; size?: number };

function SpeedGauge({ speed, size = 148 }: SpeedGaugeProps) {
  const limit = 180;
  const pct = Math.min(speed / limit, 1);
  const angle = -180 + pct * 180;
  const rad = (angle * Math.PI) / 180;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.55;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <View style={{ width: size, height: size * 0.62, alignItems: 'center' }}>
      <Svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`}>
        <Path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${nx} ${ny}`}
          stroke="#38BDF8"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.gaugeReadout}>
        <Text style={styles.gaugeSpeed}>{Math.round(speed)}</Text>
        <Text style={styles.gaugeUnit}>km/h</Text>
        <Text style={styles.gaugeLabel}>Current Speed</Text>
      </View>
    </View>
  );
}

const SENSORS = [
  { key: 'accel', label: 'Accelerometer', icon: 'speedometer-outline' as const },
  { key: 'gyro', label: 'Gyroscope', icon: 'sync-outline' as const },
  { key: 'motion', label: 'Device Motion', icon: 'phone-portrait-outline' as const },
  { key: 'mag', label: 'Magnetometer', icon: 'compass-outline' as const },
];

export function LiveDriveDashboard() {
  const insets = useSafeAreaInsets();
  const { width: windowW, height: windowH } = useWindowDimensions();
  const screen = Dimensions.get('screen');
  const {
    active,
    elapsedMs,
    speedKmh,
    maxSpeedKmh,
    avgSpeedKmh,
    gpsStatus,
    sensorsActive,
    readings,
    endDrive,
  } = useDrive();

  const distanceKm = (active?.distanceMeters ?? 0) / 1000;
  const events = active?.events ?? [];
  const totalEvents = events.length;
  const eventStats = useMemo(() => buildEventStatsMap(events), [events]);

  const bgLayout = useMemo(
    () =>
      getAdaptiveCoverLayout(
        { width: screen.width, height: screen.height },
        { width: IMG.width, height: IMG.height },
        'bottom',
      ),
    [screen.width, screen.height, windowW, windowH],
  );

  const uiScale = Math.min(Math.max(windowW / 390, 0.85), 1.12);
  const horizontalPad = Math.max(insets.left, 12);
  const bottomPad = getTabBarHeight(insets.bottom) + 16;
  const headerHeight = insets.top + 58;

  return (
    <View style={styles.root}>
      <Image
        source={DRIVE_BG}
        style={{
          position: 'absolute',
          left: bgLayout.left,
          top: bgLayout.top,
          width: bgLayout.width,
          height: bgLayout.height,
        }}
        resizeMode="cover"
        fadeDuration={0}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + 8,
          paddingHorizontal: horizontalPad,
          paddingBottom: bottomPad,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GlassPanel style={styles.metricsBar}>
          <MetricItem
            icon="location"
            iconColor="#4ADE80"
            label="GPS"
            value={gpsStatus}
            valueColor={gpsStatus === 'Strong' ? '#4ADE80' : '#FBBF24'}
          />
          <MetricDivider />
          <MetricItem
            icon="time-outline"
            iconColor="#38BDF8"
            label="Duration"
            value={formatTimer(elapsedMs)}
          />
          <MetricDivider />
          <MetricItem
            icon="navigate-outline"
            iconColor="#38BDF8"
            label="Distance"
            value={`${distanceKm.toFixed(1)} km`}
          />
        </GlassPanel>

        <View style={styles.mainRow}>
          <GlassPanel style={styles.speedPanel}>
            <SpeedGauge speed={speedKmh} size={Math.round(140 * uiScale)} />
          </GlassPanel>

          <GlassPanel style={styles.scorePanel}>
            <Text style={styles.liveStatsTitle}>Live Sensors</Text>
            <Text style={styles.liveStatLine}>{readings.accel}</Text>
            <Text style={styles.liveStatLine}>{readings.gyro}</Text>
            <Text style={styles.liveStatLine}>Speed {Math.round(speedKmh)} km/h</Text>
            <Text style={styles.scoreHint}>Score calculated when drive ends</Text>
          </GlassPanel>
        </View>

        <GlassPanel style={styles.sensorsPanel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sensors</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                {sensorsActive ? 'All Active ✓' : 'Starting…'}
              </Text>
            </View>
          </View>
          <View style={styles.sensorGrid}>
            {SENSORS.map((s) => (
              <View key={s.key} style={styles.sensorItem}>
                <Ionicons name={s.icon} size={22} color="#93C5FD" />
                <Text style={styles.sensorLabel}>{s.label}</Text>
                <Text style={styles.sensorActive}>Active</Text>
              </View>
            ))}
          </View>
          <Text style={styles.batteryNote}>
            Sensors run only while recording · {1000 / thresholds.sensorIntervalMs} Hz detection ·
            GPS every 1s · Stops when drive ends
          </Text>
        </GlassPanel>

        <GlassPanel style={styles.statsBar}>
          <StatItem label="Distance" value={`${distanceKm.toFixed(1)} km`} />
          <StatItem label="Avg. Speed" value={`${Math.round(avgSpeedKmh)} km/h`} />
          <StatItem label="Events" value={`${totalEvents}`} />
          <StatItem label="Max. Speed" value={`${Math.round(maxSpeedKmh)} km/h`} />
        </GlassPanel>

        <GlassPanel style={styles.eventsPanel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Real-time Events</Text>
            <Text style={styles.totalEvents}>{totalEvents} total</Text>
          </View>
          {DRIVE_EVENT_TYPES.map((type, index) => {
            const colors = eventColors[type];
            const stat = eventStats[type];
            return (
              <View
                key={type}
                style={[styles.eventRow, index === 0 && styles.eventRowFirst]}
              >
                <View style={[styles.eventIcon, { backgroundColor: colors.bg }]}>
                  <Ionicons
                    name={eventIcon(type) as 'hand-left-outline'}
                    size={16}
                    color={colors.color}
                  />
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {eventLabel(type)}
                  </Text>
                  <Text style={styles.eventPeak}>
                    {stat.count > 0
                      ? formatPeakValue(type, stat.peak, stat.unit)
                      : 'No reading yet'}
                  </Text>
                </View>
                <Text style={styles.eventCount}>{stat.count}</Text>
              </View>
            );
          })}
        </GlassPanel>

        <Pressable style={styles.endBtn} onPress={endDrive}>
          <Ionicons name="stop" size={20} color="#FFF" />
          <Text style={styles.endBtnText}>End Drive</Text>
        </Pressable>
      </ScrollView>

      {/* Pinned app bar — overlays scroll content, never moves */}
      <View
        style={[
          styles.fixedHeader,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: horizontalPad,
            height: headerHeight,
          },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { fontSize: Math.round(20 * uiScale) }]}>Live Drive</Text>
          <View style={styles.recordingRow}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          hitSlop={12}
          style={styles.iconBtn}
        >
          <Ionicons name="settings-outline" size={22} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

function MetricItem({
  icon,
  iconColor,
  label,
  value,
  valueColor = '#FFF',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metricItem}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function MetricDivider() {
  return <View style={styles.metricDivider} />;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E4FA8',
    overflow: 'hidden',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'rgba(8, 20, 48, 0.72)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingBottom: 8,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  glass: {
    backgroundColor: 'rgba(8, 20, 48, 0.55)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  recordingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  recordingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  mainRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  speedPanel: {
    flex: 1.15,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  scorePanel: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  gaugeReadout: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
  },
  gaugeSpeed: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 38,
  },
  gaugeUnit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  gaugeLabel: {
    fontSize: 11,
    color: '#4ADE80',
    fontWeight: '600',
    marginTop: 2,
  },
  liveStatsTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  liveStatLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  scoreHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sensorsPanel: {
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: 'rgba(74,222,128,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensorItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  sensorLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sensorActive: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '500',
  },
  batteryNote: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic',
  },
  eventsPanel: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 14,
  },
  totalEvents: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  eventRowFirst: {
    borderTopWidth: 0,
  },
  eventIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  eventPeak: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
  },
  eventCount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'right',
    includeFontPadding: false,
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.red,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  endBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
