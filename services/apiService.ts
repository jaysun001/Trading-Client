import apiClient from "./apiClient";
import authServices from "./authServices";

// Common interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  updatedWalletBalance?: number;
  updatedBalance?: number; // For the updateBalance endpoint
  count?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Trading APIs
export const tradingService = {
  // Create a new order
  createOrder: async (orderData: {
    Name: string;
    TermCode: string;
    OpeningPrice: number;
    DeliveryPrice: number;
    Direction: "up" | "down";
    Time: number;
    BuyAmount: number;
    openingTime: string;
    deliveryTime: string;
    profit: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post("/user/create-order", orderData);
    return response.data;
  },

  // Get trading history
  getHistory: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get("/user/trading-history");
    return response.data;
  },

  // Get closed orders with pagination
  getClosedOrders: async (
    page: number = 1,
    limit: number = 5
  ): Promise<
    ApiResponse<
      {
        _id: string;
        cryptoCurrency: string;
        termCode: string;
        openingPrice: number;
        deliveryPrice: number;
        direction: string;
        orderTime: number;
        buyAmount: number;
        openingTime: string;
        deliveryTime: string;
        profit: string;
        createdAt: string;
        updatedAt: string;
      }[]
    >
  > => {
    const response = await apiClient.get("/user/closed-orders", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get open orders with pagination
  getOpenOrders: async (
    page: number = 1,
    limit: number = 5
  ): Promise<
    ApiResponse<
      {
        _id: string;
        cryptoCurrency: string;
        termCode: string;
        openingPrice: number;
        deliveryPrice: number;
        direction: string;
        orderTime: number;
        buyAmount: number;
        openingTime: string;
        deliveryTime: string;
        profit: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }[]
    >
  > => {
    const response = await apiClient.get("/user/open-orders", {
      params: { page, limit },
    });
    return response.data;
  },
};

// Crypto APIs
export const cryptoService = {
  // Get all supported cryptocurrencies
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get("/crypto/all");
    return response.data;
  },

  // Get cryptocurrency details by ID/symbol
  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/crypto/${id}`);
    return response.data;
  },

  // Get price history for a cryptocurrency
  getPriceHistory: async (
    id: string,
    timeframe: string
  ): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/crypto/${id}/history`, {
      params: { timeframe },
    });
    return response.data;
  },
};

// User APIs
export const userService = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get("/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put("/user/profile", profileData);
    return response.data;
  },

  // Get wallet balance
  getWalletBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    const response = await apiClient.get("/user/wallet-balance");
    return response.data;
  },

  // Get user details by ID
  getUserDetails: async (
    userId: string
  ): Promise<
    ApiResponse<{
      email: string;
      name: string;
      walletBalance: number;
      crdScore: number;
      uid: string;
    }>
  > => {
    const response = await apiClient.get(`/user/user-detail/${userId}`);
    return response.data;
  },

  // Get user wallet balance by ID
  getUserWalletBalance: async (
    userId: string
  ): Promise<
    ApiResponse<{
      walletBalance: number;
    }>
  > => {
    const response = await apiClient.get(`/user/user-wallet-balance/${userId}`);
    return response.data;
  },
};

// Admin APIs
export const adminService = {
  // Create a new user
  createUser: async (userData: {
    name: string;
    email: string;
    balance: number;
  }): Promise<
    ApiResponse<{
      name: string;
      email: string;
      walletBalance: number;
      id: string;
      invitationCode: string;
    }>
  > => {
    const response = await apiClient.post("/admin/createUser", userData);
    return response.data;
  },

  // Get all users with pagination, sorting and filtering
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    role?: "user" | "admin";
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/admin/user/${userId}`);
    return response.data;
  },

  // Update user balance
  updateBalance: async (
    userId: string,
    amount: number
  ): Promise<ApiResponse<any>> => {
    const data = {
      email: userId.includes("@") ? userId : undefined, // Support email-based updates
      userId: !userId.includes("@") ? userId : undefined,
      balance: amount,
    };
    const response = await apiClient.patch("/admin/updateBalance", data);
    return response.data;
  },

  // Reset user password
  resetPassword: async (
    userId: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    const response = await apiClient.patch("/admin/updatePassword", {
      userId,
      newPassword,
    });
    return response.data;
  },



  // Get admin profile details
  getAdminDetails: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get("/admin/adminDetails");
    return response.data;
  },
};

// Export services object for convenient access
const apiService = {
  trading: tradingService,
  crypto: cryptoService,
  user: userService,
  admin: adminService,

  // Auth is handled by authServices, but we can expose a simplified interface
  auth: {
    // These methods should align with the existing AuthProvider
    isAuthenticated: authServices.isAuthenticated,
    logout: authServices.logout,
    refreshToken: authServices.refreshToken,
    getUserRole: authServices.getUserRole,
  },
};

export default apiService;
