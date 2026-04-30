import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

export default function CheckoutScreen() {
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const label = typeof plan === 'string' && plan.length > 0 ? plan : 'Premium';

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-10">
      <View className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
        <Text className="text-center text-2xl font-bold text-white">Complete your subscription</Text>
        <Text className="mt-3 text-center text-white/60">
          You selected: <Text style={{ color: brand.accent, fontWeight: '600' }}>{label}</Text>
        </Text>

        <View className="mt-8 rounded-xl border border-white/10 bg-[#2b2b2b] p-5">
          <Text className="text-lg font-bold text-white">Next steps</Text>
          <View className="mt-4 gap-4">
            {[
              'Payment integration coming soon',
              'You will receive a confirmation email',
              'Premium features unlock immediately',
            ].map((step, i) => (
              <View key={step} className="flex-row items-start gap-3">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${brand.accent}33` }}>
                  <Text className="text-xs font-bold" style={{ color: brand.accent }}>
                    {i + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-sm leading-5 text-white/80">{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-8 gap-3">
          <Pressable
            onPress={() => router.push('/upgrade')}
            className="items-center rounded-xl border border-white/15 py-4">
            <Text className="font-bold text-white">Back to plans</Text>
          </Pressable>
          <Pressable disabled className="items-center rounded-xl py-4 opacity-60" style={{ backgroundColor: brand.accent }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              Proceed to payment (coming soon)
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
