import React from 'react';
import { Smartphone } from 'lucide-react';

/**
 * After Safaricom accepts STK — payment still pending until PIN + confirmation.
 */
export function MpesaStkSuccessModal({
  isOpen,
  numberOfCoins,
  amount,
  onContinue,
}) {
  if (!isOpen) return null;

  const coinsLabel =
    numberOfCoins != null
      ? `${Number(numberOfCoins).toLocaleString()} coins`
      : null;

  const amountLabel =
    amount != null && Number.isFinite(Number(amount))
      ? `$${Number(amount).toFixed(2)}`
      : null;

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mpesa-stk-success-title"
    >
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden />

      <div className="relative w-full max-w-[340px] rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100"
            aria-hidden
          >
            <Smartphone className="h-5 w-5 text-emerald-700" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id="mpesa-stk-success-title"
              className="text-base font-semibold leading-snug text-slate-900"
            >
              Enter your M-Pesa PIN
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              A payment prompt was sent to your phone. Approve it to finish. Your balance updates
              shortly after M-Pesa confirms.
            </p>
            {(coinsLabel || amountLabel) && (
              <p className="mt-3 text-xs text-slate-500">
                {[amountLabel, coinsLabel].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Go to wallet
        </button>
      </div>
    </div>
  );
}
