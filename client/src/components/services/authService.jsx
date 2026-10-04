import logger from '../../utils/logger';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8089';
const loginUrl = `${BACKEND_BASE_URL}/api/v1/auth/login`;
const profileUrl = `${BACKEND_BASE_URL}/api/v1/users/me`;
const mfaVerifyUrl = `${BACKEND_BASE_URL}/api/v1/auth/mfa/verify`;

export async function fetchCurrentUserProfile(token) {
  const profileResponse = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const userData = await profileResponse.json();

  if (!profileResponse.ok) {
    const errorMessage =
      userData.headers?.customerMessage || 'Failed to fetch user profile';
    throw new Error(errorMessage);
  }

  return userData.body.data;
}

/**
 * Completes admin MFA after password login. Does not log the OTP.
 */
export async function verifyAdminMfaLogin(sessionToken, otp) {
  const verifyResponse = await fetch(mfaVerifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionToken, otp }),
  });

  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok) {
    const errorMessage =
      verifyData.headers?.customerMessage || 'Verification failed';
    throw new Error(errorMessage);
  }

  const token = verifyData.body?.data;
  if (typeof token !== 'string') {
    throw new Error('Unexpected verification response');
  }

  const user = await fetchCurrentUserProfile(token);
  return { token, user };
}

export const loginUser = async (username, password) => {
  try {
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      const errorMessage =
        loginData.headers?.customerMessage || 'Login failed';
      throw new Error(errorMessage);
    }

    const payload = loginData.body?.data;

    if (
      payload &&
      typeof payload === 'object' &&
      payload.requiresMfa === true
    ) {
      return {
        mfaRequired: true,
        mfaSessionToken: payload.mfaSessionToken,
        maskedEmail: payload.maskedEmail,
        expiresInSeconds: payload.expiresInSeconds ?? 180,
      };
    }

    const token = typeof payload === 'string' ? payload : null;
    if (!token) {
      throw new Error('Unexpected login response');
    }

    const user = await fetchCurrentUserProfile(token);
    return { token, user };
  } catch (error) {
    logger.error('Auth error:', error);
    throw error;
  }
};
