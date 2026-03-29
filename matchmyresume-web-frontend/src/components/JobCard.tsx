import React, { useState } from 'react';
import { Job } from '../services/bffApi';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void | Promise<void>;
  applied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, applied }) => {
  const [applying, setApplying] = useState(false);
  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMs = now.getTime() - posted.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Salary not disclosed';
    const curr = currency || 'USD';
    if (min && max) return `${(min / 1000).toFixed(0)}-${(max / 1000).toFixed(0)}k ${curr}`;
    if (min) return `>${(min / 1000).toFixed(0)}k ${curr}`;
    return `<${(max! / 1000).toFixed(0)}k ${curr}`;
  };

  return (
    <div
      className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-6 p-6 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-[#fcc636]/30 transition-all cursor-pointer group shadow-brand"
    >
      <div className="flex-grow-0 flex-shrink-0 w-[72px] h-[72px] relative overflow-hidden rounded bg-[#2b2b2b] flex items-center justify-center border border-white/10">
        {job.company_logo_url ? (
          <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-[#fcc636]">{job.company_name.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-col justify-start items-start flex-grow relative gap-3">
        <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-1.5">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 gap-1">
              <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-3">
                <p className="flex-grow-0 flex-shrink-0 text-lg text-left text-white/70">
                  {job.company_name}
                </p>
              </div>
              <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-3">
                <p className="flex-grow-0 flex-shrink-0 text-2xl font-medium text-left text-white group-hover:text-[#fcc636] transition-colors">
                  {job.position_title}
                </p>
                {new Date().getTime() - new Date(job.posted_at).getTime() < 24 * 60 * 60 * 1000 && (
                  <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative overflow-hidden gap-1 px-1.5 py-0.5 rounded-[3px] bg-[#fcc636]/10">
                    <p className="flex-grow-0 flex-shrink-0 text-xs font-medium text-left text-[#fcc636]">
                      New post
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button className="p-2 rounded-lg bg-[#2b2b2b] text-white/30 hover:text-[#fcc636] transition-all border border-white/5 hover:border-[#fcc636]/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
          <div className="flex flex-wrap justify-start items-center flex-grow-0 flex-shrink-0 relative gap-x-6 gap-y-2 py-0.5">
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-4 h-4 relative text-[#fcc636]">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 2C6.80653 2 5.66193 2.47411 4.81802 3.31802C3.97411 4.16193 3.5 5.30653 3.5 6.5C3.5 8.56997 4.65592 10.4548 5.8773 11.8594C6.48189 12.5547 7.08775 13.1152 7.54257 13.5018C7.72245 13.6547 7.87812 13.7799 8 13.875C8.12188 13.7799 8.27755 13.6547 8.45743 13.5018C8.91225 13.1152 9.51812 12.5547 10.1227 11.8594C11.3441 10.4548 12.5 8.56997 12.5 6.5C12.5 5.30653 12.0259 4.16193 11.182 3.31802C10.3381 2.47411 9.19347 2 8 2ZM8 14.5L8.28673 14.9096C8.11457 15.0301 7.88543 15.0301 7.71327 14.9096L8 14.5Z" fill="currentColor" fillOpacity="0.7" />
              </svg>
              <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white/60">
                {job.location}
              </p>
            </div>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-4 h-4 relative text-[#fcc636]">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5ZM1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8Z" fill="currentColor" fillOpacity="0.7" />
              </svg>
              <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white/60">
                {job.employment_type}
              </p>
            </div>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-grow-0 flex-shrink-0 w-4 h-4 relative text-[#fcc636]">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white/60">
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </p>
            </div>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-grow-0 flex-shrink-0 w-4 h-4 relative text-[#fcc636]">
                <path fillRule="evenodd" clipRule="evenodd" d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3ZM13 3H3V13H13V3Z" fill="currentColor" fillOpacity="0.7" />
              </svg>
              <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white/60">
                {timeAgo(job.posted_at)}
              </p>
            </div>
          </div>
        </div>
        {onApply && (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (applied || applying) return;
              setApplying(true);
              try {
                await onApply(job.id);
              } finally {
                setApplying(false);
              }
            }}
            disabled={applied || applying}
            className="mt-2 px-4 py-2 rounded-lg bg-[#fcc636] text-[#2b2b2b] font-bold text-sm shadow-brand hover:bg-[#e6b535] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applied ? 'Applied' : applying ? 'Applying...' : 'Apply'}
          </button>
        )}
        <p className="self-stretch flex-grow-0 flex-shrink-0 text-base text-left text-white/50 line-clamp-2 whitespace-pre-wrap">
          {job.description || 'No description available for this position.'}
        </p>
      </div>
    </div>
  );
};

export default JobCard;
