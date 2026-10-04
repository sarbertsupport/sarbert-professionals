import { formatDistanceToNow, parseISO } from 'date-fns';

/** API may return subjects as a comma-separated string or an array. */
export function normalizeJobSubjects(job) {
  const raw = job?.subjects;
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getJobListingTitle(job) {
  const location = job.location || '';
  switch (job.meetingOptions) {
    case 'Travel to tutor':
    case 'At my place':
      return `Home ${job.subjects} Professional needed in ${location}`;
    case 'Online':
      return `Online ${job.subjects} Professional needed in ${location}`;
    default:
      return `${job.subjects} Professional needed in ${location}`;
  }
}

export function getJobRelativeTime(dateInput) {
  try {
    let date;

    if (Array.isArray(dateInput) && dateInput.length >= 6) {
      date = new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3],
        dateInput[4],
        dateInput[5],
        dateInput[6] || 0
      );
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return 'Unknown date';
    }

    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown date';
  }
}
