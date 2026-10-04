import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/business-addresses`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const businessAddressService = {
  getAllBusinessAddresses: async () => {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to fetch business addresses" };
      }
    } catch (error) {
      logger.error("Error fetching business addresses:", error);
      return { code: 500, message: error.message };
    }
  },

  // Updated pagination support for your backend format
  getBusinessAddressesPaginated: async (page = 0, size = 6) => {
    try {
      const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        // Handle your backend response format
        const businessAddresses = data.body.data || [];
        
        return { 
          code: 200, 
          data: businessAddresses,
          totalElements: businessAddresses.length, // Since no pagination info in your response
          totalPages: Math.ceil(businessAddresses.length / size),
          currentPage: page,
          size: size
        };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to fetch business addresses" };
      }
    } catch (error) {
      logger.error("Error fetching business addresses:", error);
      return { code: 500, message: error.message };
    }
  },

  getBusinessAddressById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to fetch business address" };
      }
    } catch (error) {
      logger.error("Error fetching business address:", error);
      return { code: 500, message: error.message };
    }
  },

  getDefaultBusinessAddress: async () => {
    try {
      const response = await fetch(`${BASE_URL}/default`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to fetch default business address" };
      }
    } catch (error) {
      logger.error("Error fetching default business address:", error);
      return { code: 500, message: error.message };
    }
  },

  createBusinessAddress: async (businessAddressData) => {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(businessAddressData),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to create business address" };
      }
    } catch (error) {
      logger.error("Error creating business address:", error);
      return { code: 500, message: error.message };
    }
  },

  updateBusinessAddress: async (id, businessAddressData) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(businessAddressData), // This was missing!
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to update business address" };
      }
    } catch (error) {
      logger.error("Error updating business address:", error);
      return { code: 500, message: error.message };
    }
  },

  deleteBusinessAddress: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to delete business address" };
      }
    } catch (error) {
      logger.error("Error deleting business address:", error);
      return { code: 500, message: error.message };
    }
  },

  setAsDefault: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/set-default`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to set business address as default" };
      }
    } catch (error) {
      logger.error("Error setting business address as default:", error);
      return { code: 500, message: error.message };
    }
  },

  searchBusinessAddresses: async (searchTerm) => {
    try {
      const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (response.ok && data.headers.responseCode === 200) {
        return { code: 200, data: data.body.data };
      } else {
        return { code: data.headers.responseCode, message: data.headers.customerMessage || "Failed to search business addresses" };
      }
    } catch (error) {
      logger.error("Error searching business addresses:", error);
      return { code: 500, message: error.message };
    }
  },
};
