import React from 'react';
import { Inbox, Search, ArrowUpDown } from 'lucide-react';

export function ChatInboxEmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-900">No conversations</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasSearch
          ? 'Try a different search term.'
          : 'When you message someone about a job, the thread will appear here.'}
      </p>
    </div>
  );
}

export function ChatConversationRow({
  name,
  jobLabel,
  preview,
  timeLabel,
  unreadCount,
  deliveryLabel,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400/40 sm:gap-4 sm:px-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
        {(name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium text-slate-900">{name}</span>
          <span className="shrink-0 tabular-nums text-xs text-slate-400">{timeLabel}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{jobLabel}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="truncate text-sm text-slate-600">{preview || '—'}</p>
          <div className="flex shrink-0 items-center gap-2">
            {deliveryLabel ? (
              <span className="text-[11px] font-medium text-slate-400">{deliveryLabel}</span>
            ) : null}
            {unreadCount > 0 ? (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ChatInboxShell({
  title,
  description,
  conversationCount,
  activeTab,
  onTabChange,
  unreadThreadCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  children
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 border-b border-slate-200/80 pb-5">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <p className="mt-2 text-xs text-slate-400 tabular-nums">
            {conversationCount} thread{conversationCount !== 1 ? 's' : ''}
          </p>
        </header>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-sm"
            role="tablist"
            aria-label="Filter conversations"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => onTabChange('all')}
              className={`rounded px-3 py-1.5 text-xs font-medium sm:text-sm ${
                activeTab === 'all'
                  ? 'bg-sky-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'unread'}
              onClick={() => onTabChange('unread')}
              className={`relative rounded px-3 py-1.5 text-xs font-medium sm:text-sm ${
                activeTab === 'unread'
                  ? 'bg-sky-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread
              {unreadThreadCount > 0 ? (
                <span className="ml-1.5 tabular-nums opacity-90">({unreadThreadCount})</span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={1.75}
              />
              <input
                type="search"
                placeholder="Search name, job, or message…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="chat-inbox-sort">
                Sort by
              </label>
              <select
                id="chat-inbox-sort"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="rounded-md border border-slate-200 bg-white py-2 pl-2 pr-8 text-sm text-slate-800 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="lastMessage">Recent activity</option>
                <option value="name">Name</option>
              </select>
              <button
                type="button"
                onClick={onToggleSortOrder}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
                title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
              >
                <ArrowUpDown className="h-4 w-4" strokeWidth={1.75} />
                <span className="sr-only">Toggle sort order</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
