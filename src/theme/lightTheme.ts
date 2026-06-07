import { palette } from './colors';

export type ThemeColors = {
  [K in keyof typeof palette]: string;
};

export type Theme = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: palette,
};
