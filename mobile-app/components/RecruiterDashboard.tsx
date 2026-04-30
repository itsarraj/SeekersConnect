import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { brand } from '@/constants/brand';
import { EMPLOYER_SIGNUP_STORAGE_KEY } from '@/constants/config';
import { useAuth } from '@/contexts/AuthContext';
import {
  bffApi,
  type Application,
  type Company,
  type CreateCompanyRequest,
  type CreateJobRequest,
  type EmployerProfile,
  type Job,
} from '@/services/bffApi';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'CHF', 'JPY'] as const;
const TEST_COMPANY_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

const JOB_DESC_PLACEHOLDER = `## The Role
2-3 sentences on what this role is about.

## What You'll Do
• Responsibility 1

## What We're Looking For
• Must-have 1`;

const APP_STATUSES = ['applied', 'shortlisted', 'rejected', 'hired'] as const;

export function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'create-job' | 'applications' | 'company'>('create-job');
  const [companyTab, setCompanyTab] = useState<'create' | 'details'>('create');

  const [company, setCompany] = useState<Company | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [companySuccess, setCompanySuccess] = useState<string | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);
  const [createdJobs, setCreatedJobs] = useState<Job[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [recruiterJobsLoading, setRecruiterJobsLoading] = useState(false);
  const [applicationsJobId, setApplicationsJobId] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    logo_url: '',
    website: '',
    about: '',
    industry: '',
    employee_size: '',
    head_office: '',
    company_type: '',
    since: '',
    specialization: '',
  });

  const [jobForm, setJobForm] = useState({
    position_title: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    salary_period: 'yearly',
    description: '',
    employment_type: 'Full-time',
    location: 'Remote',
    tags: '',
  });

  const companyNameForFilter = company?.name ?? employerProfile?.company_name ?? null;

  useEffect(() => {
    if (!user?.id || (user.role !== 'recruiter' && user.role !== 'admin')) return;
    (async () => {
      const profile = await bffApi.getEmployerProfile();
      if (profile) {
        setEmployerProfile(profile);
        if (profile.company_id) {
          let c = await bffApi.getEmployerCompany();
          if (!c) c = await bffApi.getCompany(profile.company_id).catch(() => null);
          if (c) {
            setCompany(c);
            setCompanyDetails(c);
            setCompanyTab('details');
          }
        }
      } else if (user.email === 'recruiter@test.com') {
        setEmployerProfile({
          user_id: user.id,
          company_name: 'Test Company',
          company_id: TEST_COMPANY_ID,
          job_title: 'HR Manager',
          mobile: '+1234567890',
          company_type: 'direct',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        const c = await bffApi.getCompany(TEST_COMPANY_ID).catch(() => null);
        if (c) {
          setCompany(c);
          setCompanyDetails(c);
          setCompanyTab('details');
        }
      }
    })();
  }, [user?.id, user?.role, user?.email]);

  useEffect(() => {
    if (company?.id && companyTab === 'details') {
      if (companyDetails?.id === company.id) return;
      setCompanyLoading(true);
      setCompanyError(null);
      bffApi
        .getCompany(company.id)
        .then(setCompanyDetails)
        .catch((e) => setCompanyError(e instanceof Error ? e.message : 'Failed to load company'))
        .finally(() => setCompanyLoading(false));
    } else {
      setCompanyDetails(company ?? null);
    }
  }, [company?.id, companyTab]);

  useEffect(() => {
    if (activeTab !== 'applications') return;
    setRecruiterJobsLoading(true);
    bffApi
      .getJobs({ limit: 100, page: 1 })
      .then((res) => {
        let jobs = companyNameForFilter
          ? res.jobs.filter((j) => j.company_name === companyNameForFilter)
          : res.jobs;
        if (companyNameForFilter && jobs.length === 0) jobs = res.jobs;
        setRecruiterJobs(jobs);
      })
      .catch(() => setRecruiterJobs([]))
      .finally(() => setRecruiterJobsLoading(false));
  }, [activeTab, companyNameForFilter]);

  useEffect(() => {
    if (activeTab !== 'applications' || recruiterJobsLoading) return;
    const jobs = companyNameForFilter
      ? recruiterJobs.filter((j) => j.company_name === companyNameForFilter)
      : recruiterJobs;
    const first = [...createdJobs, ...jobs.filter((j) => !createdJobs.some((c) => c.id === j.id))][0];
    if (first && !applicationsJobId.trim()) setApplicationsJobId(first.id);
  }, [activeTab, recruiterJobsLoading, recruiterJobs, createdJobs, companyNameForFilter, applicationsJobId]);

  const isValidJobId = (id: string) => /^[0-9a-f-]{36}$/i.test(id.trim());

  useEffect(() => {
    if (activeTab !== 'applications' || !applicationsJobId.trim() || !isValidJobId(applicationsJobId) || !user?.id)
      return;
    setApplications([]);
    setApplicationsLoading(true);
    setApplicationsError(null);
    const jobId = applicationsJobId.trim();
    bffApi
      .getJobApplications(user.id, jobId)
      .then(setApplications)
      .catch((e) => {
        setApplicationsError(e instanceof Error ? e.message : 'Failed to load applications');
        setApplications([]);
      })
      .finally(() => setApplicationsLoading(false));
  }, [activeTab, applicationsJobId, user?.id]);

  useEffect(() => {
    if (companyTab === 'create' && company) {
      setCompanyForm({
        name: company.name ?? '',
        logo_url: company.logo_url ?? '',
        website: company.website ?? '',
        about: company.about ?? '',
        industry: company.industry ?? '',
        employee_size: company.employee_size ?? '',
        head_office: company.head_office ?? '',
        company_type: company.company_type ?? '',
        since: company.since != null ? String(company.since) : '',
        specialization: Array.isArray(company.specialization)
          ? company.specialization.join(', ')
          : (company.specialization ?? ''),
      });
    }
  }, [companyTab, company]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const stored = await AsyncStorage.getItem(EMPLOYER_SIGNUP_STORAGE_KEY);
      if (!stored) return;
      try {
        const data = JSON.parse(stored) as {
          companyName?: string;
          role?: string;
          mobile?: string;
          companyType?: string;
        };
        await bffApi.upsertEmployerProfile({
          company_name: data.companyName ?? '',
          job_title: data.role || undefined,
          mobile: data.mobile || undefined,
          company_type: data.companyType ?? 'direct',
        });
        setCompanyForm((prev) => ({
          ...prev,
          name: data.companyName ?? prev.name,
          company_type:
            data.companyType === 'agency'
              ? 'Agency'
              : data.companyType === 'direct'
                ? 'Direct'
                : prev.company_type,
        }));
        setActiveTab('company');
        setCompanyTab('create');
      } catch (e) {
        console.error(e);
      } finally {
        await AsyncStorage.removeItem(EMPLOYER_SIGNUP_STORAGE_KEY);
      }
    })();
  }, [user?.id]);

  const handleCreateCompany = async () => {
    setCompanyError(null);
    setCompanySuccess(null);
    if (!companyForm.name.trim()) {
      setCompanyError('Company name is required');
      return;
    }
    setCompanyLoading(true);
    try {
      const payload: CreateCompanyRequest = {
        name: companyForm.name.trim(),
        logo_url: companyForm.logo_url.trim() || undefined,
        website: companyForm.website.trim() || undefined,
        about: companyForm.about.trim() || undefined,
        industry: companyForm.industry.trim() || undefined,
        employee_size: companyForm.employee_size.trim() || undefined,
        head_office: companyForm.head_office.trim() || undefined,
        company_type: companyForm.company_type.trim() || undefined,
        since: companyForm.since ? parseInt(companyForm.since, 10) : undefined,
        specialization: companyForm.specialization.trim()
          ? companyForm.specialization.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
          : undefined,
      };
      const created = await bffApi.createCompany(payload);
      setCompany(created);
      setCompanyDetails(created);
      await bffApi.upsertEmployerProfile({
        company_name: created.name,
        company_id: created.id,
        company_type: (employerProfile?.company_type ?? companyForm.company_type) || 'direct',
        job_title: employerProfile?.job_title,
        mobile: employerProfile?.mobile,
      });
      setEmployerProfile((p) => p && { ...p, company_id: created.id, company_name: created.name });
      setCompanySuccess('Company created successfully');
      setCompanyTab('details');
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCreateJob = async () => {
    setJobError(null);
    setJobSuccess(null);
    if (!company?.id) {
      setJobError('Create a company first');
      return;
    }
    if (!jobForm.position_title.trim()) {
      setJobError('Job position is required');
      return;
    }
    setJobLoading(true);
    try {
      const minRaw = jobForm.salary_min ? parseInt(jobForm.salary_min.replace(/\D/g, ''), 10) : undefined;
      const maxRaw = jobForm.salary_max ? parseInt(jobForm.salary_max.replace(/\D/g, ''), 10) : undefined;
      const minNum = minRaw != null ? minRaw * 1000 : undefined;
      const maxNum = maxRaw != null ? maxRaw * 1000 : undefined;
      const payload: CreateJobRequest = {
        company_id: company.id,
        position_title: jobForm.position_title.trim(),
        location: jobForm.location,
        employment_type: jobForm.employment_type,
        salary_min: minNum,
        salary_max: maxNum,
        salary_currency: jobForm.salary_currency,
        salary_period: jobForm.salary_period,
        description: jobForm.description.trim() || undefined,
        tags: jobForm.tags.trim() ? jobForm.tags.split(/[,\s]+/).filter(Boolean) : undefined,
      };
      const created = await bffApi.createJob(payload);
      setCreatedJobs((prev) => [created, ...prev]);
      setJobSuccess('Job created successfully');
      setJobForm((f) => ({ ...f, position_title: '', description: '', salary_min: '', salary_max: '' }));
    } catch (err) {
      setJobError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setJobLoading(false);
    }
  };

  const updateAppStatus = useCallback(
    async (appId: string, status: string) => {
      if (!user?.id) return;
      try {
        const updated = await bffApi.updateApplication(user.id, appId, status);
        setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      } catch (e) {
        console.error(e);
      }
    },
    [user?.id]
  );

  const jobOptions = useMemo(
    () => [...createdJobs, ...recruiterJobs.filter((j) => !createdJobs.some((c) => c.id === j.id))],
    [createdJobs, recruiterJobs]
  );

  const inputClass = 'mt-1 rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white';

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b]" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-2xl font-bold text-white">Hello {user?.name || 'there'} 👋</Text>
      <Pressable
        onPress={() => router.push('/pricing')}
        className="mt-3 self-start rounded-lg border px-4 py-2"
        style={{ borderColor: brand.accent }}>
        <Text className="text-sm font-bold" style={{ color: brand.accent }}>
          Recruiter pricing
        </Text>
      </Pressable>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {(['create-job', 'applications', 'company'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setActiveTab(t)}
            className="rounded-lg px-4 py-3"
            style={{
              backgroundColor: activeTab === t ? brand.surface : brand.accent,
              borderWidth: activeTab === t ? 1 : 0,
              borderColor: brand.accent,
            }}>
            <Text
              className="font-bold capitalize"
              style={{ color: activeTab === t ? brand.accent : brand.bg }}>
              {t === 'create-job' ? 'Create job' : t}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'company' && (
        <View className="mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          <View className="mb-4 flex-row gap-2">
            <Pressable
              onPress={() => setCompanyTab('create')}
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: companyTab === 'create' ? brand.accent : brand.bg }}>
              <Text style={{ color: companyTab === 'create' ? brand.bg : brand.text }}>Create / edit</Text>
            </Pressable>
            <Pressable
              onPress={() => setCompanyTab('details')}
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: companyTab === 'details' ? brand.accent : brand.bg }}>
              <Text style={{ color: companyTab === 'details' ? brand.bg : brand.text }}>Details</Text>
            </Pressable>
          </View>
          {companyError ? <Text className="mb-2 text-red-400">{companyError}</Text> : null}
          {companySuccess ? <Text className="mb-2 text-green-400">{companySuccess}</Text> : null}
          {companyTab === 'details' && companyDetails ? (
            companyLoading ? (
              <ActivityIndicator color={brand.accent} />
            ) : (
              <View className="gap-2">
                <Text className="text-xl font-bold text-white">{companyDetails.name}</Text>
                <Text className="text-white/70">{companyDetails.about || 'No description'}</Text>
              </View>
            )
          ) : (
            <View className="gap-3">
              {(['name', 'website', 'industry', 'head_office', 'about'] as const).map((field) => (
                <View key={field}>
                  <Text className="text-sm text-white/70">{field}</Text>
                  <TextInput
                    className={inputClass}
                    placeholderTextColor="#888"
                    value={companyForm[field]}
                    onChangeText={(v) => setCompanyForm((f) => ({ ...f, [field]: v }))}
                    multiline={field === 'about'}
                  />
                </View>
              ))}
              <Pressable
                onPress={handleCreateCompany}
                disabled={companyLoading}
                className="mt-2 items-center rounded-xl py-4"
                style={{ backgroundColor: brand.accent }}>
                <Text className="font-bold" style={{ color: brand.bg }}>
                  {companyLoading ? 'Saving…' : 'Save company'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {activeTab === 'create-job' && (
        <View className="mt-6 gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          {!company && <Text style={{ color: brand.accent }}>Create a company in Company tab first.</Text>}
          {jobError ? <Text className="text-red-400">{jobError}</Text> : null}
          {jobSuccess ? <Text className="text-green-400">{jobSuccess}</Text> : null}
          <Text className="text-sm text-white/70">Position</Text>
          <TextInput
            className={inputClass}
            placeholderTextColor="#888"
            placeholder="Senior Software Engineer"
            value={jobForm.position_title}
            onChangeText={(v) => setJobForm((f) => ({ ...f, position_title: v }))}
          />
          <Text className="text-sm text-white/70">Salary min / max (thousands)</Text>
          <View className="flex-row gap-2">
            <TextInput
              className={`${inputClass} flex-1`}
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={jobForm.salary_min}
              onChangeText={(v) => setJobForm((f) => ({ ...f, salary_min: v.replace(/\D/g, '') }))}
            />
            <TextInput
              className={`${inputClass} flex-1`}
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={jobForm.salary_max}
              onChangeText={(v) => setJobForm((f) => ({ ...f, salary_max: v.replace(/\D/g, '') }))}
            />
          </View>
          <Text className="text-sm text-white/70">Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12">
            <View className="flex-row flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setJobForm((f) => ({ ...f, salary_currency: c }))}
                  className="rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: jobForm.salary_currency === c ? brand.accent : brand.bg,
                  }}>
                  <Text style={{ color: jobForm.salary_currency === c ? brand.bg : brand.text }}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text className="text-sm text-white/70">Description</Text>
          <TextInput
            className={`${inputClass} min-h-[140px]`}
            placeholderTextColor="#888"
            multiline
            value={jobForm.description}
            onChangeText={(v) => setJobForm((f) => ({ ...f, description: v }))}
            placeholder={JOB_DESC_PLACEHOLDER}
          />
          <Pressable
            onPress={() => setJobForm((f) => ({ ...f, description: JOB_DESC_PLACEHOLDER }))}>
            <Text style={{ color: brand.accent }}>Use template</Text>
          </Pressable>
          <Pressable
            onPress={handleCreateJob}
            disabled={!company || jobLoading}
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: brand.accent, opacity: !company || jobLoading ? 0.5 : 1 }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              {jobLoading ? 'Creating…' : 'Create job'}
            </Text>
          </Pressable>
        </View>
      )}

      {activeTab === 'applications' && (
        <View className="mt-6 gap-4">
          <Text className="text-lg font-bold text-white">Applications</Text>
          {recruiterJobsLoading && jobOptions.length === 0 ? (
            <ActivityIndicator color={brand.accent} />
          ) : (
            <ScrollView horizontal className="max-h-28">
              <View className="flex-row flex-wrap gap-2">
                {jobOptions.map((j) => (
                  <Pressable
                    key={j.id}
                    onPress={() => setApplicationsJobId(j.id)}
                    className="max-w-[200px] rounded-lg border px-3 py-2"
                    style={{
                      borderColor: applicationsJobId === j.id ? brand.accent : brand.border,
                    }}>
                    <Text className="text-xs text-white" numberOfLines={2}>
                      {j.position_title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
          <Text className="text-sm text-white/70">Job ID (UUID)</Text>
          <TextInput
            className={inputClass}
            placeholderTextColor="#888"
            value={applicationsJobId}
            onChangeText={setApplicationsJobId}
            autoCapitalize="none"
          />
          {applicationsError ? <Text className="text-red-400">{applicationsError}</Text> : null}
          {applicationsLoading && applications.length === 0 ? (
            <ActivityIndicator color={brand.accent} />
          ) : (
            applications.map((app) => (
              <View
                key={app.id}
                className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
                <Text className="font-bold text-white">Applicant {app.user_id.slice(0, 8)}…</Text>
                <Text className="text-white/60">{app.status}</Text>
                <Text className="mt-2 text-xs text-white/40">Set status</Text>
                <View className="mt-1 flex-row flex-wrap gap-2">
                  {APP_STATUSES.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => updateAppStatus(app.id, s)}
                      className="rounded-lg px-2 py-1"
                      style={{ backgroundColor: app.status === s ? brand.accent : brand.bg }}>
                      <Text
                        className="text-xs capitalize"
                        style={{ color: app.status === s ? brand.bg : brand.text }}>
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <Pressable
        onPress={() => logout()}
        className="mt-8 items-center rounded-xl border border-red-500/30 py-4">
        <Text className="font-bold text-red-400">Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
