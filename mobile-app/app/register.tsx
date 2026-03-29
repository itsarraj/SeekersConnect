import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    setSuccess('');
    setErrors({});
    if (!validate()) return;
    try {
      await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: 'user',
      });
      setSuccess('Registration successful! Check your email to verify your account.');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  const field = (key: keyof typeof form, label: string, secure?: boolean) => (
    <View className="mt-4">
      <Text className="text-sm text-white/80">{label}</Text>
      <TextInput
        className={`mt-1 rounded-lg border px-3 py-3 text-white ${errors[key] ? 'border-red-500' : 'border-white/10'} bg-[#1a1a1a]`}
        placeholderTextColor="#888"
        secureTextEntry={!!secure}
        keyboardType={key === 'email' ? 'email-address' : 'default'}
        autoCapitalize={key === 'email' ? 'none' : 'words'}
        value={form[key]}
        onChangeText={(v) => {
          setForm((f) => ({ ...f, [key]: v }));
          if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
        }}
      />
      {errors[key] ? <Text className="text-xs text-red-400">{errors[key]}</Text> : null}
    </View>
  );

  return (
    <View className="flex-1 justify-center bg-[#2b2b2b] px-6">
      <Pressable onPress={() => router.back()} className="mb-8">
        <Text style={{ color: brand.accent }}>← Back</Text>
      </Pressable>
      <Text className="text-center text-2xl font-bold text-white">Hello…</Text>
      <Text className="mb-4 text-center text-4xl font-bold text-white">Register</Text>
      {errors.general ? <Text className="text-center text-red-400">{errors.general}</Text> : null}
      {success ? <Text className="text-center text-green-400">{success}</Text> : null}
      {field('fullName', 'Full name')}
      {field('email', 'Email')}
      {field('password', 'Password', true)}
      {field('confirmPassword', 'Confirm password', true)}
      <Pressable
        onPress={onSubmit}
        disabled={isLoading}
        className="mt-8 items-center rounded-xl py-4"
        style={{ backgroundColor: brand.accent }}>
        <Text className="font-bold" style={{ color: brand.bg }}>
          {isLoading ? 'Please wait…' : 'Create account'}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push('/login')} className="mt-6">
        <Text className="text-center text-white/70">
          Have an account? <Text style={{ color: brand.accent }}>Log in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
