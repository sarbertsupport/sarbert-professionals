import createApiInstance from "./apiInterceptor"; // Adjust the import path as needed
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/v1/pricing`;
const pricingApi = createApiInstance(BASE_URL);

export const PricingService = {
  // Get current pricing
  getCurrentPricing: async () => {
    try {
      const response = await pricingApi.get("/current");
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to fetch current pricing:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              "Failed to fetch current pricing",
        status: error.response?.status
      };
    }
  },

  // Add new pricing
  addPricing: async (pricingData) => {
    try {
      const response = await pricingApi.post("/", pricingData);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to add pricing:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              "Failed to add pricing",
        status: error.response?.status
      };
    }
  },

  // Update existing pricing
  updatePricing: async (id, pricingUpdateData) => {
    try {
      const response = await pricingApi.put(`/${id}`, pricingUpdateData);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to update pricing:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              `Failed to update pricing with id ${id}`,
        status: error.response?.status
      };
    }
  }
};

export default PricingService;