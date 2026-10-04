import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  LifeBuoy,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import {
  fetchAdminSupportSummary,
  fetchAdminSupportTickets,
  fetchAdminSupportTicketDetail,
  updateAdminSupportTicket,
  postAdminSupportReply,
  logSupportError,
} from '../../components/services/supportService';
import { formatApiDateTime } from '../../utils/apiDateTime';
import { supportStatusBadgeClass, supportPriorityBadgeClass } from '../../utils/supportBadgeStyles';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'WAITING_CUSTOMER', label: 'Awaiting customer' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    slate: 'from-slate-500 to-slate-600',
    sky: 'from-sky-500 to-blue-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-red-600',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
      <div
        className={`rounded-lg p-2.5 bg-gradient-to-br ${tones[tone] || tones.slate} text-white shadow`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
      </div>
    </div>
  );
}

export default function SupportTab() {
  const [summary, setSummary] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    status: 'ALL',
    q: '',
    slaBreached: false,
    resolutionSlaBreached: false,
    unreadOnly: false,
  });
  const [drawerTicket, setDrawerTicket] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [internalOnly, setInternalOnly] = useState(false);
  const [sending, setSending] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchAdminSupportSummary();
      setSummary(s);
    } catch (e) {
      logSupportError('Admin support summary', e);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setListLoading(true);
    try {
      const params = {
        page,
        pageSize: 15,
        q: filters.q || undefined,
        status: filters.status === 'ALL' ? undefined : filters.status,
        slaBreached: filters.slaBreached || undefined,
        resolutionSlaBreached: filters.resolutionSlaBreached || undefined,
        unreadOnly: filters.unreadOnly || undefined,
      };
      const data = await fetchAdminSupportTickets(params);
      setItems(data?.items || []);
      setTotalPages(Number(data?.totalPages) || 1);
    } catch (e) {
      logSupportError('Admin support list', e);
      toast.error('Could not load tickets');
    } finally {
      setListLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openDrawer = async (row) => {
    setDrawerTicket({ ticket: row, messages: [] });
    setReplyText('');
    setInternalOnly(false);
    setDrawerLoading(true);
    try {
      const data = await fetchAdminSupportTicketDetail(row.ticketUuid);
      setDrawerTicket(data);
      loadSummary();
      loadTickets();
    } catch (e) {
      logSupportError('Admin ticket detail', e);
      toast.error('Could not load ticket');
      setDrawerTicket(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  const applyStatus = async (status) => {
    if (!drawerTicket?.ticket?.ticketUuid) return;
    try {
      await updateAdminSupportTicket(drawerTicket.ticket.ticketUuid, { status });
      toast.success('Ticket updated');
      await openDrawer(drawerTicket.ticket);
      loadSummary();
      loadTickets();
    } catch (e) {
      logSupportError('Update ticket', e);
      toast.error('Update failed');
    }
  };

  const sendReply = async () => {
    if (!drawerTicket?.ticket?.ticketUuid || !replyText.trim()) return;
    setSending(true);
    try {
      await postAdminSupportReply(drawerTicket.ticket.ticketUuid, replyText.trim(), internalOnly);
      toast.success(internalOnly ? 'Internal note saved' : 'Reply sent');
      setReplyText('');
      await openDrawer(drawerTicket.ticket);
      loadSummary();
      loadTickets();
    } catch (e) {
      logSupportError('Admin reply', e);
      toast.error(e?.response?.data?.body?.headers?.customerMessage || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <StatCard icon={Inbox} label="Open" value={summary?.openTickets} tone="rose" />
        <StatCard icon={Clock} label="In progress" value={summary?.inProgressTickets} tone="slate" />
        <StatCard icon={LifeBuoy} label="Awaiting customer" value={summary?.waitingCustomerTickets} tone="amber" />
        <StatCard icon={CheckCircle2} label="Resolved" value={summary?.resolvedTickets} tone="emerald" />
        <StatCard icon={AlertTriangle} label="First-response SLA breach" value={summary?.firstResponseSlaBreached} tone="rose" />
        <StatCard icon={AlertTriangle} label="Resolution SLA breach" value={summary?.resolutionSlaBreached} tone="rose" />
        <StatCard icon={Inbox} label="Needs attention (unread)" value={summary?.unreadByAdminTickets} tone="amber" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-slate-500">Search</label>
          <div className="relative mt-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
              placeholder="Subject or ticket ID"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              maxLength={200}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(1), loadTickets())}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            className="mt-1 w-full lg:w-48 rounded-lg border border-slate-200 text-sm py-2 px-3"
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.slaBreached}
            onChange={(e) => {
              setFilters((f) => ({ ...f, slaBreached: e.target.checked }));
              setPage(1);
            }}
          />
          First-response SLA breached
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.resolutionSlaBreached}
            onChange={(e) => {
              setFilters((f) => ({ ...f, resolutionSlaBreached: e.target.checked }));
              setPage(1);
            }}
          />
          Resolution SLA breached
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(e) => {
              setFilters((f) => ({ ...f, unreadOnly: e.target.checked }));
              setPage(1);
            }}
          />
          Unread only
        </label>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            loadTickets();
            loadSummary();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">SLA</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No tickets match filters
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.ticketUuid}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => openDrawer(row)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 line-clamp-1">{row.subject}</div>
                      <div className="text-xs text-slate-500 font-mono">{row.ticketUuid}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.customerEmail || row.userId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${supportStatusBadgeClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                      {row.unreadByAdmin && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500" title="Unread" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${supportPriorityBadgeClass(
                          row.priority
                        )}`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.firstResponseSlaBreached && (
                        <span className="text-rose-600 font-medium">First response</span>
                      )}
                      {row.resolutionSlaBreached && (
                        <span className="text-rose-600 font-medium block">Resolution</span>
                      )}
                      {!row.firstResponseSlaBreached && !row.resolutionSlaBreached && (
                        <span className="text-slate-400">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatApiDateTime(row.createdAt) || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
          <span className="text-slate-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {drawerTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-200">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 pr-2 line-clamp-2">
                  {drawerTicket.ticket?.subject}
                </h3>
                {drawerTicket.ticket && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${supportStatusBadgeClass(
                        drawerTicket.ticket.status
                      )}`}
                    >
                      {drawerTicket.ticket.status}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${supportPriorityBadgeClass(
                        drawerTicket.ticket.priority
                      )}`}
                    >
                      {drawerTicket.ticket.priority}
                    </span>
                  </div>
                )}
              </div>
              <button type="button" className="p-2 rounded-lg hover:bg-slate-100 shrink-0" onClick={() => setDrawerTicket(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {drawerLoading ? (
              <div className="p-6 text-slate-500">Loading…</div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 text-sm space-y-2 bg-slate-50">
                  <div className="flex flex-wrap gap-2">
                    <code className="text-xs bg-white border rounded px-2 py-0.5">{drawerTicket.ticket?.ticketUuid}</code>
                    <span className="text-slate-600">{drawerTicket.ticket?.customerEmail}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                      onClick={() => applyStatus('IN_PROGRESS')}
                    >
                      In progress
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900"
                      onClick={() => applyStatus('WAITING_CUSTOMER')}
                    >
                      Request info
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900"
                      onClick={() => applyStatus('RESOLVED')}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-slate-200 border border-slate-300"
                      onClick={() => applyStatus('CLOSED')}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(drawerTicket.messages || []).map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg px-3 py-2 text-sm border ${
                        m.internalNote
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : m.authorRole === 'CUSTOMER'
                            ? 'bg-sky-50 border-sky-100'
                            : m.authorRole === 'SYSTEM'
                              ? 'bg-slate-100 border-slate-200 text-center text-xs text-slate-600'
                              : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] uppercase text-slate-500 mb-1">
                        {m.authorRole}
                        {m.internalNote ? ' · internal' : ''} ·{' '}
                        {formatApiDateTime(m.createdAt) || '—'}
                      </div>
                      <div className="whitespace-pre-wrap">{m.body}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200 space-y-2 bg-white">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={internalOnly}
                      onChange={(e) => setInternalOnly(e.target.checked)}
                    />
                    Internal note (customer does not see)
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 text-sm min-h-[88px] px-3 py-2"
                    placeholder="Reply or internal note…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={20000}
                  />
                  <button
                    type="button"
                    disabled={sending || !replyText.trim()}
                    onClick={sendReply}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
