import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { bffApi, Job } from '../services/bffApi'
import { useAuth } from '../contexts/AuthContext'
import FilterSidebar from '../components/FilterSidebar'
import { JobsFilterState, DEFAULT_JOBS_FILTER } from '../types/filters'
import { filterJobs } from '../utils/filterJobs'

const AIMatchesPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([])
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuggested = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true)
          const [suggested, applications] = await Promise.all([
            bffApi.getSuggestedJobs(user.id),
            bffApi.getMyApplications(user.id),
          ])
          setSuggestedJobs(suggested)
          setAppliedJobIds(new Set(applications.map((a) => a.job_id)))
        } catch (error) {
          console.error('Failed to fetch suggested jobs:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSuggested()
  }, [isAuthenticated, user])

  const handleApply = async (jobId: string) => {
    if (!user?.id) return
    setApplyingId(jobId)
    try {
      await bffApi.applyToJob(user.id, jobId)
      setAppliedJobIds((prev) => new Set([...prev, jobId]))
    } finally {
      setApplyingId(null)
    }
  }

  // On free plan, only 3 are unlocked
  const isPremium = false // This would come from user context/subscription status
  
  // For demonstration, if we have no suggested jobs, use some mock ones
  const mockJobs = [
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
      description: 'We are looking for a Senior Software Engineer to join our cloud infrastructure team...',
      posted_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      company_name: 'Meta',
      company_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1280px-Meta_Platforms_Inc._logo.svg.png',
      position_title: 'Product Designer',
      location: 'Menlo Park, CA',
      employment_type: 'Full-time',
      salary_min: 140000,
      salary_max: 200000,
      salary_currency: 'USD',
      description: 'Join the Meta design team to help build the future of social connection...',
      posted_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      company_name: 'Amazon',
      company_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1280px-Amazon_logo.svg.png',
      position_title: 'Backend Engineer (Rust)',
      location: 'Seattle, WA',
      employment_type: 'Contract',
      salary_min: 130000,
      salary_max: 170000,
      salary_currency: 'USD',
      description: 'Help us scale our high-performance backend services using Rust and AWS...',
      posted_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      company_name: 'Netflix',
      company_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1280px-Netflix_2015_logo.svg.png',
      position_title: 'Full Stack Developer',
      location: 'Los Gatos, CA',
      employment_type: 'Full-time',
      salary_min: 150000,
      salary_max: 250000,
      salary_currency: 'USD',
      description: 'Netflix is looking for a Full Stack Developer to enhance our content delivery network...',
      posted_at: new Date().toISOString()
    }
  ] as Job[];

  const [filter, setFilter] = useState<JobsFilterState>(DEFAULT_JOBS_FILTER)
  const finalSuggestedJobs = suggestedJobs.length > 0 ? suggestedJobs : mockJobs
  const filteredSuggested = useMemo(() => filterJobs(finalSuggestedJobs, filter), [finalSuggestedJobs, filter])
  const displayedJobs = isPremium ? filteredSuggested : filteredSuggested.slice(0, 3)
  const totalMatches = filteredSuggested.length

  return (
    <>
      <Helmet>
        <title>AI Job Matches - MatchMyResume</title>
        <meta name="description" content="Unlock your personalized AI job matches on MatchMyResume." />
      </Helmet>

      <div className="min-h-screen bg-[#2b2b2b] text-white py-12 px-4 md:px-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sidebar with Premium Look */}
            <div className="w-full lg:w-80 space-y-6 shrink-0">
              <div className="p-8 rounded-3xl bg-[#1a1a1a] border border-[#fcc636]/20 shadow-brand space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fcc636]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="space-y-4 relative z-10">
                  <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Our AI has analyzed your resume against thousands of job descriptions to find these perfect matches.
                  </p>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4 relative z-10">
                  <h3 className="text-sm font-bold text-[#fcc636] uppercase tracking-widest">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#2b2b2b] border border-white/5">
                      <p className="text-2xl font-bold text-white">{totalMatches}</p>
                      <p className="text-[10px] text-white/40 uppercase">Matches</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#2b2b2b] border border-white/5">
                      <p className="text-2xl font-bold text-white">98%</p>
                      <p className="text-[10px] text-white/40 uppercase">Accuracy</p>
                    </div>
                  </div>
                </div>

                {!isPremium && (
                  <div className="p-6 rounded-2xl bg-[#fcc636] text-[#2b2b2b] space-y-4 shadow-brand relative z-10">
                    <p className="font-bold text-sm">Upgrade to Premium to unlock all {totalMatches} matches!</p>
                    <Link to="/pricing" className="block w-full py-3 rounded-lg bg-[#2b2b2b] text-white text-center text-xs font-bold hover:bg-black transition-all">
                      View Plans
                    </Link>
                  </div>
                )}
              </div>
              
              <FilterSidebar filter={filter} onChange={setFilter} />
            </div>

            {/* Main Content */}
            <div className="flex-grow w-full space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    ✨ AI Matches
                    <span className="text-xs font-normal bg-[#fcc636]/10 text-[#fcc636] px-3 py-1 rounded-full border border-[#fcc636]/20">
                      Premium Feature
                    </span>
                  </h1>
                  <p className="text-white/50">Showing jobs where you have the highest chance of success.</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {isLoading && suggestedJobs.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-[#fcc636] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : displayedJobs.length > 0 ? (
                  <>
                    {displayedJobs.map(job => (
                      <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fcc636]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all blur-sm" />
                        
                        {/* Premium Job Card Style */}
                        <div className="p-8 rounded-xl bg-[#1a1a1a] border border-white/5 shadow-brand hover:border-[#fcc636]/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex gap-6">
                            <div className="w-20 h-20 rounded-xl bg-[#2b2b2b] flex items-center justify-center p-4 border border-white/10 shrink-0">
                              {job.company_logo_url ? (
                                <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-3xl font-bold text-[#fcc636]">{job.company_name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-white/70 font-medium">{job.company_name}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-2xl font-bold text-white group-hover:text-[#fcc636] transition-colors">{job.position_title}</h3>
                                  <span className="px-3 py-1 rounded-full bg-[#fcc636]/10 text-[#fcc636] text-[10px] font-bold uppercase tracking-wider border border-[#fcc636]/20">{job.employment_type}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-6 text-sm text-white/60">
                                <div className="flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#fcc636]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#fcc636]"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                  {job.salary_min ? `$${job.salary_min/1000}K - $${(job.salary_max ?? job.salary_min)/1000}K` : 'Undisclosed'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#fcc636]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  4 Days Remaining
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <button className="p-4 rounded-xl bg-[#2b2b2b] text-white/30 hover:text-[#fcc636] transition-all border border-white/5 hover:border-[#fcc636]/30">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                            </button>
                            {isAuthenticated && user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleApply(job.id)
                                }}
                                disabled={appliedJobIds.has(job.id) || applyingId === job.id}
                                className="flex-grow md:flex-grow-0 px-8 py-4 rounded-xl bg-[#fcc636] text-[#2b2b2b] font-bold shadow-brand hover:bg-[#e6b535] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {appliedJobIds.has(job.id) ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply Now'}
                                {!appliedJobIds.has(job.id) && applyingId !== job.id && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                )}
                              </button>
                            )}
                          </div>

                          <div className="absolute -top-3 -left-3">
                            <div className="bg-[#fcc636] text-[#2b2b2b] text-[10px] font-black px-3 py-1 rounded-lg shadow-brand transform -rotate-12 uppercase tracking-tighter">
                              98% Match
                            </div>
                          </div>
                        </div>
                      </div>
                      </Link>
                    ))}
                    
                    {!isPremium && totalMatches > 3 && (
                      <div className="relative mt-12">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2b2b2b] z-10 h-64 -mt-64" />
                        <div className="p-16 rounded-3xl bg-[#1a1a1a] border border-[#fcc636]/30 shadow-brand text-center space-y-8 relative z-20 overflow-hidden">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#fcc636]/5 rounded-full blur-3xl -mt-32" />
                          
                          <div className="w-24 h-24 bg-[#fcc636]/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fcc636" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          </div>
                          <div className="space-y-3 relative z-10">
                            <h3 className="text-3xl font-bold text-white">Unlock {totalMatches - 3} More Matches</h3>
                            <p className="text-white/50 max-w-md mx-auto text-lg">Our AI found even more opportunities that match your specific profile. Upgrade to premium to reveal them all.</p>
                          </div>
                          <Link to="/upgrade" className="inline-block px-12 py-5 rounded-xl bg-[#fcc636] text-[#2b2b2b] font-bold text-lg shadow-brand hover:bg-[#e6b535] transition-all relative z-10">
                            Upgrade to Premium
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-brand">
                    <p className="text-lg text-white/50">No AI matches found. Try updating your resume!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default AIMatchesPage