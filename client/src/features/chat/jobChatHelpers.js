/** Helpers for job-scoped conversation UI (JobChat.jsx, JobChatStudents.jsx, shared timeline). */

/** Backend may send local date-time as number[] or ISO string. */
export function coerceToDate(dateInput) {
  if (!dateInput) return null;
  if (Array.isArray(dateInput)) {
    const date = new Date(
      dateInput[0],
      dateInput[1] - 1,
      dateInput[2],
      dateInput[3] ?? 0,
      dateInput[4] ?? 0,
      dateInput[5] ?? 0,
      Math.floor((dateInput[6] ?? 0) / 1000000)
    );
    return isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateHeader(dateInput) {
  const date = coerceToDate(dateInput);
  if (!date) return 'Today';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMessageTime(dateInput) {
  const date = coerceToDate(dateInput);
  if (!date) return '';

  const now = Date.now();
  if (now - date.getTime() < 60_000) return 'Now';

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function groupMessagesByDate(messages) {
  const grouped = {};
  messages.forEach(message => {
    const dateKey = formatDateHeader(message.createdAt);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });
  return grouped;
}
