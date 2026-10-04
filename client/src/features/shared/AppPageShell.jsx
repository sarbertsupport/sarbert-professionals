/**
 * App-wide page background (matches job listing / job detail): sky tint, gradient, soft orbs.
 */
export function AppPageShell({ children }) {
  return (
    <div className="relative min-h-screen isolate overflow-x-hidden bg-sky-100">
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full bg-gradient-to-b from-sky-200/45 via-indigo-100/40 to-slate-200"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-[26rem] w-[min(72rem,100vw)] -translate-x-1/2 rounded-full bg-sky-300/38 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[22rem] w-[26rem] max-w-[90vw] translate-x-1/4 translate-y-1/3 rounded-full bg-violet-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 left-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/28 blur-3xl"
        aria-hidden
      />
      <div className="relative z-0 min-h-screen">{children}</div>
    </div>
  );
}
