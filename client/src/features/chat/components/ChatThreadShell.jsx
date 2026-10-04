import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { groupMessagesByDate, formatMessageTime } from '../jobChatHelpers';

export function ChatThreadLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600"
          aria-hidden
        />
        <p className="text-sm text-slate-500">Loading conversation…</p>
      </div>
    </div>
  );
}

export function ChatMessageTimeline({
  messages,
  currentUserId,
  usernames,
  emptyTitle,
  emptySubtitle
}) {
  const grouped = groupMessagesByDate(messages);
  const hasMessages = messages.length > 0;

  if (!hasMessages) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 py-4 sm:px-5">
      {Object.entries(grouped).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {date}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {dateMessages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              const prev = index > 0 ? dateMessages[index - 1] : null;
              const isStacked = prev && prev.senderId === message.senderId;
              const label = usernames[message.senderId] || `User ${message.senderId}`;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isStacked ? 'mt-0.5' : 'mt-3'}`}
                >
                  <div
                    className={`flex max-w-[min(85%,28rem)] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isStacked ? (
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isMine ? 'bg-sky-200 text-sky-950' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {label.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0">
                      {!isStacked ? (
                        <p
                          className={`mb-1 text-[11px] font-medium ${
                            isMine ? 'text-right text-slate-500' : 'text-slate-500'
                          }`}
                        >
                          {isMine ? 'You' : label}
                        </p>
                      ) : null}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? 'rounded-br-md border border-sky-200 bg-sky-100 text-slate-800'
                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1.5 text-[11px] ${
                            isMine ? 'text-sky-800/75' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isMine ? (
                            <span className="opacity-80">
                              {message.status === 'READ'
                                ? 'Read'
                                : message.status === 'DELIVERED'
                                  ? 'Delivered'
                                  : 'Sent'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessageComposer({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  textareaRef,
  maxLen = 4000,
  disabled
}) {
  const len = value.length;
  const over = len > maxLen;

  return (
    <div className="border-t border-slate-200 bg-white">
      <form onSubmit={onSubmit} className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Write a message…"
            className="min-h-[44px] max-h-40 flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim() || over}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">
              Enter
            </kbd>{' '}
            to send ·{' '}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">
              Shift+Enter
            </kbd>{' '}
            new line
          </span>
          <span className={over ? 'font-medium text-red-600' : ''}>
            {len}/{maxLen}
          </span>
        </div>
      </form>
    </div>
  );
}

export function ChatThreadShell({
  title,
  subtitle,
  jobId,
  onBack,
  backLabel = 'Inbox',
  children,
  composer
}) {
  return (
    <div className="flex h-[100dvh] flex-col bg-slate-50 antialiased">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-start gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label={`Back to ${backLabel}`}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
            ) : null}
            <p className="mt-1 font-mono text-[11px] text-slate-400">Job #{jobId}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col bg-slate-50 shadow-sm sm:my-3 sm:mb-6 sm:max-h-[calc(100dvh-5.5rem)] sm:rounded-lg sm:border sm:border-slate-200">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        {composer}
      </main>
    </div>
  );
}
