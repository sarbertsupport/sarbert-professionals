import logger from '../../../utils/logger';

/** Normalizes API date strings to YYYY-MM-DD for HTML date inputs. */
export function formatDateForInput(dateString) {
  if (!dateString) return '';
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    logger.error('Error formatting date:', error);
    return '';
  }
}
