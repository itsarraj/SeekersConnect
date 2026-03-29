import { ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

export default function AboutScreen() {
  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8">
      <Text className="text-center text-3xl font-bold" style={{ color: brand.accent }}>
        About MatchMyResume
      </Text>
      <Text className="mt-6 text-lg leading-7 text-white/90">
        MatchMyResume is revolutionizing the way people find jobs by leveraging AI to match resumes with the right
        opportunities.
      </Text>
      <Text className="mt-6 text-xl font-bold" style={{ color: brand.accent }}>
        Our mission
      </Text>
      <Text className="mt-2 text-base leading-6 text-white/80">
        To make job searching easier, faster, and more effective for everyone.
      </Text>
      <Text className="mt-6 text-xl font-bold" style={{ color: brand.accent }}>
        How we work
      </Text>
      <Text className="mt-2 text-base leading-6 text-white/80">
        We analyze resumes, job descriptions, and preferences to surface highly relevant matches — not just keywords.
      </Text>
      <Text className="mt-6 text-xl font-bold" style={{ color: brand.accent }}>
        Why choose us
      </Text>
      <View className="mt-2 gap-2">
        {[
          'Advanced AI matching',
          'Real-time market insights',
          'Personalized recommendations',
          'Application tracking',
        ].map((line) => (
          <Text key={line} className="text-base text-white/80">
            • {line}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}
