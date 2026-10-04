import { useState } from 'react';
import {
  X,
  User,
  DollarSign,
  Settings,
  Clock,
  BookOpen,
  Info,
  Clipboard,
  Check,
  AlertCircle,
  Hash,
  MapPin,
  Mail,
  Phone,
  FileText,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

const formatMoney = (amount, fallback = '—') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return fallback;
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const boolPillClass = (val) =>
  val
    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80';

const typePillClass = (isCompany) =>
  isCompany
    ? 'bg-violet-50 text-violet-900 ring-1 ring-violet-200/80'
    : 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80';

const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
  <section
    className={`rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden ${className}`}
  >
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden />}
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
    </div>
    <div className="p-3">{children}</div>
  </section>
);

const DetailRow = ({ label, children, dense }) => (
  <div
    className={`flex flex-col gap-0.5 ${dense ? '' : 'sm:flex-row sm:items-start sm:gap-3 sm:justify-between'} py-2 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0`}
  >
    <div className="text-[11px] font-medium text-slate-500 shrink-0 sm:w-32">{label}</div>
    <div
      className={`text-sm text-slate-900 min-w-0 leading-snug ${dense ? '' : 'sm:flex-1 sm:text-right'}`}
    >
      {children}
    </div>
  </div>
);

const CopyMono = ({ value, copied, onCopy, showCopy = true }) => (
  <div className="flex items-start gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100/80">
    <p className="flex-1 min-w-0 break-all font-mono text-[11px] text-slate-800 leading-snug">{value}</p>
    {showCopy ? (
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 rounded p-1 text-slate-400 hover:bg-white hover:text-indigo-600 transition-colors"
        title="Copy"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
      </button>
    ) : null}
  </div>
);

const dash = (v) => (v == null || v === '' ? '—' : v);

const formatBirthdate = (bd) => {
  if (!bd) return '—';
  if (Array.isArray(bd) && bd.length >= 3) {
    const [y, m, d] = bd;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }
  if (typeof bd === 'string') return bd;
  return '—';
};

const yearFrom = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal) && dateVal.length) return dateVal[0];
  return null;
};

const yearRange = (start, end, currentJob) => {
  const a = yearFrom(start);
  const b = yearFrom(end);
  if (a != null && b != null) return `${a} – ${b}`;
  if (a != null) return currentJob ? `${a} – Present` : `${a}`;
  return '—';
};

