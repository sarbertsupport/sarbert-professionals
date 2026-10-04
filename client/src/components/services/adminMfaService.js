const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089';
const ADMIN_MFA_BASE = `${BACKEND_BASE_URL}/api/v1/admin/mfa`;

function parseMessage(data, fallback) {
  return data?.headers?.customerMessage || data?.message || fallback;
}

function parseMfaPayload(data) {
  const payload = data?.body?.data;
  if (payload && typeof payload === 'object' && payload.requiresMfa === true) {
    return {
      mfaSessionToken: payload.mfaSessionToken,
      maskedEmail: payload.maskedEmail,
      expiresInSeconds: payload.expiresInSeconds ?? 180,
    };
  }
  return null;
}

export async function getAdminMfaStatus(token) {
  const res = await fetch(`${ADMIN_MFA_BASE}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseMessage(data, 'Failed to load MFA status'));
  }
  return data.body?.data;
}

export async function requestAdminMfaEnable(token) {
  const res = await fetch(`${ADMIN_MFA_BASE}/request-enable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseMessage(data, 'Could not send verification code'));
  }
  const parsed = parseMfaPayload(data);
  if (!parsed) {
    throw new Error('Unexpected response from server');
  }
  return parsed;
}

export async function confirmAdminMfaEnable(token, sessionToken, otp) {
  const res = await fetch(`${ADMIN_MFA_BASE}/confirm-enable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionToken, otp }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseMessage(data, 'Verification failed'));
  }
  return data.body?.data;
}

export async function requestAdminMfaDisable(token) {
  const res = await fetch(`${ADMIN_MFA_BASE}/request-disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseMessage(data, 'Could not send verification code'));
  }
  const parsed = parseMfaPayload(data);
  if (!parsed) {
    throw new Error('Unexpected response from server');
  }
  return parsed;
}

export async function confirmAdminMfaDisable(token, sessionToken, otp) {
  const res = await fetch(`${ADMIN_MFA_BASE}/confirm-disable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionToken, otp }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(parseMessage(data, 'Verification failed'));
  }
  return data.body?.data;
}
