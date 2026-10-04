import axios from "axios";
import { useAuthStore } from '../../store/useAuthStore';
import logger from '../../utils/logger';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1`;

// Buy coins endpoint
export const buyCoins = async (amount, numberOfCoins, cardToken, billingInfo) => {
  try {
    // Get token and user from Zustand store
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    const userId = user?.userId || user?.id;
    
    // Fallback to localStorage if Zustand doesn't have the data
    const fallbackToken = token || localStorage.getItem('authToken');
    let fallbackUserId = userId;
    
    if (!fallbackUserId) {
      fallbackUserId = localStorage.getItem('userId') || 
                      localStorage.getItem('id') || 
                      localStorage.getItem('user_id') || 
                      localStorage.getItem('userid') ||
                      '10'; // Default test userId
    }
    
    const idempotencyKey = crypto.randomUUID();
    
    const requestPayload = {
      amount,
      currency: 'USD',
      numberOfCoins,
      cardToken,
      billingAddress: billingInfo
    };
    
    logger.debug('buyCoins', {
      userId: fallbackUserId,
      amount,
      numberOfCoins,
      hasCardToken: Boolean(cardToken),
      hasAuth: Boolean(fallbackToken)
    });
    
    const response = await axios.post(
      `${API_BASE_URL}/buy-coins/${fallbackUserId}`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fallbackToken}`,
          'Idempotency-Key': idempotencyKey
        }
      }
    );
    return response.data;
  } catch (error) {
    logger.error('buyCoins failed', { status: error.response?.status });
    throw error;
  }
};

// Buy coins via M-Pesa endpoint
export const buyCoinMpesa = async (userId, phoneNumber, amount, coins, token) => {
  try {
    const authToken =
      token || useAuthStore.getState().token || localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated — missing token for M-Pesa initiate');
    }
    const idempotencyKey = crypto.randomUUID();
    const response = await axios.post(
      `${API_BASE_URL}/payments/m/initiate`,
      null,
      {
        params: {
          userId,
          phoneNumber,
          amount,
          coins
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Idempotency-Key': idempotencyKey
        }
      }
    );
    return response.data;
  } catch (error) {
    logger.error("Failed to initiate M-Pesa payment:", error);
    throw error;
  }
};

// Get coin balance endpoint
export const getCoinBalance = async (userId, token) => {
  try {
    logger.debug('getCoinBalance: Fetching balance for userId:', userId);
    const response = await axios.get(
      `${API_BASE_URL}/account/balance/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    logger.debug('getCoinBalance: API response:', response.data);
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to fetch coin balance:", error);
    throw error;
  }
};

// Calculate coin price endpoint
export const calculateCoinPrice = async (coins, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pricing/calculate?coins=${coins}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to calculate coin price:", error);
    throw error;
  }
};

// Get transactions endpoint
export const getTransactions = async (userId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/transactions/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to fetch transactions:", error);
    throw error;
  }
};

// Get billing info endpoint
export const getBillingInfo = async (userId, token) => {
  try {
    logger.debug('coinWallet.getBillingInfo: Fetching billing info for userId:', userId);
    
    const response = await axios.get(
      `${API_BASE_URL}/billing/address/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    
    logger.debug('coinWallet.getBillingInfo: API response:', response.data);
    logger.debug('coinWallet.getBillingInfo: Returning response.data:', response.data);
    
    // Return the response directly as it should already be in the correct format
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 404) {
      logger.debug('coinWallet.getBillingInfo: No billing info found (404)');
      return {
        headers: {
          responseCode: 404,
          customerMessage: "No billing address found"
        },
        body: {
          data: null
        }
      };
    }
    logger.error("Failed to fetch billing info:", error);
    logger.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Save billing info endpoint
export const saveBillingInfo = async (userId, billingData, token) => {
  try {
    logger.debug('coinWallet.saveBillingInfo: Saving billing info for userId:', userId);
    logger.debug('coinWallet.saveBillingInfo: Billing data:', billingData);
    
    const response = await axios.post(
      `${API_BASE_URL}/billing/address/${userId}`,
      {
        fullName: billingData.fullName,
        country: billingData.country,
        state: billingData.state,
        city: billingData.city,
        address: billingData.address,
        contactNo: billingData.contactNo
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    logger.debug('coinWallet.saveBillingInfo: API response:', response.data);
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to save billing info:", error);
    logger.error("Billing info error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      userId: userId
    });
    throw error;
  }
};

// Check if billing address exists endpoint
export const checkBillingAddressExists = async (userId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/billing/address/check/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to check billing address existence:", error);
    throw error;
  }
};

// Initialize Paystack transaction endpoint
export const initializePaystackTransaction = async (amount, email, reference, metadata, callbackUrl, currency = 'USD') => {
  try {
    const token = useAuthStore.getState().token || localStorage.getItem('authToken');
    
    const requestPayload = {
      amount,
      email,
      reference,
      metadata,
      callbackUrl,
      currency
    };
    
    logger.debug('paystack initialize-transaction', {
      amount,
      currency,
      hasAuth: Boolean(token)
    });
    
    const response = await axios.post(
      `${API_BASE_URL}/paystack/initialize-transaction`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    
    return response.data;
  } catch (error) {
    logger.error('Failed to initialize Paystack transaction', {
      message: error.message,
      status: error.response?.status
    });
    throw error;
  }
};