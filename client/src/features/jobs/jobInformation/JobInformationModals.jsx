import { AlertCircle, CheckCircle, Phone, Copy, Coins } from 'lucide-react';

export function JobInformationModals({
  error,
  onDismissError,
  showPhoneModal,
  phoneNumber,
  copied,
  onCopyPhone,
  onClosePhone,
  showConnectConfirm = false,
  connectCoins,
  connectJobTitle = '',
  onCancelConnectConfirm = () => {},
  onConfirmConnect = () => {},
  isConnectProcessing = false
}) {
  return (
    <>
      {error && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200/90 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Something went wrong</h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              className="w-full rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showConnectConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" role="dialog" aria-modal="true" aria-labelledby="connect-confirm-title">
          <div className="w-full max-w-md rounded-lg border border-slate-200/90 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">
                <Coins className="h-5 w-5 text-amber-700" aria-hidden />
              </div>
              <h3 id="connect-confirm-title" className="text-lg font-semibold text-slate-900">
                Confirm application
              </h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-700">
              Applying to <span className="font-medium text-slate-900">{connectJobTitle}</span> costs{' '}
              <span className="font-semibold text-amber-800">{connectCoins} coins</span>.
            </p>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Coins are deducted only if you confirm. Cancel leaves your balance unchanged.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isConnectProcessing}
                onClick={onCancelConnectConfirm}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConnectProcessing}
                onClick={onConfirmConnect}
                className="w-full rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
              >
                {isConnectProcessing ? 'Processing…' : `Confirm — ${connectCoins} coins`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200/90 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-100">
                <Phone className="h-5 w-5 text-teal-700" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Contact number</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-base font-medium text-slate-900">{phoneNumber}</span>
                <button
                  type="button"
                  onClick={onCopyPhone}
                  className={`rounded-md p-2 transition-colors ${
                    copied ? 'bg-teal-100 text-teal-800' : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-center text-sm text-teal-700">Copied to clipboard</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClosePhone}
              className="w-full rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
