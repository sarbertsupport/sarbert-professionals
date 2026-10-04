import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  createSupportTicket,
  fetchMySupportTickets,
  fetchSupportTicketDetail,
  postCustomerSupportReply,
  logSupportError,
} from '../../components/services/supportService';
import { supportTicketFormSchema, supportReplySchema } from './supportFormSchemas';
import { formatApiDateTime } from '../../utils/apiDateTime';
import { supportStatusBadgeClass, supportPriorityBadgeClass } from '../../utils/supportBadgeStyles';

const NEW_TICKET_DEFAULTS = {
  subject: '',
  category: 'GENERAL',
  priority: 'NORMAL',
  message: '',
};

const STATUS_LABEL = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_CUSTOMER: 'Awaiting your reply',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export default function SupportCenter() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [replyError, setReplyError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: ticketErrors, isSubmitting: creatingTicket },
  } = useForm({
    resolver: zodResolver(supportTicketFormSchema),
    defaultValues: NEW_TICKET_DEFAULTS,
    mode: 'onTouched',
  });

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchMySupportTickets();
      setTickets(Array.isArray(list) ? list : []);
    } catch (e) {
      logSupportError('Support list', e);
      toast.error('Could not load your support tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = async (uuid) => {
    setSelectedUuid(uuid);
    try {
      const data = await fetchSupportTicketDetail(uuid);
      setDetail(data);
      setReplyText('');
    } catch (e) {
      logSupportError('Support detail', e);
      toast.error('Could not load ticket.');
    }
  };

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (showNew) {
      reset(NEW_TICKET_DEFAULTS);
    }
  }, [showNew, reset]);

  const terminal = detail?.ticket && ['RESOLVED', 'CLOSED'].includes(detail.ticket.status);

  const handleSendReply = async () => {
    setReplyError('');
    const parsed = supportReplySchema.safeParse({ message: replyText });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.message?.[0] ?? 'Invalid message';
      setReplyError(msg);
      return;
    }
    if (!selectedUuid) return;
    setSending(true);
    try {
      await postCustomerSupportReply(selectedUuid, parsed.data.message);
      toast.success('Message sent');
      const data = await fetchSupportTicketDetail(selectedUuid);
      setDetail(data);
      setReplyText('');
      setReplyError('');
      loadList();
    } catch (e) {
      logSupportError('Support reply', e);
      toast.error(e?.response?.data?.body?.headers?.customerMessage || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const onCreateTicket = async (values) => {
    try {
      const created = await createSupportTicket({
        subject: values.subject,
        category: values.category,
        priority: values.priority,
        message: values.message,
      });
      toast.success('Ticket created');
      setShowNew(false);
      reset(NEW_TICKET_DEFAULTS);
      await loadList();
      if (created?.ticketUuid) {
        await loadDetail(created.ticketUuid);
      }
    } catch (err) {
      logSupportError('Create ticket', err);
      toast.error('Could not create ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-8 h-8 text-sky-600" />
              Support center
            </h1>
            <p className="text-slate-600 mt-1">
              Create a ticket, track status, and chat with our team until your issue is resolved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 text-white px-5 py-3 font-semibold shadow-lg hover:bg-sky-700 transition"
          >
            <Plus className="w-5 h-5" />
            New ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Your tickets</h2>
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Loading…
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600">
                No tickets yet. Start a conversation with support when you need help.
              </div>
            ) : (
              <ul className="space-y-2">
                {tickets.map((t) => (
                  <li key={t.ticketUuid}>
                    <button
                      type="button"
                      onClick={() => loadDetail(t.ticketUuid)}
                      className={`w-full text-left rounded-2xl border p-4 transition shadow-sm hover:shadow-md ${
                        selectedUuid === t.ticketUuid
                          ? 'border-sky-400 bg-sky-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-slate-900 line-clamp-2">{t.subject}</span>
                        {t.unreadByCustomer && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-sky-500" title="New reply" />
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${supportStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {STATUS_LABEL[t.status] || t.status}
                        </span>
                        {t.priority ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${supportPriorityBadgeClass(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        ) : null}
                        {t.firstResponseSlaBreached && (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <AlertTriangle className="w-3 h-3" /> First response SLA
                          </span>
                        )}
                        <span className="text-slate-500">{formatApiDateTime(t.createdAt) || ''}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[420px] flex flex-col">
            {!detail ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
                <p>Select a ticket to view messages</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{detail.ticket.subject}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-medium ${supportStatusBadgeClass(
                        detail.ticket.status
                      )}`}
                    >
                      {STATUS_LABEL[detail.ticket.status] || detail.ticket.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                      {detail.ticket.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${supportPriorityBadgeClass(
                        detail.ticket.priority
                      )}`}
                    >
                      {detail.ticket.priority}
                    </span>
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                      {detail.ticket.ticketUuid}
                    </code>
                  </div>
                  {terminal && (
                    <p className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      This ticket is closed for new messages. Open a new ticket if you still need assistance.
                    </p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px]">
                  {(detail.messages || []).map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl px-4 py-3 text-sm ${
                        m.authorRole === 'CUSTOMER'
                          ? 'ml-8 bg-sky-50 border border-sky-100 text-slate-800'
                          : m.authorRole === 'SYSTEM'
                            ? 'mx-4 bg-amber-50 border border-amber-100 text-amber-900 text-center text-xs'
                            : 'mr-8 bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        {m.authorRole === 'CUSTOMER'
                          ? 'You'
                          : m.authorRole === 'SYSTEM'
                            ? 'System'
                            : 'Support'}{' '}
                        · {formatApiDateTime(m.createdAt) || '—'}
                      </div>
                      <div className="whitespace-pre-wrap">{m.body}</div>
                    </div>
                  ))}
                </div>
                {!terminal && (
                  <div className="border-t border-slate-100 p-4 space-y-2">
                    <textarea
                      className={`w-full rounded-xl border px-3 py-2 text-sm min-h-[96px] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                        replyError ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="Type your reply…"
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        if (replyError) setReplyError('');
                      }}
                      maxLength={20000}
                      aria-invalid={!!replyError}
                      aria-describedby={replyError ? 'reply-error' : undefined}
                    />
                    {replyError ? (
                      <p id="reply-error" className="text-xs text-red-600" role="alert">
                        {replyError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={sending || !replyText.trim()}
                      onClick={handleSendReply}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-sky-700"
                    >
                      <Send className="w-4 h-4" />
                      Send reply
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900">New support ticket</h3>
            <form noValidate onSubmit={handleSubmit(onCreateTicket)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="support-subject" className="block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  id="support-subject"
                  type="text"
                  autoComplete="off"
                  maxLength={500}
                  aria-invalid={!!ticketErrors.subject}
                  aria-describedby={ticketErrors.subject ? 'support-subject-err' : undefined}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    ticketErrors.subject ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('subject')}
                />
                {ticketErrors.subject ? (
                  <p id="support-subject-err" className="mt-1 text-xs text-red-600" role="alert">
                    {ticketErrors.subject.message}
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="support-category" className="block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    id="support-category"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    {...register('category')}
                  >
                    {['GENERAL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'OTHER'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="support-priority" className="block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    id="support-priority"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    {...register('priority')}
                  >
                    {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="support-message" className="block text-sm font-medium text-slate-700">
                  Describe the issue
                </label>
                <textarea
                  id="support-message"
                  maxLength={20000}
                  aria-invalid={!!ticketErrors.message}
                  aria-describedby={ticketErrors.message ? 'support-message-err' : undefined}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm min-h-[120px] ${
                    ticketErrors.message ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...register('message')}
                />
                {ticketErrors.message ? (
                  <p id="support-message-err" className="mt-1 text-xs text-red-600" role="alert">
                    {ticketErrors.message.message}
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200"
                  onClick={() => {
                    reset(NEW_TICKET_DEFAULTS);
                    setShowNew(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white font-semibold disabled:opacity-50"
                >
                  {creatingTicket ? 'Submitting…' : 'Submit ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
