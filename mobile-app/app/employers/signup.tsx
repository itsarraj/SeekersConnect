import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/brand';
import { EMPLOYER_SIGNUP_STORAGE_KEY } from '@/constants/config';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployerSignupScreen() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyType: 'direct' as 'direct' | 'agency',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.role.trim()) e.role = 'Your role is required';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    setSuccessMessage('');
    setErrors({});
    if (!validate()) return;
    try {
      await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: 'recruiter',
      });
      await AsyncStorage.setItem(
        EMPLOYER_SIGNUP_STORAGE_KEY,
        JSON.stringify({
          companyName: form.companyName,
          role: form.role,
          mobile: form.mobile,
          companyType: form.companyType,
        })
      );
      setSuccessMessage('Registration successful! Check your email to verify, then log in.');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  const input = 'mt-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-3 text-white';

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-6" keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold text-white">Create employer account</Text>
      {errors.general ? <Text className="mt-2 text-red-400">{errors.general}</Text> : null}
      {successMessage ? <Text className="mt-2 text-green-400">{successMessage}</Text> : null}

      {(
        [
          ['companyName', 'Company name', false],
          ['role', 'Your role', false],
          ['fullName', 'Full name', false],
          ['mobile', 'Mobile', false],
          ['email', 'Email', false],
          ['password', 'Password', true],
          ['confirmPassword', 'Confirm password', true],
        ] as const
      ).map(([key, label, secure]) => (
        <View key={key} className="mt-4">
          <Text className="text-sm text-white/80">{label}</Text>
          <TextInput
            className={input}
            placeholderTextColor="#888"
            secureTextEntry={secure}
            keyboardType={key === 'email' ? 'email-address' : 'default'}
            value={form[key]}
            onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
          />
          {errors[key] ? <Text className="text-xs text-red-400">{errors[key]}</Text> : null}
        </View>
      ))}

      <View className="mt-4 flex-row items-center gap-3">
        <Text className="text-white/80">Agency</Text>
        <Switch
          value={form.companyType === 'agency'}
          onValueChange={(v) => setForm((f) => ({ ...f, companyType: v ? 'agency' : 'direct' }))}
        />
      </View>

      <View className="mt-4 flex-row items-center gap-3">
        <Switch value={form.agreeTerms} onValueChange={(v) => setForm((f) => ({ ...f, agreeTerms: v }))} />
        <Text className="flex-1 text-sm text-white/70">I agree to the Terms and Privacy Policy</Text>
      </View>
      {errors.agreeTerms ? <Text className="text-xs text-red-400">{errors.agreeTerms}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={isLoading}
        className="mt-6 items-center rounded-xl py-4"
        style={{ backgroundColor: brand.accent, opacity: isLoading ? 0.7 : 1 }}>
        <Text className="font-bold" style={{ color: brand.bg }}>
          {isLoading ? 'Please wait…' : 'Register'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/employers/login')} className="mt-4 py-2">
        <Text style={{ color: brand.accent }}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}
