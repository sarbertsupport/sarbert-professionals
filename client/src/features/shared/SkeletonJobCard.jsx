import React from 'react';

const SkeletonJobCard = () => (
  <div className="mb-4 animate-pulse rounded-lg border border-sky-100/60 border-l-[3px] border-l-sky-200/70 bg-white p-5 shadow-sm">
    <div className="mb-3 h-5 w-2/3 rounded bg-sky-100/50" />
    <div className="mb-4 flex gap-2">
      <div className="h-3 w-24 rounded bg-slate-100" />
      <div className="h-3 w-16 rounded bg-slate-100" />
      <div className="h-3 w-28 rounded bg-slate-100" />
    </div>
    <div className="mb-2 h-3 w-full rounded bg-slate-100" />
    <div className="mb-4 h-3 w-5/6 rounded bg-slate-100" />
    <div className="flex gap-3">
      <div className="h-16 flex-1 rounded-md border border-sky-200/80 bg-sky-100" />
      <div className="h-16 flex-1 rounded-md border border-amber-200/80 bg-amber-100" />
      <div className="h-16 flex-1 rounded-md border border-indigo-200/80 bg-indigo-100" />
    </div>
  </div>
);

export default SkeletonJobCard;
