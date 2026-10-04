import createApiInstance from "./apiInterceptor";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/v1/bulk-discounts`;
const bulkDiscountApi = createApiInstance(BASE_URL);

export const BulkDiscountService = {
  // Get all active bulk discounts
  getAllActiveDiscounts: async () => {
    try {
      const response = await bulkDiscountApi.get("/active");
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to fetch bulk discounts:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              "Failed to fetch bulk discounts",
        status: error.response?.status
      };
    }
  },

  // Add new bulk discount
  addBulkDiscount: async (discountData) => {
    try {
      const response = await bulkDiscountApi.post("/", discountData);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to add bulk discount:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              "Failed to add bulk discount",
        status: error.response?.status
      };
    }
  },

  // Update existing bulk discount
  updateBulkDiscount: async (id, discountData) => {
    try {
      const response = await bulkDiscountApi.put(`/${id}`, discountData);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to update bulk discount:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              `Failed to update bulk discount with id ${id}`,
        status: error.response?.status
      };
    }
  },

  // Deactivate bulk discount
  deactivateDiscount: async (id) => {
    try {
      const response = await bulkDiscountApi.patch(`/${id}/deactivate`);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to deactivate discount:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              `Failed to deactivate discount with id ${id}`,
        status: error.response?.status
      };
    }
  },
   // Deactivate bulk discount
   activateDiscount: async (id) => {
    try {
      const response = await bulkDiscountApi.patch(`/${id}/activate`);
      
      return {
        success: true,
        data: response.data.body.data,
        headers: response.data.headers
      };
    } catch (error) {
      logger.error("Failed to activate discount:", error);
      return {
        success: false,
        error: error.response?.data?.headers?.customerMessage || 
              `Failed to activate discount with id ${id}`,
        status: error.response?.status
      };
    }
  }
};

export default BulkDiscountService;