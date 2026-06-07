import { createContext, type ReactNode, useContext } from 'react';

import { lightTheme, type Theme } from '@/theme';

const ThemeContext = createContext<Theme>(lightTheme);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
