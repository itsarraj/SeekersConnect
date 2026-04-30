import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { brand } from '@/constants/brand';

export default function ContactScreen() {
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (intent === 'upgrade') setSubject('Upgrade to Premium - Candidate');
    else if (intent === 'recruiter-plan') setSubject('Employer subscription / pricing');
  }, [intent]);

  const send = () => {
    Alert.alert('Message', 'This demo form does not send mail. Reach support@matchmyresume.com.');
  };

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-8" keyboardShouldPersistTaps="handled">
      <Text className="text-center text-3xl font-bold" style={{ color: brand.accent }}>
        Contact us
      </Text>
      <View className="mt-8 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
        <Text className="text-sm text-white/80">Name</Text>
        <TextInput className="mt-1 rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white" />
        <Text className="mt-4 text-sm text-white/80">Email</Text>
        <TextInput
          className="mt-1 rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text className="mt-4 text-sm text-white/80">Subject</Text>
        <TextInput
          className="mt-1 rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
          value={subject}
          onChangeText={setSubject}
        />
        <Text className="mt-4 text-sm text-white/80">Message</Text>
        <TextInput
          className="mt-1 min-h-[120px] rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
          multiline
        />
        <Pressable
          onPress={send}
          className="mt-6 items-center rounded-xl py-4"
          style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Send message
          </Text>
        </Pressable>
      </View>
      <Text className="mt-10 text-center text-lg font-bold" style={{ color: brand.accent }}>
        Other ways to reach us
      </Text>
      <Text className="mt-4 text-center text-white/70">support@matchmyresume.com</Text>
      <Text className="text-center text-white/70">+1 (555) 123-4567</Text>
    </ScrollView>
  );
}
