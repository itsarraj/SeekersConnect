import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

const PLANS = [
  {
    name: 'FREE (NEW)',
    description: 'Try posting your first job.',
    price: '$0',
    period: '/mo',
    features: ['Post 1 Job', 'Basic listing', '3 saved candidates', '5 days visibility'],
    recommended: false,
  },
  {
    name: 'BASIC',
    description: 'Small teams.',
    price: '$19',
    period: '/mo',
    features: ['1 Job', 'Urgent & featured', '5 candidates', '10 days visibility', 'Support'],
    recommended: false,
  },
  {
    name: 'STANDARD',
    description: 'Growing companies.',
    price: '$39',
    period: '/mo',
    features: ['3 Jobs', 'Featured', '10 candidates', '20 days visibility', '24/7 support'],
    recommended: true,
  },
  {
    name: 'PREMIUM',
    description: 'High volume hiring.',
    price: '$59',
    period: '/mo',
    features: ['6 Jobs', 'Featured', '20 candidates', '30 days visibility', '24/7 support'],
    recommended: false,
  },
];

export default function PricingScreen() {
  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-3xl font-bold text-white">Recruiter pricing</Text>
      <Text className="mt-3 text-base leading-6 text-white/60">
        Buy a premium subscription to post jobs and unlock AI matching for employers.
      </Text>
      <View className="mt-8 gap-6">
        {PLANS.map((plan) => (
          <View
            key={plan.name}
            className="rounded-2xl border p-5"
            style={{
              borderColor: plan.recommended ? brand.accent : 'rgba(255,255,255,0.1)',
              backgroundColor: '#1a1a1a',
            }}>
            {plan.recommended ? (
              <Text className="mb-2 text-xs font-bold uppercase" style={{ color: brand.accent }}>
                Recommended
              </Text>
            ) : null}
            <Text className="text-xl font-bold text-white">{plan.name}</Text>
            <Text className="mt-1 text-sm text-white/60">{plan.description}</Text>
            <Text className="mt-4 text-3xl font-black text-white">
              {plan.price}
              <Text className="text-base font-normal text-white/50">{plan.period}</Text>
            </Text>
            <View className="mt-4 gap-2">
              {plan.features.map((f) => (
                <Text key={f} className="text-sm text-white/80">
                  ✓ {f}
                </Text>
              ))}
            </View>
            <Pressable
              onPress={() => router.push('/contact?intent=upgrade')}
              className="mt-6 items-center rounded-xl py-3"
              style={{ backgroundColor: plan.recommended ? brand.accent : brand.surface2 }}>
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
