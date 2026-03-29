import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

const CANDIDATE_PLANS = [
  {
    name: 'FREE',
    price: '$0',
    period: '/mo',
    features: ['3 AI Matches', 'Basic search', 'Apply to jobs', 'Resume storage'],
    current: true,
  },
  {
    name: 'PREMIUM',
    price: '$9',
    period: '/mo',
    features: ['Unlimited AI matches', 'Priority recommendations', 'Match insights', 'Early access'],
    current: false,
  },
];

export default function UpgradeScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  if (user?.role !== 'user') {
    return <Redirect href="/pricing" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-3xl font-bold text-white">Upgrade your plan</Text>
      <Text className="mt-2 text-white/60">Unlock unlimited AI matches and premium candidate features.</Text>
      <View className="mt-8 gap-6">
        {CANDIDATE_PLANS.map((plan) => (
          <View
            key={plan.name}
            className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5"
            style={plan.name === 'PREMIUM' ? { borderColor: brand.accent } : undefined}>
            <Text className="text-xl font-bold text-white">{plan.name}</Text>
            <Text className="mt-2 text-3xl font-black text-white">
              {plan.price}
              <Text className="text-base font-normal text-white/50">{plan.period}</Text>
            </Text>
            {plan.current ? (
              <Text className="mt-2 text-xs uppercase text-white/40">Current plan</Text>
            ) : null}
            <View className="mt-4 gap-2">
              {plan.features.map((f) => (
                <Text key={f} className="text-sm text-white/80">
                  ✓ {f}
                </Text>
              ))}
            </View>
            {!plan.current && (
              <Pressable
                onPress={() => router.push('/contact?intent=upgrade')}
                className="mt-6 items-center rounded-xl py-4"
                style={{ backgroundColor: brand.accent }}>
                <Text className="font-bold" style={{ color: brand.bg }}>
                  Contact sales
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
