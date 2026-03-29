import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterModal } from '@/components/FilterModal';
import { JobCard } from '@/components/JobCard';
import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { bffApi, type Job } from '@/services/bffApi';
import { DEFAULT_JOBS_FILTER, type JobsFilterState } from '@/types/filters';
import { filterJobs } from '@/utils/filterJobs';

const BATCH_SIZE = 50;
const PAGE_SIZE = 10;

export default function JobsTabScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<JobsFilterState>(DEFAULT_JOBS_FILTER);
  const [clientPage, setClientPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      bffApi.getMyApplications(user.id).then((apps) => {
        setAppliedJobIds(new Set(apps.map((a) => a.job_id)));
      });
    }
  }, [isAuthenticated, user]);

  const fetchBatch = async (page: number, append: boolean) => {
    const res = await bffApi.getJobs({ page, limit: BATCH_SIZE });
    if (append) {
      setAllJobs((prev) => [...prev, ...res.jobs]);
    } else {
      setAllJobs(res.jobs);
    }
    setServerTotal(res.total_count);
    setNextPage(page + 1);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchBatch(1, false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    if (loadingMore || allJobs.length >= serverTotal) return;
    setLoadingMore(true);
    try {
      await fetchBatch(nextPage, true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setClientPage(1);
  }, [filter]);

  const filteredJobs = useMemo(() => filterJobs(allJobs, filter), [allJobs, filter]);
  const totalClientPages = Math.ceil(filteredJobs.length / PAGE_SIZE) || 1;
  const paginatedJobs = useMemo(
    () => filteredJobs.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE),
    [filteredJobs, clientPage]
  );

  const handleApply = useCallback(
    async (jobId: string) => {
      if (!user?.id) return;
      await bffApi.applyToJob(user.id, jobId);
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
    },
    [user?.id]
  );

  return (
    <View className="flex-1 bg-[#2b2b2b]">
      <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-3">
        <Text className="text-lg font-bold text-white">
          {serverTotal > 0 ? serverTotal.toLocaleString('en-IN') : filteredJobs.length} jobs
        </Text>
        <Pressable
          onPress={() => setFilterOpen(true)}
          className="rounded-lg border border-white/10 px-4 py-2">
          <Text className="font-medium text-white">Filters</Text>
        </Pressable>
      </View>

      <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} filter={filter} onChange={setFilter} />

      {loading ? (
        <ActivityIndicator className="mt-12" color={brand.accent} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) {
              void loadMore();
            }
          }}
          scrollEventThrottle={400}>
          {paginatedJobs.map((job) => (
            <Pressable key={job.id} onPress={() => router.push(`/job/${job.id}`)}>
              <JobCard
                job={job}
                onApply={isAuthenticated && user?.role === 'user' ? handleApply : undefined}
                applied={appliedJobIds.has(job.id)}
              />
            </Pressable>
          ))}
          {paginatedJobs.length === 0 ? (
            <Text className="text-center text-white/50">No jobs match these filters.</Text>
          ) : null}
          {totalClientPages > 1 ? (
            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2">
              <Pressable
                onPress={() => setClientPage((p) => Math.max(1, p - 1))}
                disabled={clientPage <= 1}
                className="rounded-lg px-4 py-2"
                style={{ backgroundColor: brand.surface }}>
                <Text className="text-white">Prev</Text>
              </Pressable>
              <Text className="text-white/70">
                Page {clientPage} / {totalClientPages}
              </Text>
              <Pressable
                onPress={() => setClientPage((p) => Math.min(totalClientPages, p + 1))}
                disabled={clientPage >= totalClientPages}
                className="rounded-lg px-4 py-2"
                style={{ backgroundColor: brand.surface }}>
                <Text className="text-white">Next</Text>
              </Pressable>
            </View>
          ) : null}
          {loadingMore ? <ActivityIndicator color={brand.accent} /> : null}
        </ScrollView>
      )}
    </View>
  );
}
