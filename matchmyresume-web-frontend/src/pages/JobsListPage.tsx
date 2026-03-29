import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { bffApi, Job } from '../services/bffApi'
import { useAuth } from '../contexts/AuthContext'
import JobCard from '../components/JobCard'
import FilterSidebar from '../components/FilterSidebar'
import { JobsFilterState, DEFAULT_JOBS_FILTER } from '../types/filters'

/** Build pagination items: page numbers and ellipsis for large ranges */
function getPaginationItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const include = new Set<number>([1, total])
  for (let p = Math.max(1, current - 2); p <= Math.min(total, current + 2); p++) include.add(p)
  const sorted = [...include].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push('ellipsis')
    out.push(sorted[i]!)
  }
  return out
}
import { filterJobs } from '../utils/filterJobs'

const BATCH_SIZE = 50
const PAGE_SIZE = 10

const JobsListPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [serverTotal, setServerTotal] = useState(0)
  const [nextPage, setNextPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filter, setFilter] = useState<JobsFilterState>(DEFAULT_JOBS_FILTER)
  const [clientPage, setClientPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [pageInput, setPageInput] = useState('')
  const [pageInputError, setPageInputError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      bffApi.getMyApplications(user.id).then((apps) => {
        setAppliedJobIds(new Set(apps.map((a) => a.job_id)))
      }).catch(() => {})
    }
  }, [isAuthenticated, user])

  const handleApply = async (jobId: string) => {
    if (!user?.id) return
    await bffApi.applyToJob(user.id, jobId)
    setAppliedJobIds((prev) => new Set([...prev, jobId]))
  }

  const filteredJobs = useMemo(() => filterJobs(allJobs, filter), [allJobs, filter])
  const totalFiltered = filteredJobs.length
  const totalClientPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1
  const paginatedJobs = useMemo(
    () => filteredJobs.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE),
    [filteredJobs, clientPage]
  )

  const fetchBatch = async (page: number, append: boolean) => {
    const res = await bffApi.getJobs({ page, limit: BATCH_SIZE })
    if (append) {
      setAllJobs((prev) => [...prev, ...res.jobs])
    } else {
      setAllJobs(res.jobs)
    }
    setServerTotal(res.total_count)
    setNextPage(page + 1)
    return res
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        await fetchBatch(1, false)
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const loadMore = async () => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await fetchBatch(nextPage, true)
    } catch (error) {
      console.error('Failed to load more jobs:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const hasMoreFromServer = allJobs.length < serverTotal

  useEffect(() => {
    setClientPage(1)
  }, [filter])

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    setPageInputError(null)
    const n = parseInt(pageInput.trim(), 10)
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      setPageInputError('Enter a valid page number')
      return
    }
    if (n < 1 || n > totalClientPages) {
      setPageInputError(`Page must be between 1 and ${totalClientPages}`)
      return
    }
    setClientPage(n)
    setPageInput('')
  }

  return (
    <>
      <Helmet>
        <title>Jobs List - MatchMyResume</title>
        <meta name="description" content="Browse all available job opportunities on MatchMyResume." />
      </Helmet>

      <div className="bg-[#2b2b2b] min-h-screen text-white py-12 px-4 md:px-16">
        <div className="container mx-auto">
          <div className="flex justify-start items-start gap-8">
            {/* Mobile: Filter toggle button */}
            <div className="md:hidden fixed top-20 right-4 z-40">
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="flex justify-between items-center w-[200px] p-3 rounded bg-[#1a1a1a] border border-white/10 shadow-brand cursor-pointer group"
              >
                <span className="text-base text-white group-hover:text-[#fcc636] transition-colors">Filter by</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white/50">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.64645 5.64645C2.84171 5.45118 3.15829 5.45118 3.35355 5.64645L8 10.2929L12.6464 5.64645C12.8417 5.45118 13.1583 5.45118 13.3536 5.64645C13.5488 5.84171 13.5488 6.15829 13.3536 6.35355L8.35355 11.3536C8.15829 11.5488 7.84171 11.5488 7.64645 11.3536L2.64645 6.35355Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Mobile overlay sidebar */}
            {sidebarOpen && (
              <>
                <div
                  className="md:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden
                />
                <div className="md:hidden fixed top-0 left-0 z-50 pt-16">
                  <FilterSidebar
                    filter={filter}
                    onChange={setFilter}
                    onClose={() => setSidebarOpen(false)}
                    isMobileOverlay
                  />
                </div>
              </>
            )}

            {/* Desktop: Always-visible sidebar */}
            <div className="hidden md:block flex-shrink-0">
              <FilterSidebar filter={filter} onChange={setFilter} />
            </div>

            {/* Main content */}
            <div className="flex flex-col justify-start items-center flex-grow gap-12">
              <div className="flex flex-col justify-start items-start self-stretch gap-4">
                <div className="flex justify-between items-center self-stretch">
                  <p className="text-[32px] font-bold text-left text-white">
                    {serverTotal > 0 ? serverTotal.toLocaleString('en-IN') : totalFiltered} Jobs
                    {allJobs.length < serverTotal && serverTotal > 0 && (
                      <span className="text-lg font-normal text-white/50 ml-2">
                        ({allJobs.length} loaded)
                      </span>
                    )}
                  </p>
                </div>

                {/* Jobs list */}
                <div className="flex flex-col gap-4 w-full">
                  {isLoading ? (
                    <div className="flex justify-center py-20">
                      <div className="w-10 h-10 border-4 border-[#fcc636] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : paginatedJobs.length > 0 ? (
                    paginatedJobs.map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                          <JobCard
                            job={job}
                            onApply={isAuthenticated && user?.role === 'user' ? handleApply : undefined}
                            applied={appliedJobIds.has(job.id)}
                          />
                        </Link>
                      ))
                  ) : (
                    <div className="text-center py-20 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-brand">
                      <p className="text-lg text-white/50">No jobs found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client-side pagination */}
              {totalClientPages > 1 && (
                <div className="flex flex-col justify-center items-center gap-4 w-full">
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setClientPage(1)}
                      disabled={clientPage <= 1}
                      className="flex justify-center items-center w-10 h-10 rounded-sm bg-[#1a1a1a] border border-white/10 hover:bg-[#333] transition-colors shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First page"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                        <path d="M11 4L6 8l5 4M5 4L2 8l3 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                      disabled={clientPage <= 1}
                      className="flex justify-center items-center w-10 h-10 rounded-sm bg-[#1a1a1a] border border-white/10 hover:bg-[#333] transition-colors shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.20626 7.85072C5.02564 8.03134 5.02564 8.32413 5.20626 8.50474L9.92154 13.22C10.1022 13.4006 10.3949 13.4006 10.5756 13.22L10.7936 13.002C10.9742 12.8214 10.9742 12.5285 10.7936 12.3479L6.6234 8.17773L10.7936 4.00752C10.9742 3.8269 10.9742 3.53411 10.7936 3.35349L10.5756 3.13544C10.3949 2.95482 10.1022 2.95482 9.92154 3.13544L5.20626 7.85072Z" fill="currentColor" />
                      </svg>
                    </button>
                    {getPaginationItems(clientPage, totalClientPages).map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-10 h-10 text-white/50">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setClientPage(item)}
                          className={`flex justify-center items-center w-10 h-10 rounded-sm font-bold transition-colors shadow-brand min-w-[40px] ${
                            clientPage === item ? 'bg-[#fcc636] text-[#2b2b2b]' : 'bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#333]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setClientPage((p) => Math.min(totalClientPages, p + 1))}
                      disabled={clientPage >= totalClientPages}
                      className="flex justify-center items-center w-10 h-10 rounded-sm bg-[#1a1a1a] border border-white/10 hover:bg-[#333] transition-colors shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.7937 7.85072C10.9744 8.03134 10.9744 8.32413 10.7937 8.50474L6.07846 13.22C5.89785 13.4006 5.60506 13.4006 5.42444 13.22L5.20639 13.002C5.02577 12.8214 5.02577 12.5285 5.20639 12.3479L9.3766 8.17773L5.20639 4.00752C5.02577 3.8269 5.02577 3.53411 5.20639 3.35349L5.42444 3.13544C5.60506 2.95482 5.89785 2.95482 6.07846 3.13544L10.7937 7.85072Z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientPage(totalClientPages)}
                      disabled={clientPage >= totalClientPages}
                      className="flex justify-center items-center w-10 h-10 rounded-sm bg-[#1a1a1a] border border-white/10 hover:bg-[#333] transition-colors shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last page"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                        <path d="M5 12l5-4-5-4M11 12l3-4-3-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleGoToPage} className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor="page-go" className="text-sm text-white/70">Go to page</label>
                      <input
                        id="page-go"
                        type="text"
                        inputMode="numeric"
                        value={pageInput}
                        onChange={(e) => { setPageInput(e.target.value); setPageInputError(null) }}
                        placeholder={`1–${totalClientPages}`}
                        className="w-16 px-2 py-1.5 rounded bg-[#1a1a1a] border border-white/10 text-white text-center text-sm focus:outline-none focus:border-[#fcc636]/50"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded bg-[#fcc636] text-[#2b2b2b] text-sm font-medium hover:bg-[#e6b22e] transition-colors"
                      >
                        Go
                      </button>
                    </div>
                    {pageInputError && (
                      <p className="text-sm text-red-400" role="alert">{pageInputError}</p>
                    )}
                  </form>
                </div>
              )}

              {/* Load more from server */}
              {hasMoreFromServer && !isLoading && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 rounded-lg bg-[#1a1a1a] border border-white/10 text-white font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Loading...' : `Load more (${allJobs.length} of ${serverTotal})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default JobsListPage
