import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthHero } from '@/components/auth/AuthHero';
import { TextField } from '@/components/auth/TextField';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/features/auth/store/AuthContext';

export default function LoginScreen() {
  const { startSignIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmedPhone = phone.replace(/\s/g, '');
    if (trimmedPhone.length < 6) {
      setError('Enter a valid phone number.');
      return;
    }

    setError('');
    startSignIn(trimmedPhone);
  };

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
        <AuthHero
          title="Welcome Back"
          subtitle="Sign in with your phone number to continue driving safely"
        />

        <View style={styles.form}>
          <Text style={styles.heading}>Sign In</Text>
          <Text style={styles.caption}>Any phone number works for this demo.</Text>

          <TextField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Send OTP" onPress={handleContinue} />

          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={styles.link}>
              New here? <Text style={styles.linkBold}>Create account</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scroll: {
    flexGrow: 1,
  },
  form: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#F4F6F8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  caption: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  error: {
    fontSize: 13,
    color: '#EF4444',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  linkBold: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