export function TeacherProfileDetailModal({
  open,
  teacherProfile,
  profileLoading,
  profileError,
  onClose,
}) {
  const [copiedTeacherId, setCopiedTeacherId] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(String(text));
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (!open) return null;

  const feeLabel =
    teacherProfile?.minFee != null && teacherProfile?.maxFee != null
      ? `${formatMoney(teacherProfile.minFee)} – ${formatMoney(teacherProfile.maxFee)}`
      : '—';

  const isCompanyProfile =
    teacherProfile &&
    (teacherProfile.isCompany === true || teacherProfile.company === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="professional-detail-title"
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
      >
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/80 px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h2
                id="professional-detail-title"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                </span>
                Professional details
              </h2>
              {teacherProfile && (
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span className="font-medium text-slate-800">{dash(teacherProfile.displayName)}</span>
                  {teacherProfile.teacherId != null && (
                    <>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="font-mono text-xs text-slate-500">Teacher #{teacherProfile.teacherId}</span>
                    </>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/80 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {profileLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
                aria-hidden
              />
              <p className="text-xs font-medium text-slate-600">Loading professional details…</p>
            </div>
          ) : profileError ? (
            <div className="mx-auto max-w-md py-4 text-center">
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-red-500" aria-hidden />
                <p className="text-sm font-semibold text-red-900">Could not load profile</p>
                <p className="mt-1.5 text-xs leading-relaxed text-red-700/90">{profileError}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : teacherProfile ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-1 sm:gap-x-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${typePillClass(isCompanyProfile)}`}
                      >
                        {isCompanyProfile ? 'Company' : 'Individual'}
                      </span>
                      {teacherProfile.rate ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200/80">
                          {String(teacherProfile.rate).replace(/_/g, ' ')}
                        </span>
                      ) : null}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.subjects?.length)}`}
                      >
                        {teacherProfile.subjects?.length ?? 0} subjects
                      </span>
                    </div>
                    <div className="flex min-w-0 max-w-full items-center gap-1.5 text-xs sm:border-l sm:border-slate-200 sm:pl-3">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate font-medium text-slate-900">
                        {teacherProfile.email || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-slate-200/80 pt-2 text-left sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Fee range</p>
                    <p className="font-mono text-xl font-bold tabular-nums leading-tight tracking-tight text-slate-900 sm:text-2xl">
                      {feeLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <SectionCard icon={Hash} title="Identifiers">
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">Teacher ID</p>
                      <CopyMono
                        value={teacherProfile.teacherId != null ? String(teacherProfile.teacherId) : '—'}
                        copied={copiedTeacherId}
                        showCopy={teacherProfile.teacherId != null}
                        onCopy={() => copyToClipboard(teacherProfile.teacherId, setCopiedTeacherId)}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">User ID</p>
                      <CopyMono
                        value={teacherProfile.userId != null ? String(teacherProfile.userId) : '—'}
                        copied={copiedUserId}
                        showCopy={teacherProfile.userId != null}
                        onCopy={() => copyToClipboard(teacherProfile.userId, setCopiedUserId)}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={User} title="Contact">
                  <div>
                    <DetailRow label="Email">
                      <span className="break-all">{dash(teacherProfile.email)}</span>
                    </DetailRow>
                    <DetailRow label="Phone">
                      <span className="font-mono text-xs sm:text-sm">{dash(teacherProfile.phoneNumber)}</span>
                    </DetailRow>
                    <DetailRow label="Location" dense>
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span>{dash(teacherProfile.location)}</span>
                        {teacherProfile.postalCode ? (
                          <span className="text-slate-500">· {teacherProfile.postalCode}</span>
                        ) : null}
                      </span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={DollarSign} title="Rates & experience">
                  <div>
                    <DetailRow label="Rate type">
                      <span className="capitalize">{dash(teacherProfile.rate?.replace?.(/_/g, ' ') || teacherProfile.rate)}</span>
                    </DetailRow>
                    <DetailRow label="Minimum fee">
                      <span className="font-mono tabular-nums font-semibold">{formatMoney(teacherProfile.minFee)}</span>
                    </DetailRow>
                    <DetailRow label="Maximum fee">
                      <span className="font-mono tabular-nums font-semibold">{formatMoney(teacherProfile.maxFee)}</span>
                    </DetailRow>
                    <DetailRow label="Total experience">
                      {dash(
                        teacherProfile.totalExpYears != null ? `${teacherProfile.totalExpYears} yrs` : null
                      )}
                    </DetailRow>
                    <DetailRow label="Online experience">
                      {dash(
                        teacherProfile.onlineExpYears != null ? `${teacherProfile.onlineExpYears} yrs` : null
                      )}
                    </DetailRow>
                    <DetailRow label="Travel distance">
                      {dash(
                        teacherProfile.travelDistance != null ? `${teacherProfile.travelDistance} km` : null
                      )}
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={Settings} title="Professional options">
                  <div>
                    <DetailRow label="Digital pen">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.digitalPen)}`}
                      >
                        {teacherProfile.digitalPen ? 'Yes' : 'No'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Homework help">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.homeworkHelp)}`}
                      >
                        {teacherProfile.homeworkHelp ? 'Yes' : 'No'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Currently employed">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.currentlyEmployed)}`}
                      >
                        {teacherProfile.currentlyEmployed ? 'Yes' : 'No'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Work preference">{dash(teacherProfile.workPreference)}</DetailRow>
                    <DetailRow label="Company" dense>
                      <p className="text-xs leading-snug">
                        {dash(teacherProfile.companyName)}
                        {teacherProfile.role ? (
                          <span className="text-slate-500"> · {teacherProfile.role}</span>
                        ) : null}
                      </p>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={Clock} title="Availability">
                  <div>
                    <DetailRow label="Online">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.onlineAvailability)}`}
                      >
                        {teacherProfile.onlineAvailability ? 'Available' : 'Not available'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Home visits">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.homeAvailability)}`}
                      >
                        {teacherProfile.homeAvailability ? 'Available' : 'Not available'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Willing to travel">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${boolPillClass(!!teacherProfile.travelWillingness)}`}
                      >
                        {teacherProfile.travelWillingness ? 'Yes' : 'No'}
                      </span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={BookOpen} title="Subjects">
                  {teacherProfile.subjects?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {teacherProfile.subjects.map((subject, index) => (
                        <span
                          key={subject.subjectId ?? index}
                          className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-900 ring-1 ring-indigo-100"
                        >
                          {subject.subjectName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No subjects listed.</p>
                  )}
                </SectionCard>

                {teacherProfile.educations?.length ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={GraduationCap} title={`Education (${teacherProfile.educations.length})`}>
                      <ul className="space-y-2">
                        {teacherProfile.educations.map((edu, index) => (
                          <li
                            key={index}
                            className="rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-xs"
                          >
                            <p className="font-semibold text-slate-900">{dash(edu.degreeName)}</p>
                            <p className="mt-0.5 text-slate-600">
                              {dash(edu.degreeType)} · {dash(edu.institutionName)}
                            </p>
                            {edu.specialization ? (
                              <p className="mt-0.5 text-[11px] text-indigo-700">Specialization: {edu.specialization}</p>
                            ) : null}
                            <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-slate-500">
                              <span>{yearRange(edu.startDate, edu.endDate, false)}</span>
                              {edu.score != null && edu.score !== '' ? (
                                <span className="text-slate-600">GPA: {edu.score}</span>
                              ) : null}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  </div>
                ) : null}

                {teacherProfile.experiences?.length ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={Briefcase} title={`Work experience (${teacherProfile.experiences.length})`}>
                      <ul className="space-y-2">
                        {teacherProfile.experiences.map((exp, index) => (
                          <li
                            key={index}
                            className="rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-xs"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{dash(exp.designation)}</p>
                                <p className="text-slate-600">{dash(exp.organizationName)}</p>
                              </div>
                              <div className="shrink-0 text-right text-[11px] text-slate-500">
                                {yearRange(exp.startDate, exp.endDate, exp.currentJob)}
                                {exp.currentJob ? (
                                  <span className="ml-1.5 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                                    Current
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {exp.jobDescription ? (
                              <p className="mt-2 whitespace-pre-wrap rounded-md bg-white/80 p-2 text-[11px] leading-snug text-slate-700 ring-1 ring-slate-100/80">
                                {exp.jobDescription}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  </div>
                ) : null}

                <SectionCard icon={Phone} title="Payment terms">
                  <p className="rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-snug text-slate-800 ring-1 ring-slate-100/80">
                    {dash(teacherProfile.paymentDetails)}
                  </p>
                </SectionCard>

                <SectionCard icon={Info} title="Personal">
                  <div>
                    <DetailRow label="Gender">{dash(teacherProfile.gender)}</DetailRow>
                    <DetailRow label="Birth date">
                      <span className="tabular-nums">{formatBirthdate(teacherProfile.birthdate)}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                {teacherProfile.profileDescription ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={Info} title="About">
                      <p className="rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-800 ring-1 ring-slate-100/80 whitespace-pre-wrap">
                        {teacherProfile.profileDescription}
                      </p>
                    </SectionCard>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-md py-6 text-center">
              <p className="text-sm text-slate-600">No profile data to display.</p>
            </div>
          )}
        </div>

        {teacherProfile ? (
          <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:flex-row sm:justify-end sm:px-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        ) : (
          !profileLoading &&
          !profileError && (
            <div className="shrink-0 border-t border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 sm:w-auto sm:ml-auto sm:flex"
              >
                Close
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
