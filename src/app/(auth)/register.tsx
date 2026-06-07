import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthHero } from '@/components/auth/AuthHero';
import { TextField } from '@/components/auth/TextField';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/features/auth/store/AuthContext';

export default function RegisterScreen() {
  const { startSignUp } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.replace(/\s/g, '');

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (trimmedPhone.length < 6) {
      setError('Enter a valid phone number.');
      return;
    }

    setError('');
    startSignUp(trimmedName, trimmedPhone);
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
        <AuthHero />

        <View style={styles.form}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.caption}>Enter your name and phone number to get started.</Text>

          <TextField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Alex Morgan"
            autoCapitalize="words"
            returnKeyType="next"
          />

          <TextField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Continue" onPress={handleContinue} />

          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign in</Text>
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
