import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  DollarSign,
  Users,
  MessageSquare,
  Coins
} from 'lucide-react';
import { getJobListingTitle, getJobRelativeTime } from './jobInfoHelpers';

export function JobInformationHero({
  job,
  applicantCount,
  isProcessing,
  connectDisabled = false,
  onConnectClick
}) {
  const isOpen = job.jobStatus === 'Open';

  return (
    <div className="border-b border-sky-200/70 bg-gradient-to-br from-sky-100/45 via-sky-50/35 to-violet-100/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Back to jobs
          </Link>
          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
              isOpen
                ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/10'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center rounded-md border border-violet-200/50 bg-violet-50/60 px-2.5 py-1 font-medium text-slate-800">
                {job.meetingOptions || 'Flexible'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-600/75" aria-hidden />
                Posted {getJobRelativeTime(job.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-3xl">
              {getJobListingTitle(job)}
            </h1>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-teal-600/70" aria-hidden />
                {job.location || 'Location not specified'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 shrink-0 text-amber-600/65" aria-hidden />
                ${job.budget} {job.frequency}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-indigo-500/70" aria-hidden />
                {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}
              </span>
            </div>
          </div>

          <aside className="rounded-lg border border-sky-200/70 bg-gradient-to-b from-sky-100/55 to-white p-6 shadow-md ring-1 ring-sky-200/50 lg:sticky lg:top-4">
            <div className="flex items-start gap-3 border-b border-sky-200/55 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100/80 ring-1 ring-sky-200/60">
                <Coins className="h-5 w-5 text-sky-700" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Application cost
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{job.coins} coins</p>
              </div>
            </div>

            {isOpen ? (
              <button
                type="button"
                onClick={onConnectClick}
                disabled={isProcessing || connectDisabled}
                title={
                  connectDisabled && !isProcessing
                    ? 'Loading your account — try again in a moment'
                    : undefined
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                    Processing…
                  </>
                ) : connectDisabled ? (
                  <>
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    Loading account…
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    Connect to apply
                  </>
                )}
              </button>
            ) : (
              <p className="mt-5 text-center text-sm text-slate-600">
                This listing is no longer accepting applications.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
