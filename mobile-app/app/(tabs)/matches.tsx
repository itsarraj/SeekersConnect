import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterModal } from '@/components/FilterModal';
import { JobCard } from '@/components/JobCard';
import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { bffApi, type Job } from '@/services/bffApi';
import { DEFAULT_JOBS_FILTER, type JobsFilterState } from '@/types/filters';
import { filterJobs } from '@/utils/filterJobs';

const MOCK_JOBS: Job[] = [
  {
    id: 'mock-1',
    company_name: 'Google',
    company_logo_url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
    position_title: 'Sr. Software Engineer',
    location: 'Bangalore, India',
    employment_type: 'Full-time',
    salary_min: 120000,
    salary_max: 180000,
    salary_currency: 'USD',
    description: 'Cloud infrastructure team...',
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    company_name: 'Meta',
    position_title: 'Product Designer',
    location: 'Menlo Park, CA',
    employment_type: 'Full-time',
    salary_min: 140000,
    salary_max: 200000,
    salary_currency: 'USD',
    description: 'Design team...',
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    company_name: 'Amazon',
    position_title: 'Backend Engineer',
    location: 'Seattle, WA',
    employment_type: 'Contract',
    salary_min: 130000,
    salary_max: 170000,
    salary_currency: 'USD',
    description: 'Rust and AWS...',
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    company_name: 'Netflix',
    position_title: 'Full Stack Developer',
    location: 'Los Gatos, CA',
    employment_type: 'Full-time',
    salary_min: 150000,
    salary_max: 250000,
    salary_currency: 'USD',
    description: 'Content delivery...',
    posted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function AIMatchesTabScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [suggested, setSuggested] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobsFilterState>(DEFAULT_JOBS_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  const isPremium = false;

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'user') {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [jobs, apps] = await Promise.all([
          bffApi.getSuggestedJobs(user.id),
          bffApi.getMyApplications(user.id),
        ]);
        setSuggested(jobs);
        setAppliedJobIds(new Set(apps.map((a) => a.job_id)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const rawList = suggested.length > 0 ? suggested : MOCK_JOBS;
  const filtered = useMemo(() => filterJobs(rawList, filter), [rawList, filter]);
  const displayed = useMemo(
    () => (isPremium ? filtered : filtered.slice(0, 3)),
    [filtered, isPremium]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b]">
        <ActivityIndicator color={brand.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b] px-6">
        <Text className="text-center text-lg text-white/80">Sign in to see AI job matches.</Text>
        <Pressable
          onPress={() => router.push('/login')}
          className="mt-6 rounded-xl px-8 py-4"
          style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Log in
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }
  if (user.role !== 'user') {
    return <Redirect href="/unauthorized" />;
  }

  const handleApply = async (jobId: string) => {
    if (!user.id || jobId.startsWith('mock-')) return;
    setApplyingId(jobId);
    try {
      await bffApi.applyToJob(user.id, jobId);
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <View className="flex-1 bg-[#2b2b2b]">
      <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-3">
        <Text className="text-xl font-bold text-white">✨ AI Matches</Text>
        <Pressable onPress={() => setFilterOpen(true)} className="rounded-lg border border-white/10 px-3 py-2">
          <Text className="text-white">Filters</Text>
        </Pressable>
      </View>
      <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} filter={filter} onChange={setFilter} />

      {!isPremium && (
        <View className="mx-4 mt-4 rounded-xl p-4" style={{ backgroundColor: brand.accent }}>
          <Text className="font-bold" style={{ color: brand.bg }}>
            Upgrade to Premium to unlock all {filtered.length} matches.
          </Text>
          <Pressable
            onPress={() => router.push('/pricing')}
            className="mt-3 items-center rounded-lg py-3"
            style={{ backgroundColor: brand.bg }}>
            <Text className="text-sm font-bold text-white">View plans</Text>
          </Pressable>
        </View>
      )}

      {loading && suggested.length === 0 ? (
        <ActivityIndicator className="mt-12" color={brand.accent} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}>
          {displayed.map((job) => (
            <Pressable key={job.id} onPress={() => !job.id.startsWith('mock-') && router.push(`/job/${job.id}`)}>
              <JobCard
                job={job}
                onApply={job.id.startsWith('mock-') ? undefined : handleApply}
                applied={appliedJobIds.has(job.id)}
                applying={applyingId === job.id}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
