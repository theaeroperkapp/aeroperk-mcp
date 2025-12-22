import axios, { AxiosInstance, AxiosError } from 'axios';

class AeroPerkClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AEROPERK_API_URL || 'https://api.aeroperk.com/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('AeroPerk API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // ==================== REQUEST ENDPOINTS ====================

  async createRequest(data: {
    title: string;
    reward: number;
    pickupAddress: string;
    dropoffAddress: string;
    shortDescription?: string;
    deadline?: string;
    driverRouteId?: string;
  }) {
    const response = await this.client.post('/v1/requests', data);
    return response.data.data?.request || response.data.data;
  }

  async getRequest(requestId: string) {
    const response = await this.client.get(`/v1/requests/${requestId}`);
    return response.data.data?.request || response.data.data;
  }

  async listRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sort?: string;
  }) {
    const response = await this.client.get('/v1/requests', { params });
    return response.data.data;
  }

  // ==================== DRIVER ROUTE ENDPOINTS ====================

  async searchDriverRoutes(params: {
    originCity?: string;
    destinationCity?: string;
    originCountry?: string;
    destinationCountry?: string;
    dateFrom?: string;
    dateTo?: string;
    vehicleType?: string;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/v1/driver-routes', { params });
    return response.data.data;
  }

  async getDriverRoute(routeId: string) {
    const response = await this.client.get(`/v1/driver-routes/${routeId}`);
    return response.data.data?.driverRoute || response.data.data;
  }

  // ==================== ASSIGNMENT ENDPOINT ====================

  async assignDriver(requestId: string, note?: string) {
    // NOTE: This is called by the DRIVER to assign themselves
    // The authenticated user (from token) becomes the driver
    const response = await this.client.post(`/v1/requests/${requestId}/assign`, {
      note,
    });
    return response.data.data;
  }

  // ==================== AUTH/USER ENDPOINTS ====================

  async verifyToken(token: string) {
    // No dedicated /oauth/verify endpoint exists
    // Use profile endpoint to verify token validity
    this.setAuthToken(token);
    try {
      const response = await this.client.get('/v1/users/profile');
      return response.data.data?.user || response.data.data;
    } catch (error) {
      this.clearAuthToken();
      throw error;
    }
  }

  async getUserProfile() {
    const response = await this.client.get('/v1/users/profile');
    return response.data.data?.user || response.data.data;
  }
}

// Export singleton instance
export const aeroperkClient = new AeroPerkClient();
