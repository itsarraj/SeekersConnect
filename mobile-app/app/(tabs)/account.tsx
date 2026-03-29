import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  const link = (label: string, href: Parameters<typeof router.push>[0]) => (
    <Pressable onPress={() => router.push(href)} className="border-b border-white/10 py-4">
      <Text className="text-base text-white">{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView
      className="flex-1 bg-[#2b2b2b]"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
      <Text className="text-2xl font-bold text-white">Account</Text>

      {!isAuthenticated ? (
        <View className="mt-6">
          {link('Log in', '/login')}
          {link('Sign up', '/register')}
          {link('Reset password', '/reset-password')}
          {link('For employers', '/employers')}
          {link('About', '/about')}
          {link('Contact', '/contact')}
        </View>
      ) : (
        <View className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: brand.accent }}>
            <Text className="text-2xl font-bold" style={{ color: brand.bg }}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-white">{user?.name}</Text>
          <Text className="text-sm text-white/60">{user?.email}</Text>
          <Text className="mt-1 text-xs uppercase text-white/40">Role: {user?.role}</Text>

          {!isRecruiter && user?.role === 'user' ? (
            <Pressable
              onPress={() => router.push('/profile')}
              className="mt-4 items-center rounded-xl py-4"
              style={{ backgroundColor: brand.accent }}>
              <Text className="font-bold" style={{ color: brand.bg }}>
                My profile & resume
              </Text>
            </Pressable>
          ) : null}

          {isRecruiter ? (
            <>
              <Pressable
                onPress={() => router.replace('/(tabs)/recruiter')}
                className="mt-4 items-center rounded-xl border py-4"
                style={{ borderColor: brand.accent }}>
                <Text className="font-bold" style={{ color: brand.accent }}>
                  Recruiter dashboard
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/pricing')}
                className="mt-3 items-center rounded-xl py-4"
                style={{ backgroundColor: brand.surface2 }}>
                <Text className="font-bold text-white">Pricing</Text>
              </Pressable>
            </>
          ) : null}

          {user?.role === 'user' ? (
            <Pressable
              onPress={() => router.push('/upgrade')}
              className="mt-3 items-center rounded-xl py-3"
              style={{ backgroundColor: `${brand.accent}33` }}>
              <Text className="font-bold" style={{ color: brand.accent }}>
                Upgrade to Premium
              </Text>
            </Pressable>
          ) : null}

          <View className="mt-6">
            {link('About', '/about')}
            {link('Contact', '/contact')}
          </View>

          <Pressable
            onPress={() => logout()}
            disabled={isLoading}
            className="mt-8 items-center rounded-xl border border-red-500/40 py-4">
            <Text className="font-bold text-red-400">Log out</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
