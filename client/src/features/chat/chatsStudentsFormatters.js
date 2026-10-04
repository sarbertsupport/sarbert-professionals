export function getFirstWords(str, wordCount = 10) {
  if (!str) return '';
  return (
    str.split(/\s+/).slice(0, wordCount).join(' ') +
    (str.split(/\s+/).length > wordCount ? '...' : '')
  );
}

export function getJobTitle(jobDetail) {
  if (!jobDetail) return null;

  const parts = [];

  if (jobDetail.subjects) {
    parts.push(jobDetail.subjects);
  }

  if (jobDetail.level) {
    parts.push(jobDetail.level);
  }

  if (jobDetail.jobCategory) {
    parts.push(jobDetail.jobCategory);
  }

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
        minute: '2-digit',
      });
    }
    return 'Just now';
  } catch {
    return 'Just now';
  }
}
