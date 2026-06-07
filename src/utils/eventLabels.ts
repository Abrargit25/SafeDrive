import type { DriveEventType } from '@/types/drive';

const labels: Record<DriveEventType, string> = {
  harsh_brake: 'Harsh Braking',
  harsh_acceleration: 'Harsh Acceleration',
  sharp_turn: 'Sharp Turns',
  aggressive_steering: 'Aggressive Steering Movements',
  excessive_movement: 'Excessive Device Movement',
  phone_handling: 'Possible Phone Handling During Driving',
};

const icons: Record<DriveEventType, string> = {
  harsh_brake: 'hand-left-outline',
  harsh_acceleration: 'speedometer-outline',
  sharp_turn: 'git-compare-outline',
  aggressive_steering: 'swap-horizontal-outline',
  excessive_movement: 'phone-portrait-outline',
  phone_handling: 'call-outline',
};

export function eventLabel(type: DriveEventType) {
  return labels[type];
}

export function eventIcon(type: DriveEventType) {
  return icons[type];
}
