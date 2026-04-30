import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

const CANDIDATE_PLANS = [
  {
    name: 'FREE',
    description: 'Get started with AI-powered job matching.',
    price: '$0',
    period: '/Monthly',
    features: ['3 AI Matches', 'Basic Job Search', 'Apply to Jobs', 'Resume Storage'],
    recommended: false,
    current: true,
  },
  {
    name: 'PREMIUM',
    description: 'Unlock your full potential with unlimited AI matches.',
    price: '$9',
    period: '/Monthly',
    features: [
      'Unlimited AI Matches',
      'Priority Job Recommendations',
      'Apply to Jobs',
      'Resume Storage',
      'Match Score Insights',
      'Early Access to New Jobs',
    ],
    recommended: true,
    current: false,
  },
];

export default function UpgradeScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b]">
        <ActivityIndicator color={brand.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (user?.role !== 'user') {
    return <Redirect href="/unauthorized" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-3xl font-bold text-white">Upgrade to Premium</Text>
      <Text className="mt-2 text-base leading-6 text-white/60">
        Unlock unlimited AI matches and get priority job recommendations tailored to your profile.
      </Text>

      <View className="mt-10 flex-col gap-6">
        {CANDIDATE_PLANS.map((plan) => (
          <View
            key={plan.name}
            className="rounded-2xl border p-6"
            style={{
              borderColor: plan.recommended ? brand.accent : 'rgba(255,255,255,0.1)',
              backgroundColor: brand.surface,
            }}>
            {plan.recommended ? (
              <Text className="mb-2 text-xs font-bold uppercase" style={{ color: brand.accent }}>
                Recommended
              </Text>
            ) : null}
            <Text className="text-xs font-bold uppercase tracking-widest text-white/40">{plan.name}</Text>
            <Text className="mt-2 min-h-[40px] text-sm text-white/70">{plan.description}</Text>
            <Text className="mt-4 text-4xl font-bold" style={{ color: brand.accent }}>
              {plan.price}
              <Text className="text-base font-normal text-white/40">{plan.period}</Text>
            </Text>
            {plan.current ? <Text className="mt-2 text-xs uppercase text-white/40">Current plan</Text> : null}
            <View className="my-4 h-px bg-white/10" />
            <View className="gap-3">
              {plan.features.map((f) => (
                <Text key={f} className="text-sm text-white/80">
                  ✓ {f}
                </Text>
              ))}
            </View>
            {!plan.current ? (
              <Pressable
                onPress={() => router.push({ pathname: '/contact', params: { intent: 'upgrade' } })}
                className="mt-6 items-center rounded-xl py-4"
                style={{ backgroundColor: plan.recommended ? brand.accent : brand.surface2 }}>
                <Text className="font-bold" style={{ color: plan.recommended ? brand.bg : brand.text }}>
                  Subscribe
                </Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <View
        className="mt-10 rounded-2xl border p-6"
        style={{ borderColor: `${brand.accent}55`, backgroundColor: brand.surface }}>
        <Text className="text-center text-xl font-bold text-white">Next steps</Text>
        <Text className="mt-3 text-center text-base text-white/60">
          Subscribe on Premium above to contact us. We will get you set up with unlimited AI matches and priority job
          recommendations.
        </Text>
        <Pressable
          onPress={() => router.push({ pathname: '/contact', params: { intent: 'upgrade' } })}
          className="mt-5 items-center rounded-xl py-4"
          style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Contact us to upgrade
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
