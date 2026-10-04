/**
 * Shown while lazy route chunks load. Top indeterminate bar + short hint.
 */
export function RouteTransitionFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-start pt-12 px-4">
      <div className="fixed left-0 right-0 top-0 z-[9999] h-1 overflow-hidden bg-slate-200/90">
        <div className="route-suspense-bar h-full w-2/5 rounded-r bg-sky-600" />
      </div>
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}
