import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089';

/**
 * Public FAQ list from the database (no auth).
 * @param {string} [category] optional filter, case-insensitive (e.g. General, Wallet)
 * @returns {Promise<Array<{ id, slug, category, question, answer, sortOrder }>>}
 */
export async function fetchFaqs(category) {
  const { data } = await axios.get(`${API_BASE}/api/v1/faqs`, {
    params: category && category !== 'all' ? { category } : undefined,
  });
  const list = data?.body?.data;
  return Array.isArray(list) ? list : [];
}
