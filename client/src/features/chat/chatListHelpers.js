/** Helpers for the chat list screen (Chats.jsx). */

export function getFirstWords(str, wordCount = 10) {
  if (!str) return '';
  const words = str.split(/\s+/);
  return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
}

export function getJobTitle(jobDetail) {
  if (!jobDetail) return null;

  const parts = [];
  if (jobDetail.subjects) parts.push(jobDetail.subjects);
  if (jobDetail.level) parts.push(jobDetail.level);
  if (jobDetail.jobCategory) parts.push(jobDetail.jobCategory);

  if (parts.length > 0) {
    return parts.join(' - ');
  }

  if (jobDetail.jobRequirements) {
    return getFirstWords(jobDetail.jobRequirements, 5);
  }

  return null;
}

export function formatChatListDate(dateArray) {
  try {
    if (Array.isArray(dateArray)) {
      const date = new Date(
        dateArray[0],
        dateArray[1] - 1,
        dateArray[2],
        dateArray[3],
        dateArray[4],
        dateArray[5],
        dateArray[6] / 1000000
      );

      if (isNaN(date.getTime())) return 'Just now';

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date >= today) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (date >= yesterday) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Just now';
  } catch {
    return 'Just now';
  }
}

/** Backend sometimes sends local date-time as number arrays; used for sorting. */
export function parseLastMessageTimeForSort(dateInput) {
  if (!dateInput) return new Date(0);

  if (Array.isArray(dateInput)) {
    return new Date(
      dateInput[0],
      dateInput[1] - 1,
      dateInput[2],
      dateInput[3],
      dateInput[4],
      dateInput[5],
      dateInput[6] / 1000000
    );
  }

  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}
