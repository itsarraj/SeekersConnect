import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { bffApi, type Job } from '@/services/bffApi';
import { formatSalary, timeAgo } from '@/utils/jobFormat';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setJob(await bffApi.getJob(String(id)));
      } catch {
        setError('Job not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'user' || !job) return;
    bffApi.getMyApplications(user.id).then((apps) => {
      setApplied(apps.some((a) => a.job_id === job.id));
    });
  }, [isAuthenticated, user, job?.id]);

  const handleApply = async () => {
    if (!user?.id || !job) return;
    setApplying(true);
    try {
      await bffApi.applyToJob(user.id, job.id);
      setApplied(true);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b]">
        <ActivityIndicator color={brand.accent} size="large" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b] px-6">
        <Text className="text-lg text-white/70">{error || 'Job not found'}</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl px-6 py-3"
          style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-6">
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <Text style={{ color: brand.accent }}>← Back</Text>
      </Pressable>

      <View className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <View className="flex-row gap-4">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#2b2b2b]">
            {job.company_logo_url ? (
              <Image source={{ uri: job.company_logo_url }} className="h-full w-full" contentFit="cover" />
            ) : (
              <Text className="text-3xl font-bold" style={{ color: brand.accent }}>
                {job.company_name.charAt(0)}
              </Text>
            )}
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base text-white/70">{job.company_name}</Text>
            <Text className="text-2xl font-bold text-white">{job.position_title}</Text>
            <Text className="mt-1 text-sm text-white/50">{job.location}</Text>
            <Text className="text-sm text-white/50">{timeAgo(job.posted_at)}</Text>
            <Text className="mt-1 text-sm text-white/50">
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </Text>
            <View className="mt-2 self-start rounded-full px-3 py-1" style={{ backgroundColor: `${brand.accent}22` }}>
              <Text className="text-xs font-semibold" style={{ color: brand.accent }}>
                {job.employment_type}
              </Text>
            </View>
          </View>
        </View>

        {isAuthenticated && user?.role === 'user' && (
          <Pressable
            onPress={handleApply}
            disabled={applied || applying}
            className="mt-6 items-center rounded-xl py-4"
            style={{
              backgroundColor: brand.accent,
              opacity: applied || applying ? 0.6 : 1,
            }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              {applied ? 'Applied' : applying ? 'Applying…' : 'Apply now'}
            </Text>
          </Pressable>
        )}

        <View className="my-6 h-px bg-white/10" />
        <Text className="text-lg font-bold text-white">Job description</Text>
        <Text className="mt-2 text-sm leading-6 text-white/80">{job.description || 'No description available.'}</Text>
      </View>
    </ScrollView>
  );
}
