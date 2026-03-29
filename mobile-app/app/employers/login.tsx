import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployerLoginScreen() {
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    try {
      await login(form);
      router.replace('/(tabs)/recruiter');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  return (
    <View className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-2xl font-bold text-white">Employer login</Text>
      <Text className="mt-2 text-white/60">Sign in to manage jobs and candidates</Text>
      <Text className="mt-6 text-sm text-white/80">Email</Text>
      <TextInput
        className="mt-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-3 text-white"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
      />
      <Text className="mt-4 text-sm text-white/80">Password</Text>
      <TextInput
        className="mt-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-3 text-white"
        placeholderTextColor="#888"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
      />
      {error ? <Text className="mt-2 text-red-400">{error}</Text> : null}
      <Pressable
        onPress={onSubmit}
        disabled={isLoading}
        className="mt-8 items-center rounded-xl py-4"
        style={{ backgroundColor: brand.accent }}>
        <Text className="font-bold" style={{ color: brand.bg }}>
          {isLoading ? 'Signing in…' : 'Log in'}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push('/reset-password')} className="mt-4 self-end">
        <Text style={{ color: brand.accent }}>Forgot password?</Text>
      </Pressable>
    </View>
  );
}
