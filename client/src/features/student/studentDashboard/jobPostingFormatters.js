const DESCRIPTION_PREVIEW_LENGTH = 300;

export function formatJobPostedDate(dateArray) {
  const [year, month, day, hours, minutes, seconds, milliseconds] = dateArray;
  const date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds / 1000000);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString(undefined, options);
}

export function truncateJobDescription(text, jobId, expandedDescriptions) {
  if (!text) return '';
  if (text.length <= DESCRIPTION_PREVIEW_LENGTH || expandedDescriptions[jobId]) {
    return text;
  }
  return text.substring(0, DESCRIPTION_PREVIEW_LENGTH) + '...';
}

export { DESCRIPTION_PREVIEW_LENGTH };
