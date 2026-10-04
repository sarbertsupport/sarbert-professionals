import { useState } from 'react';
import {
  X,
  User,
  Clock,
  Info,
  Clipboard,
  Check,
  AlertCircle,
  Hash,
  MapPin,
  Mail,
  FileText,
  ImageIcon,
} from 'lucide-react';

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

const genderPillClass = (g) => {
  const s = (g || '').toLowerCase();
  if (s === 'male') return 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80';
  if (s === 'female') return 'bg-fuchsia-50 text-fuchsia-900 ring-1 ring-fuchsia-200/80';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
};

const formatDate = (val) => {
  if (!val) return '—';
  if (Array.isArray(val) && val.length >= 3) {
    const [year, month, day] = val;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return '—';
};

const formatDateTime = (val) => {
  if (!val) return '—';
  if (Array.isArray(val) && val.length >= 3) {
    const [year, month, day, hour = 0, minute = 0] = val;
    return new Date(year, month - 1, day, hour, minute).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? val : d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return '—';
};

export function ClientProfileDetailModal({
  open,
  clientProfile,
  profileLoading,
  profileError,
  onClose,
}) {
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(String(text));
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (!open) return null;

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
        aria-labelledby="client-detail-title"
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
      >
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/80 px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h2
                id="client-detail-title"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                </span>
                Client details
              </h2>
              {clientProfile && (
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span className="font-medium text-slate-800">{dash(clientProfile.fullName)}</span>
                  {clientProfile.id != null && (
                    <>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="font-mono text-xs text-slate-500">Client #{clientProfile.id}</span>
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
              <p className="text-xs font-medium text-slate-600">Loading client details…</p>
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
          ) : clientProfile ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-1 sm:gap-x-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {clientProfile.gender ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${genderPillClass(clientProfile.gender)}`}
                        >
                          {clientProfile.gender}
                        </span>
                      ) : null}
                      {clientProfile.username ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200/80">
                          @{clientProfile.username}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex min-w-0 max-w-full items-center gap-1.5 text-xs sm:border-l sm:border-slate-200 sm:pl-3">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate font-medium text-slate-900">{dash(clientProfile.email)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-slate-200/80 pt-2 text-left sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Location</p>
                    <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900 sm:max-w-xs">
                      {dash(clientProfile.location)}
                    </p>
                    {clientProfile.postalCode ? (
                      <p className="text-[11px] text-slate-500">{clientProfile.postalCode}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <SectionCard icon={Hash} title="Identifiers">
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">Client profile ID</p>
                      <CopyMono
                        value={clientProfile.id != null ? String(clientProfile.id) : '—'}
                        copied={copiedClientId}
                        showCopy={clientProfile.id != null}
                        onCopy={() => copyToClipboard(clientProfile.id, setCopiedClientId)}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">User ID</p>
                      <CopyMono
                        value={clientProfile.userId != null ? String(clientProfile.userId) : '—'}
                        copied={copiedUserId}
                        showCopy={clientProfile.userId != null}
                        onCopy={() => copyToClipboard(clientProfile.userId, setCopiedUserId)}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={Mail} title="Contact & account">
                  <div>
                    <DetailRow label="Email">
                      {clientProfile.email ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end">
                          <span className="break-all text-left sm:text-right">{clientProfile.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(clientProfile.email, setCopiedEmail)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                            title="Copy email"
                          >
                            {copiedEmail ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Clipboard className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </DetailRow>
                    <DetailRow label="Username">{dash(clientProfile.username)}</DetailRow>
                    <DetailRow label="Phone">
                      <span className="font-mono text-xs sm:text-sm">{dash(clientProfile.phoneNumber)}</span>
                    </DetailRow>
                    <DetailRow label="Location" dense>
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span>{dash(clientProfile.location)}</span>
                        {clientProfile.postalCode ? (
                          <span className="text-slate-500">· {clientProfile.postalCode}</span>
                        ) : null}
                      </span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={User} title="Personal">
                  <div>
                    <DetailRow label="Full name">{dash(clientProfile.fullName)}</DetailRow>
                    <DetailRow label="Gender">{dash(clientProfile.gender)}</DetailRow>
                    <DetailRow label="Birthdate">
                      <span className="tabular-nums">{formatDate(clientProfile.birthdate)}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={Clock} title="Timeline">
                  <div>
                    <DetailRow label="Joined">
                      <span className="tabular-nums text-slate-800">{formatDateTime(clientProfile.createdAt)}</span>
                    </DetailRow>
                    <DetailRow label="Last updated">
                      <span className="tabular-nums text-slate-800">{formatDateTime(clientProfile.updatedAt)}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                {clientProfile.bio ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={Info} title="Bio">
                      <p className="rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-800 ring-1 ring-slate-100/80 whitespace-pre-wrap">
                        {clientProfile.bio}
                      </p>
                    </SectionCard>
                  </div>
                ) : null}

                {clientProfile.imagePath ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={ImageIcon} title="Profile image">
                      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                        <img
                          src={clientProfile.imagePath}
                          alt=""
                          className="h-28 w-28 rounded-full border-4 border-slate-100 object-cover shadow-sm ring-1 ring-slate-200/80"
                          loading="lazy"
                        />
                        <a
                          href={clientProfile.imagePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Open full image
                        </a>
                      </div>
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

        {clientProfile ? (
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
