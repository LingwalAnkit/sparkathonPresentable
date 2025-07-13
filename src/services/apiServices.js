// src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL =
      import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
  }

  async getLatestAppleId() {
    return this.makeRequest("/api/admin/latest-apple-id", {
      method: "GET",
    });
  }

  // Enhanced create apple with ID return
  async createAppleWithId(harvestData) {
    const result = await this.makeRequest("/api/admin/harvest", {
      method: "POST",
      body: JSON.stringify(harvestData),
    });

    // Extract apple ID from result if available
    if (result.success && result.appleId) {
      return { ...result, appleId: result.appleId };
    }

    return result;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Harvest Operations
  async createApple(harvestData) {
    return this.makeRequest("/api/admin/harvest", {
      method: "POST",
      body: JSON.stringify(harvestData),
    });
  }

  // Transport Operations
  async logTransport(transportData) {
    return this.makeRequest("/api/admin/transport", {
      method: "POST",
      body: JSON.stringify(transportData),
    });
  }

  // Storage Operations
  async processStorageReading(storageData) {
    return this.makeRequest("/api/admin/storage-reading", {
      method: "POST",
      body: JSON.stringify(storageData),
    });
  }

  // Store Operations
  async logStore(storeData) {
    return this.makeRequest("/api/admin/store", {
      method: "POST",
      body: JSON.stringify(storeData),
    });
  }

  // Read Operations
  async getApple(appleId) {
    return this.makeRequest(`/api/admin/apple/${appleId}`, {
      method: "GET",
    });
  }

  // Sale Operations
  async sellApple(saleData) {
    return this.makeRequest("/api/admin/sell", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  }
}

export default new ApiService();
