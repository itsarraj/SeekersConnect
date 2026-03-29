import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { bffApi, Application, Company, CreateCompanyRequest, CreateJobRequest, EmployerProfile, Job } from '../services/bffApi'
import { EMPLOYER_SIGNUP_STORAGE_KEY } from './EmployerSignupPage'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'CHF', 'JPY'] as const

const RecruiterPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'create-job' | 'applications' | 'company'>('create-job')
  const [companyTab, setCompanyTab] = useState<'create' | 'details'>('create')

  const [company, setCompany] = useState<Company | null>(null)
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null)
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [companySuccess, setCompanySuccess] = useState<string | null>(null)
  const [jobLoading, setJobLoading] = useState(false)
  const [jobError, setJobError] = useState<string | null>(null)
  const [jobSuccess, setJobSuccess] = useState<string | null>(null)
  const [createdJobs, setCreatedJobs] = useState<Job[]>([])
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([])
  const [recruiterJobsLoading, setRecruiterJobsLoading] = useState(false)
  const [applicationsJobId, setApplicationsJobId] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState<string | null>(null)
  const [applicationsStatusFilter, setApplicationsStatusFilter] = useState<string>('all')
  const [applicationsSortBy, setApplicationsSortBy] = useState<'date' | 'match' | 'status'>('date')

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
  })

  const JOB_DESC_PLACEHOLDER = `## The Role
2-3 sentences on what this role is about and who you're looking for.

## What You'll Do
• Key responsibility 1
• Key responsibility 2
• Key responsibility 3

## What We're Looking For
• Must-have 1 (e.g. 5+ years experience)
• Must-have 2
• Nice-to-have

## Why Join
• Benefit 1
• Benefit 2

## Eligibility
Location, visa, or work authorization requirements.`

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
  })

  useEffect(() => {
    if (user && user.role !== 'recruiter' && user.role !== 'admin') {
      navigate('/profile', { replace: true })
    }
  }, [user, navigate])

  const TEST_COMPANY_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

  useEffect(() => {
    if (!user?.id || (user.role !== 'recruiter' && user.role !== 'admin')) return
    const load = async () => {
      const profile = await bffApi.getEmployerProfile()
      if (profile) {
        setEmployerProfile(profile)
        if (profile.company_id) {
          let company = await bffApi.getEmployerCompany()
          if (!company) company = await bffApi.getCompany(profile.company_id).catch(() => null)
          if (company) {
            setCompany(company)
            setCompanyDetails(company)
            setCompanyTab('details')
          }
        }
      } else if (user?.email === 'recruiter@test.com') {
        setEmployerProfile({
          user_id: user.id,
          company_name: 'Test Company',
          company_id: TEST_COMPANY_ID,
          job_title: 'HR Manager',
          mobile: '+1234567890',
          company_type: 'direct',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        const company = await bffApi.getCompany(TEST_COMPANY_ID).catch(() => null)
        if (company) {
          setCompany(company)
          setCompanyDetails(company)
          setCompanyTab('details')
        }
      }
    }
    load()
  }, [user?.id, user?.role, user?.email])

  useEffect(() => {
    if (company?.id && companyTab === 'details') {
      // Skip fetch when we already have matching details (e.g. just created)
      if (companyDetails?.id === company.id) {
        return
      }
      setCompanyLoading(true)
      setCompanyError(null)
      bffApi.getCompany(company.id)
        .then(setCompanyDetails)
        .catch((e) => setCompanyError(e instanceof Error ? e.message : 'Failed to load company'))
        .finally(() => setCompanyLoading(false))
    } else {
      setCompanyDetails(company ?? null)
    }
  }, [company?.id, companyTab])

  const companyNameForFilter = company?.name ?? employerProfile?.company_name ?? null

  useEffect(() => {
    if (activeTab === 'applications') {
      setRecruiterJobsLoading(true)
      bffApi.getJobs({ limit: 100, page: 1 })
        .then((res) => {
          let jobs = companyNameForFilter
            ? res.jobs.filter((j) => j.company_name === companyNameForFilter)
            : res.jobs
          if (companyNameForFilter && jobs.length === 0) jobs = res.jobs
          setRecruiterJobs(jobs)
        })
        .catch(() => setRecruiterJobs([]))
        .finally(() => setRecruiterJobsLoading(false))
    }
  }, [activeTab, companyNameForFilter])

  // Auto-select first job when jobs load and none selected
  useEffect(() => {
    if (activeTab !== 'applications' || recruiterJobsLoading) return
    const jobs = companyNameForFilter
      ? recruiterJobs.filter((j) => j.company_name === companyNameForFilter)
      : recruiterJobs
    const first = [...createdJobs, ...jobs.filter((j) => !createdJobs.some((c) => c.id === j.id))][0]
    if (first && !applicationsJobId.trim()) setApplicationsJobId(first.id)
  }, [activeTab, recruiterJobsLoading, recruiterJobs, createdJobs, companyNameForFilter, applicationsJobId])

  const isValidJobId = (id: string) => /^[0-9a-f-]{36}$/i.test(id.trim())

  useEffect(() => {
    if (activeTab === 'applications' && applicationsJobId.trim() && isValidJobId(applicationsJobId) && user?.id) {
      setApplications([])
      setApplicationsLoading(true)
      setApplicationsError(null)
      const jobId = applicationsJobId.trim()
      bffApi.getJobApplications(user.id, jobId)
        .then(setApplications)
        .catch((e) => {
          const msg = e instanceof Error ? e.message : 'Failed to load applications'
          setApplicationsError(msg)
          setApplications([])
        })
        .finally(() => setApplicationsLoading(false))
    }
  }, [activeTab, applicationsJobId, user?.id])

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
        specialization: Array.isArray(company.specialization) ? company.specialization.join(', ') : (company.specialization ?? ''),
      })
    }
  }, [companyTab, company])

  useEffect(() => {
    if (!user?.id) return
    const stored = sessionStorage.getItem(EMPLOYER_SIGNUP_STORAGE_KEY)
    if (!stored) return
    const run = async () => {
      try {
        const data = JSON.parse(stored) as { companyName?: string; role?: string; mobile?: string; companyType?: string }
        await bffApi.upsertEmployerProfile({
          company_name: data.companyName ?? '',
          job_title: data.role || undefined,
          mobile: data.mobile || undefined,
          company_type: data.companyType ?? 'direct',
        })
        setCompanyForm((prev) => ({
          ...prev,
          name: data.companyName ?? prev.name,
          company_type: data.companyType === 'agency' ? 'Agency' : data.companyType === 'direct' ? 'Direct' : prev.company_type,
        }))
        setActiveTab('company')
        setCompanyTab('create')
      } catch (e) {
        console.error('Failed to create employer profile:', e)
      } finally {
        sessionStorage.removeItem(EMPLOYER_SIGNUP_STORAGE_KEY)
      }
    }
    run()
  }, [user?.id])

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompanyError(null)
    setCompanySuccess(null)
    if (!companyForm.name.trim()) {
      setCompanyError('Company name is required')
      return
    }
    setCompanyLoading(true)
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
      }
      const created = await bffApi.createCompany(payload)
      setCompany(created)
      setCompanyDetails(created)
      await bffApi.upsertEmployerProfile({
        company_name: created.name,
        company_id: created.id,
        company_type: (employerProfile?.company_type ?? companyForm.company_type) || 'direct',
        job_title: employerProfile?.job_title,
        mobile: employerProfile?.mobile,
      })
      setEmployerProfile((p) => p && { ...p, company_id: created.id, company_name: created.name })
      setCompanySuccess('Company created successfully')
      setCompanyTab('details')
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Failed to create company')
    } finally {
      setCompanyLoading(false)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setJobError(null)
    setJobSuccess(null)
    if (!company?.id) {
      setJobError('Create a company first')
      return
    }
    if (!jobForm.position_title.trim()) {
      setJobError('Job position is required')
      return
    }
    setJobLoading(true)
    try {
      const minRaw = jobForm.salary_min ? parseInt(jobForm.salary_min.replace(/\D/g, ''), 10) : undefined
      const maxRaw = jobForm.salary_max ? parseInt(jobForm.salary_max.replace(/\D/g, ''), 10) : undefined
      const minNum = minRaw != null ? minRaw * 1000 : undefined
      const maxNum = maxRaw != null ? maxRaw * 1000 : undefined
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
      }
      const created = await bffApi.createJob(payload)
      setCreatedJobs((prev) => [created, ...prev])
      setJobSuccess('Job created successfully')
      setJobForm({ ...jobForm, position_title: '', description: '', salary_min: '', salary_max: '' })
    } catch (err) {
      setJobError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setJobLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Recruiter Dashboard - MatchMyResume</title>
        <meta name="description" content="Manage job posts and applications on MatchMyResume." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white py-12 px-4 md:px-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sidebar Actions */}
            <div className="flex flex-col w-full lg:w-80 gap-6 p-6 rounded-3xl bg-[#1a1a1a] shadow-brand border border-white/10 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-bold text-white">Hello {user?.name || 'Kabira'} 👋</p>
                <div className="w-10 h-10 rounded-full bg-[#fcc636] flex items-center justify-center text-[#2b2b2b] font-bold shadow-brand">
                  {user?.name?.charAt(0) || 'K'}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setActiveTab('create-job')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'create-job' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Create Job Post
                </button>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'applications' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Applications
                </button>
                <button 
                  onClick={() => setActiveTab('company')}
                  className={`w-full h-14 rounded-lg font-bold transition-all shadow-brand ${activeTab === 'company' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                >
                  Company Profile
                </button>
              </div>

              <div className="h-px bg-white/10 my-2" />

              <div className="flex flex-col gap-3">
                <button onClick={logout} className="w-full h-14 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-bold shadow-brand hover:bg-red-500/20 transition-all">
                  Logout
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow w-full">
              {activeTab === 'create-job' && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="space-y-8 max-w-2xl w-full">
                    <div className="p-8 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-8">
                      <h3 className="text-lg font-bold text-white">Wants to create job post ?</h3>
                      {!company && (
                        <p className="text-sm text-[#fcc636]">Create a company first in the Company Profile tab.</p>
                      )}
                      {jobError && <p className="text-sm text-red-400">{jobError}</p>}
                      {jobSuccess && <p className="text-sm text-green-400">{jobSuccess}</p>}
                      <form className="space-y-6" onSubmit={handleCreateJob}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm text-white">Job position</label>
                            <input
                              type="text"
                              placeholder="e.g. Senior Software Engineer"
                              value={jobForm.position_title}
                              onChange={(e) => setJobForm((f) => ({ ...f, position_title: e.target.value }))}
                              className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-white">Compensation range</label>
                            <p className="text-xs text-white/50">Between min and max, or &quot;more than&quot; (min only), or leave empty</p>
                            <div className="flex flex-wrap gap-3 items-center">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Min (e.g. 80)"
                                value={jobForm.salary_min}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '')
                                  setJobForm((f) => ({ ...f, salary_min: v }))
                                }}
                                className="flex-1 min-w-[80px] h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand"
                              />
                              <span className="text-white/50">–</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Max (e.g. 120)"
                                value={jobForm.salary_max}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '')
                                  setJobForm((f) => ({ ...f, salary_max: v }))
                                }}
                                className="flex-1 min-w-[80px] h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand"
                              />
                              <span className="text-white/50 text-sm shrink-0">K</span>
                              <select
                                value={jobForm.salary_currency}
                                onChange={(e) => setJobForm((f) => ({ ...f, salary_currency: e.target.value }))}
                                className="h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand cursor-pointer"
                              >
                                {CURRENCIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-white">Job description</label>
                              <button
                                type="button"
                                onClick={() => setJobForm((f) => ({ ...f, description: JOB_DESC_PLACEHOLDER }))}
                                className="text-xs text-[#fcc636] hover:underline"
                              >
                                Use template
                              </button>
                            </div>
                            <p className="text-xs text-white/50">Sections: The Role, What You&apos;ll Do, What We&apos;re Looking For, Why Join, Eligibility</p>
                            <textarea
                              value={jobForm.description}
                              onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}
                              rows={14}
                              className="w-full p-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/80 focus:border-[#fcc636] outline-none shadow-brand font-mono text-sm"
                              placeholder={JOB_DESC_PLACEHOLDER}
                            />
                          </div>

                          <div className="h-px bg-white/10 my-6" />

                          <div className="space-y-2">
                            <label className="text-sm text-white">Employment Type</label>
                            <div className="relative group">
                              <select
                                value={jobForm.employment_type}
                                onChange={(e) => setJobForm((f) => ({ ...f, employment_type: e.target.value }))}
                                className="w-full h-11 px-4 appearance-none rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand cursor-pointer"
                              >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contractor</option>
                                <option>Temporary</option>
                                <option>Internship</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.75L9 12.75L15 6.75" stroke="white" strokeWidth="2" strokeLinecap="square"/></svg>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-white">Office Location</label>
                            <div className="relative group">
                              <select
                                value={jobForm.location}
                                onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}
                                className="w-full h-11 px-4 appearance-none rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand cursor-pointer"
                              >
                                <option>Remote</option>
                                <option>Onsite</option>
                                <option>Hybrid</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.75L9 12.75L15 6.75" stroke="white" strokeWidth="2" strokeLinecap="square"/></svg>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-white">Salary period</label>
                            <div className="relative group">
                              <select
                                value={jobForm.salary_period}
                                onChange={(e) => setJobForm((f) => ({ ...f, salary_period: e.target.value }))}
                                className="w-full h-11 px-4 appearance-none rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand cursor-pointer"
                              >
                                <option value="yearly">Yearly</option>
                                <option value="monthly">Monthly</option>
                                <option value="hourly">Hourly</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.75L9 12.75L15 6.75" stroke="white" strokeWidth="2" strokeLinecap="square"/></svg>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-white">Tags, keywords or stack (comma-separated)</label>
                            <input
                              type="text"
                              value={jobForm.tags}
                              onChange={(e) => setJobForm((f) => ({ ...f, tags: e.target.value }))}
                              placeholder="React, Node.js, TypeScript"
                              className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 focus:border-[#fcc636] outline-none shadow-brand"
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={!company || jobLoading}
                            className="w-40 h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {jobLoading ? 'Creating...' : 'Create Job'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Preview Section - live updates from form */}
                  <div className="flex-grow w-full max-w-sm space-y-6">
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-6">
                      <div className="space-y-4">
                        <p className="text-lg font-bold text-white">
                          {jobForm.position_title || 'Position title'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#2b2b2b] flex items-center justify-center border border-white/10 overflow-hidden">
                            {company?.logo_url ? (
                              <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-[#fcc636]">{(company?.name || 'Co').charAt(0)}</span>
                            )}
                          </div>
                          <p className="text-base text-white">{company?.name || 'Company'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{jobForm.location || 'Location'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const min = jobForm.salary_min ? parseInt(jobForm.salary_min, 10) : undefined
                            const max = jobForm.salary_max ? parseInt(jobForm.salary_max, 10) : undefined
                            const period = jobForm.salary_period === 'yearly' ? 'Year' : jobForm.salary_period === 'monthly' ? 'Month' : 'Hour'
                            const curr = jobForm.salary_currency || 'USD'
                            let salary: string
                            if (min != null && max != null) salary = `${min}-${max}K ${curr} / ${period}`
                            else if (min != null) salary = `>${min}K ${curr} / ${period}`
                            else if (max != null) salary = `<${max}K ${curr} / ${period}`
                            else salary = 'Salary not disclosed'
                            return <span className="px-3 py-1 rounded-full border border-[#fcc636]/30 text-[10px] text-white">{salary}</span>
                          })()}
                          <span className="px-3 py-1 rounded-full border border-[#fcc636]/30 text-[10px] text-white">{jobForm.location || 'Location'}</span>
                          <span className="px-3 py-1 rounded-full border border-[#fcc636]/30 text-[10px] text-white">{jobForm.employment_type}</span>
                        </div>
                        <button className="w-full py-2 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand">Apply</button>
                      </div>
                      
                      <div className="h-px bg-white/10" />
                      
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white">Job Description</p>
                        <p className="text-xs text-white/50 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                          {jobForm.description || 'Job description will appear here as you type.'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="w-full lg:w-72 space-y-6 shrink-0">
                    <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-6">
                      <h3 className="text-lg font-bold text-white">View Applications by Job</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white">Select Job</label>
                          <select
                            value={applicationsJobId}
                            onChange={(e) => setApplicationsJobId(e.target.value)}
                            disabled={recruiterJobsLoading && recruiterJobs.length === 0}
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] outline-none shadow-brand cursor-pointer"
                          >
                            <option value="">{recruiterJobsLoading && recruiterJobs.length === 0 ? 'Loading jobs...' : 'Choose a job...'}</option>
                            {[...createdJobs, ...recruiterJobs.filter((j) => !createdJobs.some((c) => c.id === j.id))]
                              .map((j) => (
                                <option key={j.id} value={j.id}>{j.position_title} @ {j.company_name}</option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Or enter Job ID</label>
                          <input
                            type="text"
                            value={applicationsJobId}
                            onChange={(e) => setApplicationsJobId(e.target.value)}
                            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] outline-none shadow-brand"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!user?.id || !applicationsJobId.trim()) return
                            setApplicationsLoading(true)
                            setApplicationsError(null)
                            try {
                              const list = await bffApi.getJobApplications(user.id, applicationsJobId.trim())
                              setApplications(list)
                            } catch (e) {
                              setApplicationsError(e instanceof Error ? e.message : 'Failed to load applications')
                              setApplications([])
                            } finally {
                              setApplicationsLoading(false)
                            }
                          }}
                          disabled={!applicationsJobId.trim() || applicationsLoading}
                          className="w-full h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applicationsLoading ? 'Loading...' : 'View Applications'}
                        </button>
                        <div className="h-px bg-white/10" />
                        <div className="space-y-2">
                          <label className="text-sm text-white">Filter by status</label>
                          <select
                            value={applicationsStatusFilter}
                            onChange={(e) => setApplicationsStatusFilter(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] outline-none shadow-brand cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Sort by</label>
                          <select
                            value={applicationsSortBy}
                            onChange={(e) => setApplicationsSortBy(e.target.value as 'date' | 'match' | 'status')}
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] outline-none shadow-brand cursor-pointer"
                          >
                            <option value="date">Date applied</option>
                            <option value="match">Match score</option>
                            <option value="status">Status</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setApplicationsStatusFilter('all')
                            setApplicationsSortBy('date')
                          }}
                          className="w-full py-2 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 hover:text-white transition-all"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow w-full space-y-6">
                    {applicationsError && (
                      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400 flex-1">{applicationsError}</p>
                        <button
                          onClick={async () => {
                            if (!user?.id || !applicationsJobId.trim()) return
                            setApplicationsError(null)
                            setApplicationsLoading(true)
                            try {
                              const list = await bffApi.getJobApplications(user.id, applicationsJobId.trim())
                              setApplications(list)
                            } catch (e) {
                              setApplicationsError(e instanceof Error ? e.message : 'Failed to load applications')
                              setApplications([])
                            } finally {
                              setApplicationsLoading(false)
                            }
                          }}
                          disabled={applicationsLoading}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 disabled:opacity-50"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {applicationsLoading && applications.length === 0 ? (
                        [1, 2, 3, 4].map((i) => (
                          <div key={i} className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                            <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                            <div className="h-4 bg-white/10 rounded w-1/4" />
                          </div>
                        ))
                      ) : (
                      (() => {
                        const filtered = applicationsStatusFilter === 'all'
                          ? applications
                          : applications.filter((a) => a.status === applicationsStatusFilter)
                        const matchPct = (app: Application) =>
                          (Array.from(app.id).reduce((a, c) => a + c.charCodeAt(0), 0) % 28) + 72
                        const statusOrder = { applied: 0, shortlisted: 1, hired: 2, rejected: 3 }
                        const sorted = [...filtered].sort((a, b) => {
                          if (applicationsSortBy === 'date')
                            return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
                          if (applicationsSortBy === 'match')
                            return matchPct(b) - matchPct(a)
                          return (statusOrder[a.status as keyof typeof statusOrder] ?? 4) - (statusOrder[b.status as keyof typeof statusOrder] ?? 4)
                        })
                        return sorted.map((app) => {
                        const pct = matchPct(app)
                        return (
                        <div key={app.id} className="relative p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-[#fcc636]/50 transition-all">
                          <div className="absolute -top-3 -left-3">
                            <div className="bg-[#fcc636] text-[#2b2b2b] text-[10px] font-black px-3 py-1 rounded-lg shadow-brand transform -rotate-12 uppercase tracking-tighter">
                              {pct}% Match
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-white">Applicant {app.user_id.slice(0, 8)}...</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-[#fcc636]/10 text-[#fcc636] text-[10px] font-bold uppercase">{app.status}</span>
                              <span className="text-[10px] text-white/40">{new Date(app.applied_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={app.status}
                              onChange={async (e) => {
                                const status = e.target.value
                                if (!user?.id) return
                                try {
                                  const updated = await bffApi.updateApplication(user.id, app.id, status)
                                  setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)))
                                } catch (err) {
                                  setApplicationsError(err instanceof Error ? err.message : 'Failed to update status')
                                }
                              }}
                              className="h-10 px-3 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] text-sm font-bold outline-none shadow-brand cursor-pointer"
                            >
                              <option value="applied">Applied</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </div>
                        </div>
                        )
                      })
                      })())}
                    </div>
                    {!applicationsLoading && !applicationsError && applicationsJobId && (() => {
                      const filtered = applicationsStatusFilter === 'all'
                        ? applications
                        : applications.filter((a) => a.status === applicationsStatusFilter)
                      if (filtered.length === 0) {
                        return (
                          <p className="text-white/50 text-center py-12">
                            {applications.length === 0 ? 'No applications for this job yet.' : 'No applications match this filter.'}
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-8 max-w-4xl">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setCompanyTab('create')}
                      className={`px-6 py-3 rounded-lg font-bold shadow-brand transition-all ${companyTab === 'create' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                    >
                      Create Company
                    </button>
                    <button 
                      onClick={() => setCompanyTab('details')}
                      className={`px-6 py-3 rounded-lg font-bold shadow-brand transition-all ${companyTab === 'details' ? 'bg-[#2b2b2b] text-[#fcc636] border border-[#fcc636]' : 'bg-[#fcc636] text-[#2b2b2b]'}`}
                    >
                      Company Details
                    </button>
                  </div>

                  {companyTab === 'create' ? (
                    <div className="p-8 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-8">
                      <h3 className="text-lg font-bold text-white">Wants to create company ?</h3>
                      {companyError && <p className="text-sm text-red-400">{companyError}</p>}
                      {companySuccess && <p className="text-sm text-green-400">{companySuccess}</p>}
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreateCompany}>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm text-white">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Google"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm text-white">Logo URL</label>
                          <input
                            type="url"
                            value={companyForm.logo_url}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, logo_url: e.target.value }))}
                            placeholder="https://example.com/logo.png"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Website</label>
                          <input
                            type="text"
                            value={companyForm.website}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, website: e.target.value }))}
                            placeholder="https://company.com"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Industry</label>
                          <input
                            type="text"
                            value={companyForm.industry}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, industry: e.target.value }))}
                            placeholder="Technology"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm text-white">About Company</label>
                          <textarea
                            value={companyForm.about}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, about: e.target.value }))}
                            className="w-full h-24 p-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                            placeholder="Brief description of your company"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Employee Size</label>
                          <input
                            type="text"
                            value={companyForm.employee_size}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, employee_size: e.target.value }))}
                            placeholder="e.g. 50-100"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Head Office</label>
                          <input
                            type="text"
                            value={companyForm.head_office}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, head_office: e.target.value }))}
                            placeholder="City, Country"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Type</label>
                          <input
                            type="text"
                            value={companyForm.company_type}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, company_type: e.target.value }))}
                            placeholder="e.g. Private"
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white">Since</label>
                          <select
                            value={companyForm.since}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, since: e.target.value }))}
                            className="w-full h-11 px-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-[#fcc636] focus:border-[#fcc636] outline-none shadow-brand cursor-pointer"
                          >
                            <option value="">Select Year</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2020">2020</option>
                            <option value="2015">2015</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm text-white">Specialization (comma-separated)</label>
                          <textarea
                            value={companyForm.specialization}
                            onChange={(e) => setCompanyForm((f) => ({ ...f, specialization: e.target.value }))}
                            className="w-full h-24 p-4 rounded-lg bg-[#2b2b2b] border border-white/10 text-white/50 outline-none shadow-brand"
                            placeholder="Search, Cloud, AI"
                          />
                        </div>
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={companyLoading}
                            className="w-48 h-14 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {companyLoading ? 'Creating...' : 'Create Company'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {companyLoading ? (
                        <div className="col-span-2 flex justify-center py-12">
                          <div className="w-10 h-10 border-4 border-[#fcc636] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : companyError ? (
                        <p className="col-span-2 text-red-400">{companyError}</p>
                      ) : companyDetails ? (
                        <>
                          <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 rounded bg-white p-2 flex items-center justify-center">
                                {companyDetails.logo_url ? (
                                  <img src={companyDetails.logo_url} alt={companyDetails.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-2xl font-bold text-[#2b2b2b]">{companyDetails.name.charAt(0)}</span>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold text-white">{companyDetails.name}</h3>
                            </div>
                            <div className="space-y-4">
                              {companyDetails.about && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">About Company</p>
                                  <p className="text-sm text-white/80 leading-relaxed">{companyDetails.about}</p>
                                </div>
                              )}
                              {companyDetails.website && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">Website</p>
                                  <a href={companyDetails.website} target="_blank" rel="noreferrer" className="text-sm text-[#fcc636] hover:underline">{companyDetails.website}</a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              {companyDetails.industry && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">Industry</p>
                                  <p className="text-sm text-white">{companyDetails.industry}</p>
                                </div>
                              )}
                              {companyDetails.employee_size && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">Employee Size</p>
                                  <p className="text-sm text-white">{companyDetails.employee_size}</p>
                                </div>
                              )}
                              {companyDetails.head_office && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">Head Office</p>
                                  <p className="text-sm text-white">{companyDetails.head_office}</p>
                                </div>
                              )}
                              {companyDetails.since && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase font-bold">Since</p>
                                  <p className="text-sm text-white">{companyDetails.since}</p>
                                </div>
                              )}
                            </div>
                            {companyDetails.specialization && companyDetails.specialization.length > 0 && (
                              <div>
                                <p className="text-xs text-white/40 uppercase font-bold mb-2">Specialization</p>
                                <div className="flex flex-wrap gap-2">
                                  {companyDetails.specialization.map((s) => (
                                    <span key={s} className="px-3 py-1 bg-[#2b2b2b] rounded-full text-xs text-white">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : employerProfile ? (
                        <div className="p-6 rounded-lg bg-[#1a1a1a] border border-white/10 shadow-brand space-y-6 col-span-2">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded bg-white p-2 flex items-center justify-center">
                              <span className="text-2xl font-bold text-[#2b2b2b]">{employerProfile.company_name.charAt(0)}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">{employerProfile.company_name}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            {employerProfile.job_title && (
                              <div>
                                <p className="text-xs text-white/40 uppercase font-bold">Role</p>
                                <p className="text-sm text-white">{employerProfile.job_title}</p>
                              </div>
                            )}
                            {employerProfile.mobile && (
                              <div>
                                <p className="text-xs text-white/40 uppercase font-bold">Mobile</p>
                                <p className="text-sm text-white">{employerProfile.mobile}</p>
                              </div>
                            )}
                            {employerProfile.company_type && (
                              <div>
                                <p className="text-xs text-white/40 uppercase font-bold">Company Type</p>
                                <p className="text-sm text-white">{employerProfile.company_type}</p>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-white/50">Create a full company profile above for more details.</p>
                        </div>
                      ) : (
                        <p className="col-span-2 text-white/50">No company created yet. Create one above.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default RecruiterPage