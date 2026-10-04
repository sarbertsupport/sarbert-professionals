import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SUGGESTED_TERMS = ['Mathematics', 'Computer Science', 'English', 'Physics', 'Chemistry'];

/**
 * Jobs listing keyword search. Controlled via appliedKeyword from parent so clear/URL sync stays consistent.
 */
const SearchForm = ({ appliedKeyword = '', onApplyKeyword, onClearKeyword }) => {
  const [draft, setDraft] = useState(appliedKeyword);

  useEffect(() => {
    setDraft(appliedKeyword);
  }, [appliedKeyword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = draft.trim();
    onApplyKeyword?.(q);
  };

  const handleClear = () => {
    setDraft('');
    onClearKeyword?.();
  };

  const showClear = Boolean(draft.trim() || appliedKeyword.trim());

  return (
    <div className="border-b border-sky-100/90 bg-gradient-to-r from-white via-sky-50/30 to-indigo-50/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Job listings
          </h1>
          <span className="mt-2 block h-0.5 w-12 rounded-full bg-sky-400/70" aria-hidden />
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Browse open roles from students and guardians. Use filters on the left to narrow results.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          role="search"
          aria-label="Search job listings"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600/50"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              name="job-keyword"
              autoComplete="off"
              placeholder="Search by subject, skill, or keyword"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white/90 py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="submit"
              className="h-11 rounded-lg bg-sky-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-sky-900/45">
            Suggestions
          </span>
          {SUGGESTED_TERMS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setDraft(term);
                onApplyKeyword?.(term);
              }}
              className="rounded-md border border-sky-100 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50/80"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
