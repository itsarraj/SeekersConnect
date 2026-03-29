import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import type { Job } from '@/services/bffApi';
import { formatSalary, timeAgo } from '@/utils/jobFormat';

type Props = {
  job: Job;
  onApply?: (jobId: string) => void | Promise<void>;
  applied?: boolean;
  applying?: boolean;
};

export function JobCard({ job, onApply, applied, applying }: Props) {
  const isNew = Date.now() - new Date(job.posted_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <View
      className="flex-row gap-4 rounded-xl border border-white/5 bg-[#1a1a1a] p-4"
      style={{ borderColor: brand.border }}>
      <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-lg bg-[#2b2b2b]">
        {job.company_logo_url ? (
          <Image source={{ uri: job.company_logo_url }} className="h-full w-full" contentFit="cover" />
        ) : (
          <Text className="text-2xl font-bold" style={{ color: brand.accent }}>
            {job.company_name.charAt(0)}
          </Text>
        )}
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="text-base text-white/70">{job.company_name}</Text>
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              <Text className="text-xl font-semibold text-white">{job.position_title}</Text>
              {isNew && (
                <View className="rounded bg-[#fcc636]/10 px-1.5 py-0.5">
                  <Text className="text-xs font-medium" style={{ color: brand.accent }}>
                    New post
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
          <Text className="text-base text-white/60">{job.location}</Text>
          <Text className="text-base text-white/60">{timeAgo(job.posted_at)}</Text>
        </View>
        <Text className="mt-1 text-sm text-white/50">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </Text>
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <View className="rounded-full bg-[#fcc636]/10 px-3 py-1">
            <Text className="text-xs font-semibold" style={{ color: brand.accent }}>
              {job.employment_type}
            </Text>
          </View>
          {onApply && (
            <Pressable
              onPress={() => !applied && !applying && onApply(job.id)}
              disabled={applied || applying}
              className="rounded-lg px-4 py-2"
              style={{
                backgroundColor: applied ? brand.surface2 : brand.accent,
                opacity: applied || applying ? 0.6 : 1,
              }}>
              <Text
                className="text-sm font-bold"
                style={{ color: applied ? brand.text : brand.bg }}>
                {applied ? 'Applied' : applying ? 'Applying…' : 'Apply'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
