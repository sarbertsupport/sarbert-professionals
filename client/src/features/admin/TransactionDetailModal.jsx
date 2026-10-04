import {
  X,
  User,
  CreditCard,
  Calendar,
  Hash,
  DollarSign,
  Coins,
  ArrowUpRight,
  Clipboard,
  Check,
  FileText,
  Clock,
  AlertCircle,
  Smartphone,
  MessageSquare,
  Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { reconcileMpesaStk } from '../../components/services/dashboardTotals';

const formatMoney = (amount, fallback = '—') => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return fallback;
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusPillClass = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80';
  if (s === 'PENDING') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80';
  if (s === 'FAILED') return 'bg-red-50 text-red-800 ring-1 ring-red-200/80';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
};

const entryPillClass = (entryType) => {
  const t = (entryType || '').toUpperCase();
  if (t === 'DEBIT') return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80';
  if (t === 'CREDIT') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
};

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
    <div className={`text-sm text-slate-900 min-w-0 leading-snug ${dense ? '' : 'sm:flex-1 sm:text-right'}`}>{children}</div>
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

const TransactionDetailModal = ({ isOpen, onClose, transaction, loading, error, onRefreshTransaction }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedPaystackRef, setCopiedPaystackRef] = useState(false);
  const [stkBusy, setStkBusy] = useState(false);
  const [stkMsg, setStkMsg] = useState(null);

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 7) return '—';
    const [year, month, day, hours, minutes, seconds] = dateArray;
    return new Date(year, month - 1, day, hours, minutes, seconds).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(String(text));
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const formatCallbackResponse = (callbackResponse) => {
    if (!callbackResponse) return null;
    try {
      const parsed = JSON.parse(callbackResponse);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return callbackResponse;
    }
  };

  const handleStkReconcile = async () => {
    if (!transaction?.id) return;
    setStkBusy(true);
    setStkMsg(null);
    try {
      const r = await reconcileMpesaStk(transaction.id);
      const extra = r.data?.queryResponse ? ` (ResultCode ${r.data?.queryResponse?.ResultCode ?? '—'})` : '';
      setStkMsg((r.message || 'Request completed') + extra);
      if (onRefreshTransaction) {
        await onRefreshTransaction(transaction.id);
      }
    } catch (e) {
      setStkMsg(e?.message || 'STK query failed');
    } finally {
      setStkBusy(false);
    }
  };

  if (!isOpen) return null;

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
        aria-labelledby="txn-detail-title"
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50/80 px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h2
                id="txn-detail-title"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                </span>
                Transaction details
              </h2>
              {transaction && (
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span>{formatDate(transaction.createdAt)}</span>
                  {transaction.id != null && (
                    <>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="font-mono text-xs text-slate-500">ID {transaction.id}</span>
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

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
                aria-hidden
              />
              <p className="text-xs font-medium text-slate-600">Loading transaction details…</p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md py-4 text-center">
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-red-500" aria-hidden />
                <p className="text-sm font-semibold text-red-900">Could not load transaction</p>
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
          ) : transaction ? (
            <div className="space-y-3">
              {/* Summary */}
              <div className="rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-1 sm:gap-x-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusPillClass(transaction.status)}`}
                      >
                        {transaction.status || 'Unknown'}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${entryPillClass(transaction.entryType)}`}
                      >
                        {transaction.entryType || '—'}
                      </span>
                      {transaction.paymentMethod && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-900 ring-1 ring-violet-200/80">
                          <CreditCard className="h-3 w-3 opacity-80" aria-hidden />
                          {transaction.paymentMethod}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 max-w-full items-center gap-1.5 text-xs sm:border-l sm:border-slate-200 sm:pl-3">
                      <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate font-medium text-slate-900">{transaction.email || '—'}</span>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-slate-200/80 pt-2 text-left sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Final</p>
                    <p className="font-mono text-2xl font-bold tabular-nums leading-tight tracking-tight text-slate-900">
                      {formatMoney(transaction.finalAmount)}
                      {transaction.currency ? (
                        <span className="ml-1 text-sm font-semibold text-slate-500">{transaction.currency}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <SectionCard icon={Hash} title="Identifiers & references">
                  <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">Database record ID</p>
                      <CopyMono
                        value={transaction.id != null ? String(transaction.id) : '—'}
                        copied={copiedId}
                        showCopy={transaction.id != null}
                        onCopy={() => copyToClipboard(transaction.id, setCopiedId)}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-medium text-slate-500">Transaction UUID</p>
                      {transaction.transactionUuid ? (
                        <CopyMono
                          value={transaction.transactionUuid}
                          copied={copiedUuid}
                          onCopy={() => copyToClipboard(transaction.transactionUuid, setCopiedUuid)}
                        />
                      ) : (
                        <p className="rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-500 ring-1 ring-slate-100/80">
                          —
                        </p>
                      )}
                    </div>
                    {transaction.paystackReference ? (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-slate-500">Paystack reference</p>
                        <CopyMono
                          value={transaction.paystackReference}
                          copied={copiedPaystackRef}
                          onCopy={() =>
                            copyToClipboard(transaction.paystackReference, setCopiedPaystackRef)
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard icon={DollarSign} title="Financial breakdown">
                  <div>
                    <DetailRow label="Original amount">
                      <span className="font-mono tabular-nums font-semibold">
                        {formatMoney(transaction.originalAmount)}
                      </span>
                    </DetailRow>
                    <DetailRow label="Discount">
                      <span className="font-mono tabular-nums">
                        {transaction.discountPercentage != null && transaction.discountPercentage !== ''
                          ? `${transaction.discountPercentage}%`
                          : '—'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Coins">
                      <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 ring-1 ring-amber-100">
                          <Coins className="h-3.5 w-3.5 text-amber-700" aria-hidden />
                        </span>
                        {transaction.coins != null ? `${Number(transaction.coins).toLocaleString()} coins` : '—'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Description" dense>
                      <p className="rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-snug text-slate-800 ring-1 ring-slate-100/80">
                        {transaction.description || '—'}
                      </p>
                    </DetailRow>
                    {transaction.notes ? (
                      <DetailRow label="Internal notes" dense>
                        <p className="rounded-md border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-xs leading-snug text-slate-800">
                          {transaction.notes}
                        </p>
                      </DetailRow>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard icon={Receipt} title="Payment & rails">
                  <div>
                    <DetailRow label="Method">
                      {transaction.paymentMethod ? (
                        <span className="font-medium">{transaction.paymentMethod}</span>
                      ) : (
                        '—'
                      )}
                    </DetailRow>
                    <DetailRow label="Gateway payment ID">
                      {transaction.stripePaymentId ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="break-all font-mono text-xs text-slate-800">{transaction.stripePaymentId}</span>
                          <a
                            href={`https://dashboard.paystack.com/transactions/${transaction.stripePaymentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-100"
                          >
                            Open in Paystack
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-500">Not linked</span>
                      )}
                    </DetailRow>
                    {String(transaction.paymentMethod || '').toUpperCase() === 'MPESA' ? (
                      <DetailRow label="M-Pesa (STK)" dense>
                        <div className="space-y-2 rounded-md bg-slate-50/80 p-2 ring-1 ring-slate-100/80">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            <Smartphone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                            Mobile money
                          </div>
                          {transaction.mpesaCheckoutRequestId ? (
                            <p className="break-all font-mono text-[11px] text-slate-900">
                              CheckoutRequestID: {transaction.mpesaCheckoutRequestId}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500">No checkout id yet (STK not accepted or pending save).</p>
                          )}
                          {transaction.mpesaMerchantRequestId ? (
                            <p className="break-all font-mono text-[11px] text-slate-700">
                              MerchantRequestID: {transaction.mpesaMerchantRequestId}
                            </p>
                          ) : null}
                          {transaction.mpesaReceiptNumber ? (
                            <p className="font-mono text-xs text-slate-900">
                              Receipt: {transaction.mpesaReceiptNumber}
                            </p>
                          ) : null}
                          {transaction.mpesaPhoneNumber ? (
                            <p className="font-mono text-xs text-slate-900">
                              Phone: {transaction.mpesaPhoneNumber}
                            </p>
                          ) : null}
                          {(transaction.mpesaResultCode != null && transaction.mpesaResultCode !== '') ||
                          (transaction.mpesaResultDesc != null && transaction.mpesaResultDesc !== '') ? (
                            <p className="text-[11px] text-slate-700">
                              Last result:{' '}
                              <span className="font-mono">{transaction.mpesaResultCode ?? '—'}</span>
                              {transaction.mpesaResultDesc ? ` — ${transaction.mpesaResultDesc}` : ''}
                            </p>
                          ) : null}
                          {transaction.mpesaLastStkQueryAt ? (
                            <p className="text-[10px] text-slate-500">
                              Last STK query: {formatDate(transaction.mpesaLastStkQueryAt)}
                            </p>
                          ) : null}
                          {transaction.mpesaCheckoutRequestId ? (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleStkReconcile}
                                disabled={stkBusy}
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {stkBusy ? 'Querying Safaricom…' : 'Query status (STK v2)'}
                              </button>
                              <span className="text-[10px] leading-snug text-slate-500">
                                Waits ~60s after STK initiation before the API returns reliable results. Use if the callback
                                was missed.
                              </span>
                            </div>
                          ) : null}
                          {stkMsg ? (
                            <p className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800">
                              {stkMsg}
                            </p>
                          ) : null}
                        </div>
                      </DetailRow>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard icon={Calendar} title="Timeline">
                  <div>
                    <DetailRow label="Created">
                      <span className="tabular-nums text-slate-800">{formatDate(transaction.createdAt)}</span>
                    </DetailRow>
                    <DetailRow label="Last updated">
                      <span className="tabular-nums text-slate-800">{formatDate(transaction.updatedAt)}</span>
                    </DetailRow>
                  </div>
                </SectionCard>

                {transaction.mpesaStkQueryResponse ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={MessageSquare} title="Last STK query (v2) response">
                      <p className="mb-2 text-[11px] leading-snug text-slate-500">
                        Raw Safaricom STK Push Query response (admin reconciliation).
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 shadow-inner">
                        <pre className="max-h-52 overflow-y-auto p-2.5 text-[11px] leading-snug text-cyan-400/95">
                          {formatCallbackResponse(transaction.mpesaStkQueryResponse)}
                        </pre>
                      </div>
                    </SectionCard>
                  </div>
                ) : null}

                {transaction.callbackResponse ? (
                  <div className="lg:col-span-2">
                    <SectionCard icon={MessageSquare} title="Callback payload">
                      <p className="mb-2 text-[11px] leading-snug text-slate-500">
                        Raw provider callback (JSON). For debugging and reconciliation only.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 shadow-inner">
                        <pre className="max-h-52 overflow-y-auto p-2.5 text-[11px] leading-snug text-emerald-400/95">
                          {formatCallbackResponse(transaction.callbackResponse)}
                        </pre>
                      </div>
                    </SectionCard>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {transaction ? (
          <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:flex-row sm:justify-end sm:px-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            {transaction.stripePaymentId ? (
              <a
                href={`https://dashboard.paystack.com/transactions/${transaction.stripePaymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                View in Paystack
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
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

export default TransactionDetailModal;
