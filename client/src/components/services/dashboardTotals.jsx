import createApiInstance from "./apiInterceptor";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_URL = `${BACKEND_BASE_URL}/api/v1/dashboard`;
const TRN_URL = `${BACKEND_BASE_URL}/api/v1`;

// Create API instances with interceptors
const dashboardApi = createApiInstance(API_URL);
const transactionApi = createApiInstance(TRN_URL);

// Get dashboard totals with growth metrics
export const fetchDashboardTotals = async () => {
  try {
    const response = await dashboardApi.get("/totals");
    
    return {
      totalProfessionals: response.data.totalProfessionals || 0,
      monthlyRevenue: response.data.monthlyRevenue || 0.0,
      totalStudents: response.data.totalStudents || 0,
      totalRevenue: response.data.totalRevenue || 0.0,
      dailyRevenue: response.data.dailyRevenue || 0.0,
      // Growth metrics
      monthlyGrowth: response.data.monthlyGrowth || 0.0,
      dailyGrowth: response.data.dailyGrowth || 0.0,
      yearlyGrowth: response.data.yearlyGrowth || 0.0,
      studentGrowth: response.data.studentGrowth || 0.0,
      professionalGrowth: response.data.professionalGrowth || 0.0,
      // Payment rails (COMPLETED coin purchases — CARD = Paystack, MPESA)
      cardTotalRevenue: response.data.cardTotalRevenue ?? 0,
      mpesaTotalRevenue: response.data.mpesaTotalRevenue ?? 0,
      cardLifetimeTransactions: response.data.cardLifetimeTransactions ?? 0,
      mpesaLifetimeTransactions: response.data.mpesaLifetimeTransactions ?? 0,
      dailyCardRevenue: response.data.dailyCardRevenue ?? 0,
      dailyMpesaRevenue: response.data.dailyMpesaRevenue ?? 0,
      dailyCardTransactions: response.data.dailyCardTransactions ?? 0,
      dailyMpesaTransactions: response.data.dailyMpesaTransactions ?? 0,
      dailyFailedTransactions: response.data.dailyFailedTransactions ?? 0,
      failedTransactionsLifetime: response.data.failedTransactionsLifetime ?? 0,
    };
  } catch (error) {
    logger.error("Failed to fetch dashboard totals:", error);
    return {
      totalProfessionals: 0,
      monthlyRevenue: 0.0,
      totalStudents: 0,
      totalRevenue: 0.0,
      dailyRevenue: 0.0,
      monthlyGrowth: 0.0,
      dailyGrowth: 0.0,
      yearlyGrowth: 0.0,
      studentGrowth: 0.0,
      professionalGrowth: 0.0,
      cardTotalRevenue: 0,
      mpesaTotalRevenue: 0,
      cardLifetimeTransactions: 0,
      mpesaLifetimeTransactions: 0,
      dailyCardRevenue: 0,
      dailyMpesaRevenue: 0,
      dailyCardTransactions: 0,
      dailyMpesaTransactions: 0,
      dailyFailedTransactions: 0,
      failedTransactionsLifetime: 0,
    };
  }
};

export const fetchPaymentMethodTrend = async (days = 30) => {
  try {
    const response = await dashboardApi.get(`/payment-method-trend`, { params: { days } });
    if (response.data.error) {
      return { success: false, error: response.data.error, labels: [], series: [] };
    }
    return {
      success: true,
      labels: response.data.labels || [],
      cardRevenue: response.data.cardRevenue || [],
      mpesaRevenue: response.data.mpesaRevenue || [],
      cardPercent: response.data.cardPercent || [],
      mpesaPercent: response.data.mpesaPercent || [],
      dayCount: response.data.dayCount ?? days,
    };
  } catch (error) {
    logger.error('Failed to fetch payment method trend:', error);
    return {
      success: false,
      labels: [],
      cardRevenue: [],
      mpesaRevenue: [],
      cardPercent: [],
      mpesaPercent: [],
      error: error.response?.data?.message || error.message,
    };
  }
};

