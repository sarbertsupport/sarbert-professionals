/**
 * Shown while a lazy-loaded admin tab chunk loads.
 */
export default function AdminTabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" aria-busy="true">
      <div className="fixed left-0 right-0 top-0 z-50 h-0.5 overflow-hidden bg-slate-200/90 lg:left-64">
        <div className="route-suspense-bar h-full w-2/5 rounded-r bg-sky-600" />
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      <p className="mt-3 text-sm text-gray-600">Loading section…</p>
    </div>
  );
}
