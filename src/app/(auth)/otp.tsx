import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/common/Button';
import { useAuth } from '@/features/auth/store/AuthContext';
import { palette } from '@/theme/colors';

export default function OtpScreen() {
  const { pending, verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!pending) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Session expired. Please try again.</Text>
        <Button label="Go Back" onPress={() => router.replace('/(auth)/register')} />
      </View>
    );
  }

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError('Enter the OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    const ok = await verifyOtp(otp);
    setLoading(false);

    if (!ok) {
      setError('Could not verify OTP. Try again.');
    }
  };

  const maskedPhone =
    pending.phone.length > 4
      ? `•••• ${pending.phone.slice(-4)}`
      : pending.phone;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We sent a code to {maskedPhone}.{'\n'}
            Demo mode: enter any digits to continue.
          </Text>
        </View>

        <TextInput
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          placeholderTextColor={palette.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
          textAlign="center"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Verify & Continue" onPress={handleVerify} loading={loading} />

        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>Change phone number</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textSecondary,
  },
  otpInput: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
    color: palette.text,
  },
  error: {
    fontSize: 13,
    color: palette.red,
    textAlign: 'center',
  },
  back: {
    textAlign: 'center',
    fontSize: 14,
    color: palette.blue,
    fontWeight: '600',
    marginTop: 4,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: palette.background,
  },
  fallbackText: {
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