// Get revenue chart data by time range with additional parameters
export const fetchRevenueChartData = async (range = "yoy", year = null, quarter = null, month = null) => {
  try {
    const params = new URLSearchParams();
    params.append('range', range);
    if (year) params.append('year', year.toString());
    if (quarter) params.append('quarter', quarter.toString());
    if (month) params.append('month', month.toString());
    
    const response = await dashboardApi.get(`/revenue-chart?${params.toString()}`);
    
    return {
      success: true,
      labels: response.data.labels || [],
      data: response.data.data || [],
      total: response.data.total || 0
    };
  } catch (error) {
    logger.error("Failed to fetch revenue chart data:", error);
    return {
      success: false,
      labels: [],
      data: [],
      total: 0,
      error: error.response?.data?.message || error.message
    };
  }
};

// Get revenue statistics with growth comparisons
export const fetchRevenueStats = async () => {
  try {
    const response = await dashboardApi.get("/revenue-stats");
    
    return {
      success: true,
      currentMonth: response.data.currentMonth || 0.0,
      currentDay: response.data.currentDay || 0.0,
      totalRevenue: response.data.totalRevenue || 0.0,
      monthlyGrowth: response.data.monthlyGrowth || 0.0,
      dailyGrowth: response.data.dailyGrowth || 0.0,
      yearlyGrowth: response.data.yearlyGrowth || 0.0
    };
  } catch (error) {
    logger.error("Failed to fetch revenue stats:", error);
    return {
      success: false,
      currentMonth: 0.0,
      currentDay: 0.0,
      totalRevenue: 0.0,
      monthlyGrowth: 0.0,
      dailyGrowth: 0.0,
      yearlyGrowth: 0.0,
      error: error.response?.data?.message || error.message
    };
  }
};

// Get paginated transactions with filters (existing)
export const fetchTransactions = async (
  page = 1, 
  size = 10, 
  filters = {}
) => {
  try {
    const params = {
      page,
      size,
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.status && { status: filters.status }),
      ...(filters.user && { email: filters.user }),
      ...(filters.transactionId && { transactionUuid: filters.transactionId }),
      ...(filters.transactionType && { entryType: filters.transactionType }),
      ...(filters.paystackPaymentId && { paystackPaymentId: filters.paystackPaymentId })
    };

    const response = await transactionApi.get("/transactions/all", { params });

    const responseData = response.data.body.data;
    
    return {
      success: true,
      transactions: responseData.transactions || [],
      pagination: {
        currentPage: responseData.currentPage || page,
        totalPages: responseData.totalPages || 1,
        totalItems: responseData.totalItems || 0
      },
      headers: response.data.headers
    };
  } catch (error) {
    logger.error("Failed to fetch transactions:", error);
    return {
      success: false,
      transactions: [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0
      },
      error: error.response?.data?.message || error.message
    };
  }
};

// Get transaction details (existing)
export const fetchTransactionDetails = async (transactionId) => {
  try {
    const response = await transactionApi.get(`/transactions/all/${transactionId}`);
    return {
      success: true,
      transaction: response.data.body.data,
      headers: response.data.headers
    };
  } catch (error) {
    logger.error("Failed to fetch transaction details:", error);
    return {
      success: false,
      transaction: null,
      error: error.response?.data?.message || error.message
    };
  }
};

/** Admin: STK Push Query v2 reconciliation (updates receipt/status from Safaricom). */
export const reconcileMpesaStk = async (transactionId) => {
  try {
    const response = await transactionApi.post("/admin/mpesa/reconcile-stk", {
      transactionId: Number(transactionId),
    });
    const res = response.data;
    const code = res?.headers?.responseCode ?? 200;
    const data = res?.body?.data;
    const customerMessage = res?.headers?.customerMessage;
    const responseMessage = res?.headers?.responseMessage;
    return {
      success: code >= 200 && code < 300,
      responseCode: code,
      data,
      message: customerMessage || responseMessage,
      headers: res?.headers,
    };
  } catch (error) {
    const res = error.response?.data;
    const code = res?.headers?.responseCode ?? error.response?.status;
    logger.error("reconcileMpesaStk failed:", error);
    return {
      success: false,
      responseCode: code,
      data: res?.body?.data,
      message: res?.headers?.customerMessage || res?.headers?.responseMessage || error.message,
    };
  }
};