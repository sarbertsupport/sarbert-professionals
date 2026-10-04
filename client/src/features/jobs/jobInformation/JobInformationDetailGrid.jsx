import {
  BookOpen,
  Target,
  DollarSign,
  GraduationCap,
  User,
  Languages,
  Map,
  MessageCircle,
  MessageSquare,
  Phone,
  ChevronRight,
  Briefcase,
  Award,
  CheckCircle
} from 'lucide-react';
import { normalizeJobSubjects } from './jobInfoHelpers';

function DetailRow({ icon: Icon, label, value, iconClass = 'text-sky-600', rowTint = 'sky' }) {
  const tint =
    rowTint === 'amber'
      ? 'border-amber-200/75 bg-amber-50/50'
      : rowTint === 'indigo'
        ? 'border-indigo-200/60 bg-indigo-50/40'
        : 'border-sky-200/65 bg-sky-100/40';

  return (
    <div className={`flex gap-3 rounded-md border px-3 py-3 ${tint}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/80 bg-white/90 shadow-sm">
        <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function JobInformationDetailGrid({
  job,
  applicantCount,
  isProcessing,
  connectDisabled = false,
  phoneLoading,
  onGetContactNumber,
  onConnectClick
}) {
  const subjects = normalizeJobSubjects(job);
  const isOpen = job.jobStatus === 'Open';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-sky-200/65 bg-gradient-to-br from-sky-100/50 via-white to-cyan-50/35 p-6 shadow-md ring-1 ring-sky-200/40 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-200/55 ring-1 ring-sky-300/50">
                <BookOpen className="h-5 w-5 text-sky-800" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Skills required</h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Subjects and expertise the poster is looking for
                </p>
              </div>
            </div>
            {subjects.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {subjects.map((subject, index) => (
                  <li key={index}>
                    <span className="inline-block rounded-md border border-sky-300/70 bg-gradient-to-b from-sky-100 to-sky-200/50 px-3 py-1.5 text-sm font-medium text-sky-950 shadow-sm">
                      {subject}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-slate-500">No subjects specified.</p>
            )}
          </section>

          <section className="rounded-lg border border-violet-200/55 bg-gradient-to-br from-violet-100/45 via-white to-amber-50/40 p-6 shadow-md ring-1 ring-violet-200/40 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-200/50 ring-1 ring-violet-300/45">
                <Target className="h-5 w-5 text-violet-800" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Job requirements</h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  What the poster expects from applicants
                </p>
              </div>
            </div>
            <div className="rounded-md border border-violet-200/50 bg-violet-50/30 px-4 py-4 shadow-inner">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {job.jobRequirements?.trim() || 'No detailed requirements were provided.'}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-indigo-200/55 bg-gradient-to-b from-indigo-100/42 to-white p-6 shadow-md ring-1 ring-indigo-200/35">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Briefcase className="h-4 w-4 text-indigo-600" aria-hidden />
              Job details
            </h3>
            <div className="space-y-2">
              <DetailRow
                icon={DollarSign}
                label="Budget"
                value={`$${job.budget} (${job.frequency})`}
                rowTint="amber"
                iconClass="text-amber-700"
              />
              <DetailRow icon={GraduationCap} label="Level" value={job.level} iconClass="text-indigo-600" />
              <DetailRow icon={User} label="Job type" value={job.jobType} rowTint="indigo" />
              <DetailRow
                icon={Languages}
                label="Language"
                value={job.language}
                iconClass="text-violet-600"
              />
              <DetailRow
                icon={Map}
                label="Location"
                value={job.location || 'Not specified'}
                iconClass="text-teal-600"
              />
            </div>
          </section>

          <section className="rounded-lg border border-teal-200/50 bg-gradient-to-b from-teal-100/38 to-white p-6 shadow-md ring-1 ring-teal-200/35">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <MessageCircle className="h-4 w-4 text-teal-600" aria-hidden />
              Contact options
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onGetContactNumber}
                disabled={phoneLoading}
                className="flex w-full items-center gap-3 rounded-lg border border-teal-200/75 bg-teal-50/40 px-3 py-3 text-left transition-colors hover:border-teal-300/80 hover:bg-teal-100/45 focus:outline-none focus:ring-2 focus:ring-teal-400/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-teal-200/60 bg-white">
                  {phoneLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" aria-hidden />
                  ) : (
                    <Phone className="h-4 w-4 text-teal-700" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {phoneLoading ? 'Loading…' : 'Get contact number'}
                  </p>
                  <p className="text-xs text-slate-500">Direct phone contact</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              </button>

              <button
                type="button"
                onClick={onConnectClick}
                disabled={isProcessing || !isOpen || connectDisabled}
                title={
                  connectDisabled && isOpen && !isProcessing
                    ? 'Loading your account — try again in a moment'
                    : undefined
                }
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed ${
                  isOpen && !connectDisabled
                    ? 'border-sky-200/80 bg-sky-100/35 hover:border-sky-300/90 hover:bg-sky-100/55'
                    : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                    isOpen && !connectDisabled
                      ? 'border-sky-100/70 bg-white/90'
                      : 'border-slate-200 bg-slate-100'
                  }`}
                >
                  {isProcessing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" aria-hidden />
                  ) : (
                    <MessageSquare
                      className={`h-4 w-4 ${isOpen && !connectDisabled ? 'text-sky-700' : 'text-slate-400'}`}
                      aria-hidden
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isOpen && !connectDisabled ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {isProcessing ? 'Processing…' : connectDisabled ? 'Loading account…' : 'Start chat'}
                  </p>
                  <p
                    className={`text-xs ${isOpen && !connectDisabled ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {job.coins} coins required
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 ${isOpen ? 'text-slate-400' : 'text-slate-300'}`}
                  aria-hidden
                />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-teal-200/50 bg-gradient-to-b from-white to-teal-100/35 p-6 shadow-md ring-1 ring-teal-200/35">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Award className="h-4 w-4 text-teal-600" aria-hidden />
              Status
            </h3>
            <div
              className={`flex items-start gap-3 rounded-md border px-3 py-3 ${
                isOpen
                  ? 'border-teal-300/85 bg-teal-100/55'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  isOpen ? 'bg-teal-200/80' : 'bg-slate-200'
                }`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${isOpen ? 'text-teal-700' : 'text-slate-600'}`}
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {isOpen ? 'Open for applications' : 'Applications closed'}
                </p>
                <p className={`mt-0.5 text-xs ${isOpen ? 'text-teal-800/90' : 'text-slate-600'}`}>
                  {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'} so far
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
