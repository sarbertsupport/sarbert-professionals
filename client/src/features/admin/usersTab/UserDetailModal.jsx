import { useState } from 'react';
import {
  X,
  User,
  Settings,
  Lock,
  Unlock,
  Clipboard,
  Check,
  AlertCircle,
  Hash,
  Mail,
  FileText,
  Clock,
  Shield,
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

const activePillClass = (active) =>
  active
    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80';

const lockedPillClass = (locked) =>
  locked
    ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
    : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';

const rolePillClass = (role) => {
  const r = (role || '').toUpperCase();
  if (r.includes('ADMIN')) return 'bg-violet-50 text-violet-900 ring-1 ring-violet-200/80';
  if (r.includes('TUTOR')) return 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80';
  if (r.includes('STUDENT')) return 'bg-teal-50 text-teal-900 ring-1 ring-teal-200/80';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
};

const formatDateTime = (val) => {
  if (val == null || val === '') return '—';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, M, d, h = 0, m = 0] = val;
    return new Date(y, M - 1, d, h, m).toLocaleString('en-US', {
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

export const UserDetailModal = ({
  open,
  selectedUser,
  loading,
  error,
  onClose,
  onRoleAssignment,
  onToggleStatus,
}) => {
  const [copiedId, setCopiedId] = useState(false);
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
        aria-labelledby="user-detail-title"
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
      >
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/80 px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h2
                id="user-detail-title"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                </span>
                User details
              </h2>
              {selectedUser && (
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span className="font-medium text-slate-800">{dash(selectedUser.username)}</span>
                  {selectedUser.id != null && (
                    <>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="font-mono text-xs text-slate-500">User #{selectedUser.id}</span>
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {selectedUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => onRoleAssignment(selectedUser.id)}
                    className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-white/80 hover:text-indigo-800"
                    title="Update role"
                  >
                    <Settings className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(selectedUser.id)}
                    className={`rounded-lg p-1.5 transition-colors hover:bg-white/80 ${
                      selectedUser.activeStatus
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                    title={selectedUser.activeStatus ? 'Disable user' : 'Enable user'}
                  >
                    {selectedUser.activeStatus ? (
                      <Lock className="h-4 w-4" aria-hidden />
                    ) : (
                      <Unlock className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/80 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
                aria-hidden
              />
              <p className="text-xs font-medium text-slate-600">Loading user details…</p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md py-4 text-center">
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-red-500" aria-hidden />
                <p className="text-sm font-semibold text-red-900">Could not load user</p>
                <p className="mt-1.5 text-xs leading-relaxed text-red-700/90">{error}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-1 sm:gap-x-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${rolePillClass(selectedUser.roleName)}`}
                      >
                        {dash(selectedUser.roleName)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${activePillClass(!!selectedUser.activeStatus)}`}
                      >
                        {selectedUser.activeStatus ? 'Active' : 'Inactive'}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${lockedPillClass(!!selectedUser.locked)}`}
                      >
                        {selectedUser.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>
                    <div className="flex min-w-0 max-w-full items-center gap-1.5 text-xs sm:border-l sm:border-slate-200 sm:pl-3">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate font-medium text-slate-900">{dash(selectedUser.email)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-slate-200/80 pt-2 text-left sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Username</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">{dash(selectedUser.username)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <SectionCard icon={Hash} title="Identifiers">
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">User ID</p>
                      <CopyMono
                        value={selectedUser.id != null ? String(selectedUser.id) : '—'}
                        copied={copiedId}
                        showCopy={selectedUser.id != null}
                        onCopy={() => copyToClipboard(selectedUser.id, setCopiedId)}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={Mail} title="Contact">
                  <div>
                    <DetailRow label="Email">
                      {selectedUser.email ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end">
                          <span className="break-all text-left sm:text-right">{selectedUser.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedUser.email, setCopiedEmail)}
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
                    <DetailRow label="Username">
                      <span className="font-mono text-xs sm:text-sm">{dash(selectedUser.username)}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={Shield} title="Role & flags">
                  <div>
                    <DetailRow label="Role">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${rolePillClass(selectedUser.roleName)}`}
                      >
                        {dash(selectedUser.roleName)}
                      </span>
                    </DetailRow>
                    <DetailRow label="Profile step">{dash(selectedUser.currentStep)}</DetailRow>
                    <DetailRow label="Login attempts">
                      <span className="tabular-nums">{selectedUser.loginAttempts ?? '—'}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                <SectionCard icon={Clock} title="Activity">
                  <div>
                    <DetailRow label="Created">
                      <span className="tabular-nums text-slate-800">
                        {formatDateTime(selectedUser.createdAt)}
                      </span>
                    </DetailRow>
                    <DetailRow label="Last login">
                      <span className="tabular-nums text-slate-800">
                        {formatDateTime(selectedUser.lastLoginAt)}
                      </span>
                    </DetailRow>
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-md py-6 text-center">
              <p className="text-sm text-slate-600">No user data to display.</p>
            </div>
          )}
        </div>

        {selectedUser && !loading && !error ? (
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
          !loading &&
          !error && (
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
};
