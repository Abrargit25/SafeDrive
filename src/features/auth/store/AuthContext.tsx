import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const AUTH_KEY = '@safedrive/user';

export type AuthUser = {
  name: string;
  phone: string;
};

type PendingAuth = {
  name?: string;
  phone: string;
  mode: 'signup' | 'signin';
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  pending: PendingAuth | null;
  startSignUp: (name: string, phone: string) => void;
  startSignIn: (phone: string) => void;
  verifyOtp: (otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAuth | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      })
      .finally(() => setLoading(false));
  }, []);

  const startSignUp = useCallback((name: string, phone: string) => {
    setPending({ name: name.trim(), phone: phone.trim(), mode: 'signup' });
    router.push('/(auth)/otp');
  }, []);

  const startSignIn = useCallback((phone: string) => {
    setPending({ phone: phone.trim(), mode: 'signin' });
    router.push('/(auth)/otp');
  }, []);

  const verifyOtp = useCallback(
    async (otp: string) => {
      if (!pending?.phone) return false;
      if (!otp.trim()) return false;

      const nextUser: AuthUser = {
        name: pending.name ?? user?.name ?? 'Driver',
        phone: pending.phone,
      };

      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setPending(null);
      router.replace('/(tabs)');
      return true;
    },
    [pending, user?.name],
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
    setPending(null);
    router.replace('/(auth)/register');
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      pending,
      startSignUp,
      startSignIn,
      verifyOtp,
      signOut,
    }),
    [user, loading, pending, startSignUp, startSignIn, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
