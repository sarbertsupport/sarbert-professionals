import createApiInstance from './apiInterceptor';
import logger from '../../utils/logger';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089';

const supportApi = createApiInstance(`${BACKEND_BASE_URL}/api/v1/support`);
const adminSupportApi = createApiInstance(`${BACKEND_BASE_URL}/api/v1/admin/support`);

const unwrap = (response) => response?.data?.body?.data ?? response?.data;

/** Customer */
export async function createSupportTicket(payload) {
  const response = await supportApi.post('/tickets', payload);
  return unwrap(response);
}

export async function fetchMySupportTickets() {
  const response = await supportApi.get('/tickets');
  return unwrap(response) ?? [];
}

export async function fetchSupportTicketDetail(ticketUuid) {
  const response = await supportApi.get(`/tickets/${encodeURIComponent(ticketUuid)}`);
  return unwrap(response);
}

export async function postCustomerSupportReply(ticketUuid, message) {
  const response = await supportApi.post(`/tickets/${encodeURIComponent(ticketUuid)}/replies`, { message });
  return unwrap(response);
}

/** Admin */
export async function fetchAdminSupportSummary() {
  const response = await adminSupportApi.get('/summary');
  return unwrap(response);
}

export async function fetchAdminSupportTickets(params = {}) {
  const response = await adminSupportApi.get('/tickets', { params });
  return unwrap(response);
}

export async function fetchAdminSupportTicketDetail(ticketUuid) {
  const response = await adminSupportApi.get(`/tickets/${encodeURIComponent(ticketUuid)}`);
  return unwrap(response);
}

export async function updateAdminSupportTicket(ticketUuid, payload) {
  const response = await adminSupportApi.put(`/tickets/${encodeURIComponent(ticketUuid)}`, payload);
  return unwrap(response);
}

export async function postAdminSupportReply(ticketUuid, message, internalNote = false) {
  const response = await adminSupportApi.post(`/tickets/${encodeURIComponent(ticketUuid)}/replies`, {
    message,
    internalNote,
  });
  return unwrap(response);
}

export function logSupportError(context, error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const url = error?.config?.url;
  const base = error?.config?.baseURL;
  logger.error(
    `[support] ${context}`,
    status != null ? `HTTP ${status}` : '',
    base != null || url != null ? `${base ?? ''}${url ?? ''}` : '',
    data ?? error?.message ?? error,
  );
}
