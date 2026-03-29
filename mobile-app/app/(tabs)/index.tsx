import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { bffApi, type Job, type Stats } from '@/services/bffApi';
import { formatNumber } from '@/utils/jobFormat';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    bffApi.getStats().then(setStats).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffApi.getJobs({ limit: 20, page: 1 });
      setJobs(res.jobs);
      if (isAuthenticated && user?.role === 'user') {
        const suggested = await bffApi.getSuggestedJobs(user.id);
        setSuggestedJobs(suggested);
      } else {
        setSuggestedJobs([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    load();
  }, [load]);

  const isCandidate = isAuthenticated && user?.role === 'user';
  const displayJobs = isCandidate ? suggestedJobs : jobs;
  const featured = displayJobs.slice(0, 4);

  return (
    <ScrollView
      className="flex-1 bg-[#2b2b2b]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View className="border-b border-white/5 bg-[#1a1a1a] px-4 pb-8 pt-4">
        <Text className="text-3xl font-bold leading-tight text-white">
          Find your <Text style={{ color: brand.accent }}>new job</Text> today
        </Text>
        <Text className="mt-3 text-base text-white/70">
          Thousands of roles in tech and engineering — browse listings or sign in for AI matches.
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/jobs')}
          className="mt-6 items-center rounded-xl py-4"
          style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Browse all jobs
          </Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row flex-wrap gap-3 px-4">
        {[
          { label: 'Live jobs', value: stats?.live_jobs, accent: false },
          { label: 'Companies', value: stats?.companies, accent: true },
          { label: 'Candidates', value: stats?.candidates, accent: false },
          { label: 'New jobs', value: stats?.new_jobs, accent: false },
        ].map((s) => (
          <View
            key={s.label}
            className="min-w-[45%] flex-1 rounded-xl border border-white/10 p-4"
            style={{ backgroundColor: s.accent ? brand.accent : brand.surface }}>
            <Text
              className="text-2xl font-bold"
              style={{ color: s.accent ? brand.bg : brand.text }}>
              {s.value != null ? formatNumber(s.value) : '—'}
            </Text>
            <Text
              className="text-xs uppercase tracking-wide"
              style={{ color: s.accent ? `${brand.bg}99` : brand.muted }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <Text className="mt-8 px-4 text-xl font-bold text-white">
        {isCandidate ? 'Suggested for you' : 'Featured jobs'}
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-8" color={brand.accent} />
      ) : isCandidate && displayJobs.length === 0 ? (
        <View className="mx-4 mt-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <Text className="text-center text-white/60">
            Upload your resume in Profile to get personalized AI job matches.
          </Text>
          <Pressable
            onPress={() => router.push('/profile')}
            className="mt-4 items-center rounded-xl py-3"
            style={{ backgroundColor: brand.accent }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              Go to profile
            </Text>
          </Pressable>
        </View>
      ) : featured.length === 0 ? (
        <Text className="mt-4 px-4 text-white/50">No jobs available right now.</Text>
      ) : (
        <View className="mt-4 gap-4 px-4">
          {featured.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push(`/job/${job.id}`)}
              className="rounded-xl border border-white/5 bg-[#1a1a1a] p-4">
              <View className="flex-row gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-lg bg-[#2b2b2b]">
                  {job.company_logo_url ? (
                    <Image source={{ uri: job.company_logo_url }} className="h-full w-full rounded-lg" />
                  ) : (
                    <Text className="text-xl font-bold" style={{ color: brand.accent }}>
                      {job.company_name.charAt(0)}
                    </Text>
                  )}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm text-white/70">{job.company_name}</Text>
                  <Text className="text-lg font-bold text-white">{job.position_title}</Text>
                  <Text className="text-sm text-white/50">{job.location}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
