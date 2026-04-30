import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';

const PLANS = [
  {
    name: 'FREE (NEW)',
    description: 'Get started with no cost. Try posting your first job.',
    price: '$0',
    period: '/Monthly',
    features: [
      'Post 1 Job',
      'Basic Job Listing',
      'Access & Saved 3 Candidates',
      '5 Days Resume Visibility',
    ],
    recommended: false,
  },
  {
    name: 'BASIC',
    description: 'Perfect for startups and small teams looking to post their first job.',
    price: '$19',
    period: '/Monthly',
    features: [
      'Post 1 Job',
      'Urgent & Featured Jobs',
      'Highlights Job with Colors',
      'Access & Saved 5 Candidates',
      '10 Days Resume Visibility',
      '24/7 Critical Support',
    ],
    recommended: false,
  },
  {
    name: 'STANDARD',
    description: 'Ideal for growing companies with multiple hiring needs.',
    price: '$39',
    period: '/Monthly',
    features: [
      '3 Active Jobs',
      'Urgent & Featured Jobs',
      'Highlights Job with Colors',
      'Access & Saved 10 Candidates',
      '20 Days Resume Visibility',
      '24/7 Critical Support',
    ],
    recommended: true,
  },
  {
    name: 'PREMIUM',
    description: 'For large enterprises with high-volume recruitment requirements.',
    price: '$59',
    period: '/Monthly',
    features: [
      '6 Active Jobs',
      'Urgent & Featured Jobs',
      'Highlights Job with Colors',
      'Access & Saved 20 Candidates',
      '30 Days Resume Visibility',
      '24/7 Critical Support',
    ],
    recommended: false,
  },
];

export default function PricingScreen() {
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

  if (user?.role !== 'recruiter' && user?.role !== 'admin') {
    return <Redirect href="/unauthorized" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-3xl font-bold text-white">Buy Premium Subscription to Post a Job</Text>
      <Text className="mt-3 text-base leading-6 text-white/60">
        Unlock advanced AI matching, featured job listings, and direct access to top-tier candidates. Choose a plan
        that scales with your hiring needs.
      </Text>

      <View className="mt-10 gap-6">
        {PLANS.map((plan) => (
          <View
            key={plan.name}
            className="rounded-2xl border p-5"
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
            <Text className="mt-2 min-h-[48px] text-sm leading-5 text-white/70">{plan.description}</Text>
            <Text className="mt-4 text-4xl font-bold" style={{ color: brand.accent }}>
              {plan.price}
              <Text className="text-base font-normal text-white/40">{plan.period}</Text>
            </Text>
            <View className="my-4 h-px bg-white/10" />
            <View className="gap-3">
              {plan.features.map((f) => (
                <Text key={f} className="text-sm text-white/80">
                  ✓ {f}
                </Text>
              ))}
            </View>
            <Pressable
              onPress={() => router.push({ pathname: '/contact', params: { intent: 'recruiter-plan' } })}
              className="mt-6 items-center rounded-xl py-4"
              style={{
                backgroundColor: plan.recommended ? brand.accent : brand.surface2,
                borderWidth: plan.recommended ? 0 : 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}>
              <Text className="font-bold" style={{ color: plan.recommended ? brand.bg : brand.text }}>
                Choose plan
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
