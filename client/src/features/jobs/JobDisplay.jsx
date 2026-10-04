import React, { useState, useEffect, useCallback } from 'react';
import { differenceInHours } from 'date-fns';
import { Link } from 'react-router-dom';
import { getJobApplicantCount } from '../../components/services/jobApplicantCount';
import { fetchUserProfile } from '../../components/services/authProfile';
import JobsSearchBar from './SearchForm';
import Footer from '../../features/shared/Footer';
import SkeletonJobCard from '../../features/shared/SkeletonJobCard';
import SidebarFilters from '../../components/pages/SidebarFilters';
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  X
} from 'lucide-react';
import logger from '../../utils/logger';

const JobCard = React.memo(
  ({ job, countsLoading, applicantCounts, getTitle, getFormattedDate }) => (
    <article
      key={job.jobId}
      className="overflow-hidden rounded-lg border border-slate-200/90 border-l-[3px] border-l-sky-500/50 bg-white shadow-sm transition-shadow hover:border-sky-200 hover:shadow-md"
    >
      <div className="border-b border-sky-100/60 bg-gradient-to-r from-sky-50/50 to-white px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-snug text-slate-900">
              <Link
                to={`/jobinfo/${job.jobId}`}
                className="hover:text-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 rounded"
              >
                {getTitle(job)}
              </Link>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-sky-600/70" strokeWidth={2} aria-hidden />
                {job.subjects}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                {getFormattedDate(job.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                {job.location}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 self-start rounded-md px-2.5 py-1 text-xs font-medium ${
              job.jobStatus === 'Open'
                ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/10'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10'
            }`}
          >
            {job.jobStatus === 'Open' ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{job.jobRequirements}</p>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-sky-200 bg-sky-100 px-3 py-2.5">
            <dt className="text-xs font-medium text-sky-900">Budget</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <DollarSign className="h-4 w-4 text-sky-600" strokeWidth={2} aria-hidden />
              ${job.budget} {job.frequency}
            </dd>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-100 px-3 py-2.5">
            <dt className="text-xs font-medium text-amber-900">Application cost</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{job.coins} coins</dd>
          </div>
          <div className="rounded-md border border-indigo-200 bg-indigo-100 px-3 py-2.5">
            <dt className="text-xs font-medium text-indigo-900">Applicants</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <Users className="h-4 w-4 text-indigo-600" strokeWidth={2} aria-hidden />
              {countsLoading[job.jobId] ? (
                <span className="text-slate-400">…</span>
              ) : applicantCounts[job.jobId] === 0 ? (
                '—'
              ) : (
                String(applicantCounts[job.jobId])
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {applicantCounts[job.jobId] > 0 && !countsLoading[job.jobId] ? (
            <p className="text-xs text-slate-500">
              {applicantCounts[job.jobId]}{' '}
              {applicantCounts[job.jobId] === 1 ? 'applicant' : 'applicants'}
            </p>
          ) : (
            <span className="text-xs text-slate-400" />
          )}
          <Link
            to={`/jobinfo/${job.jobId}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 sm:w-auto"
          >
            View posting
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
);

const JobDisplay = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    jobCategory: null,
    meetingOptions: [],
    dateFilter: null,
    jobStatus: null,
    startDate: null,
    endDate: null
  });
  const [keyword, setKeyword] = useState('');
  const [applicantCounts, setApplicantCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const handleApplyKeyword = useCallback((k) => {
    setKeyword(k);
    setCurrentPage(1);
  }, []);

  const handleClearKeyword = useCallback(() => {
    setKeyword('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const profile = await fetchUserProfile(token);
          if (isMounted) {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        logger.error('Error fetching user profile:', err);
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchUserData();

    const fetchJobs = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089';
        const url = `${BACKEND_BASE_URL}/api/v1/jobs`;
        const queryParams = new URLSearchParams({
          page: currentPage,
          size: pageSize,
          ...(filters.jobCategory && { jobCategory: filters.jobCategory }),
          ...(filters.jobStatus && { jobStatus: filters.jobStatus }),
          ...(filters.dateFilter && { dateFilter: filters.dateFilter }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(Array.isArray(filters.meetingOptions) &&
            filters.meetingOptions.length > 0 && {
              meetingOptions: filters.meetingOptions.join(',')
            }),
          ...(keyword && { keyword })
        });

        const response = await fetch(`${url}?${queryParams.toString()}`);
        const data = await response.json();

        if (!isMounted) return;

        if (data.headers.responseCode === 404) {
          setError(data.headers.customerMessage);
          setJobs([]);
          setTotalPages(0);
          setTotalItems(0);
        } else {
          const payload = data.body?.data;
          const list = payload?.jobs ?? [];
          setJobs(list);
          setTotalPages(payload?.totalPages ?? 1);
          setTotalItems(payload?.totalItems ?? list.length);

          const loadingStates = {};
          const counts = {};
          list.forEach((job) => {
            loadingStates[job.jobId] = true;
            counts[job.jobId] = 0;
          });

          setCountsLoading(loadingStates);
          setApplicantCounts(counts);

          const token = localStorage.getItem('authToken');

          const applicantCountPromises = list.map(async (job) => {
            try {
              const count = await getJobApplicantCount(job.jobId, token);
              return { jobId: job.jobId, count, success: true };
            } catch (err) {
              logger.error(`Error fetching applicant count for job ${job.jobId}:`, err);
              return { jobId: job.jobId, count: 0, success: false };
            }
          });

          const results = await Promise.allSettled(applicantCountPromises);

          if (isMounted) {
            const newCounts = { ...counts };
            const newLoadingStates = { ...loadingStates };

            results.forEach((result) => {
              if (result.status === 'fulfilled') {
                const { jobId, count, success } = result.value;
                newCounts[jobId] = count;
                newLoadingStates[jobId] = false;
                if (!success) {
                  logger.warn(`Using fallback count for job ${jobId} due to backend error`);
                }
              }
            });

            setApplicantCounts(newCounts);
            setCountsLoading(newLoadingStates);
          }
        }
      } catch (err) {
        logger.error('Error fetching jobs:', err);
        if (isMounted) {
          setError('Unable to load listings. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, filters, keyword]);

  const getFormattedDate = (createdAtArray) => {
    try {
      if (!createdAtArray || !Array.isArray(createdAtArray)) {
        return '—';
      }

      const date = new Date(
        createdAtArray[0],
        createdAtArray[1] - 1,
        createdAtArray[2],
        createdAtArray[3],
        createdAtArray[4],
        createdAtArray[5],
        Math.floor(createdAtArray[6] / 1000000)
      );

      const now = new Date();
      const hours = differenceInHours(now, date);

      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;

      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks}w ago`;

      const months = Math.floor(days / 30);
      if (months < 6) return `${months}mo ago`;

      return '6mo+ ago';
    } catch (e) {
      logger.error('Error formatting date:', e);
      return '—';
    }
  };

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const getTitle = (job) => {
    if (job.meetingOptions === 'Travel to tutor' || job.meetingOptions === 'At my place') {
      return `Home ${job.subjects} — ${job.location}`;
    }
    if (job.meetingOptions === 'Online') {
      return `Online ${job.subjects} — ${job.location}`;
    }
    return `${job.subjects} — ${job.location}`;
  };

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const searchBar = (
    <JobsSearchBar
      appliedKeyword={keyword}
      onApplyKeyword={handleApplyKeyword}
      onClearKeyword={handleClearKeyword}
    />
  );

  if (!profileLoading && userProfile && userProfile.roleName === 'ROLE_TUTOR' && userProfile.stepName !== 'COMPLETE') {
    return (
      <>
        {searchBar}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-72 lg:shrink-0">
              <SidebarFilters setFilters={setFilters} />
            </aside>
            <main className="min-w-0 flex-1">{/* profile completion */}</main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {searchBar}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-72 lg:shrink-0">
            <SidebarFilters setFilters={setFilters} />
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-3 border-b border-sky-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Results{' '}
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-sky-400/80 align-middle" aria-hidden />
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {totalItems === 0 && !loading
                    ? 'No listings match your criteria.'
                    : `Showing ${rangeStart}–${rangeEnd} of ${totalItems} listing${totalItems === 1 ? '' : 's'}`}
                </p>
              </div>
              {keyword.trim() ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-sky-800/70">Active search</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
                    <span className="max-w-[200px] truncate">&quot;{keyword.trim()}&quot;</span>
                    <button
                      type="button"
                      onClick={handleClearKeyword}
                      className="rounded p-0.5 text-sky-700 hover:bg-sky-200/50"
                      aria-label="Clear keyword search"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </span>
                </div>
              ) : null}
            </div>

            {initialLoad ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
                {[...Array(5)].map((_, idx) => (
                  <SkeletonJobCard key={idx} />
                ))}
              </div>
            ) : error && jobs.length === 0 ? (
              <div className="rounded-lg border border-sky-100/80 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-100">
                  <Briefcase className="h-6 w-6 text-sky-600/70" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No results</h3>
                <p className="mt-2 text-sm text-slate-600">{error}</p>
                <p className="mt-4 text-xs text-slate-500">
                  Try clearing the search box or relaxing filters in the sidebar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.jobId}
                    job={job}
                    countsLoading={countsLoading}
                    applicantCounts={applicantCounts}
                    getTitle={getTitle}
                    getFormattedDate={getFormattedDate}
                  />
                ))}

                {jobs.length > 0 && totalPages > 1 && (
                  <nav
                    className="flex flex-col items-center justify-center gap-3 border-t border-sky-100/80 pt-8 sm:flex-row"
                    aria-label="Pagination"
                  >
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Previous
                    </button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                  </nav>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default JobDisplay;
