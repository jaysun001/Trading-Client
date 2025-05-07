import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { jwtDecode } from "jwt-decode";

// Get API base URL from environment variables
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  invitationCode: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  name?: string;
  type: string;
  exp: number;
  iat: number;
  jti?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export type UserRole = "user" | "admin";

// Create axios instance with interceptors for token handling
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = localStorage.getItem("auth_token");
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If error is unauthorized and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            // Update Authorization header with new token
            const accessToken = localStorage.getItem("auth_token");
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            // Retry the original request
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout user
          authServices.logout();
          // Force redirect to login handled by the AuthProvider
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the API client
const apiClient = createApiClient();

// Function to refresh access token
const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/user/auth/refresh-token`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens
    storeTokens(accessToken, newRefreshToken);

    return true;
  } catch (error) {
    clearTokens();
    return false;
  }
};

// Store tokens in localStorage
const storeTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== "undefined") {
    console.log("Storing tokens in localStorage");

    try {
      // First store the raw tokens
      localStorage.setItem("auth_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // Now try to decode and store user info
      if (accessToken) {
        try {
          const decoded = jwtDecode<JwtPayload>(accessToken);
          console.log("Token decoded successfully, user role:", decoded.role);

          // Store role and other user info
          localStorage.setItem("user_role", decoded.role);
          if (decoded.name) {
            localStorage.setItem("user_name", decoded.name);
          }

          // Log the token expiry for debugging
          const exp = new Date(decoded.exp * 1000);
          console.log(
            `Token will expire at: ${exp.toISOString()} (${Math.floor(
              (exp.getTime() - Date.now()) / 1000
            )} seconds from now)`
          );
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
          // Still keep the token even if we can't decode it
        }
      }
    } catch (storageError) {
      // This can happen in incognito mode or if localStorage is disabled
      console.error("Failed to store tokens in localStorage:", storageError);
    }
  }
};

// Clear tokens from localStorage
const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    console.log("All the tokens are cleared");
    
  }
};

// Check if token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    // Add some buffer (30 seconds) to prevent edge cases
    return decoded.exp < currentTime - 30;
  } catch {
    return true;
  }
};

// Get user role from token
const getUserRoleFromToken = (token: string | null): UserRole | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role as UserRole;
  } catch {
    return null;
  }
};

// Get user ID from token
const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  } catch {
    return null;
  }
};

// Get time until token expiration in seconds
const getTokenExpiryTime = (token: string | null): number | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    return Math.max(0, decoded.exp - currentTime);
  } catch {
    return null;
  }
};

// Authentication services
const authServices = {
  // Login service
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log("Attempting login with:", credentials.email);

      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/user/auth/login`,
        credentials
      );

      // Store tokens in localStorage
      const { accessToken, refreshToken } = response.data;
      console.log("Login successful, storing tokens");
      storeTokens(accessToken, refreshToken);

      // Immediately verify authentication state
      const isAuthAfterLogin = authServices.isAuthenticated();
      console.log("Authentication state after login:", isAuthAfterLogin);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Login API error:", error.response.data);
        throw error.response.data as ErrorResponse;
      }
      console.error("Network error during login:", error);
      throw { message: "Network error. Please check your connection." };
    }
  },

  // Signup service
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/user/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data as ErrorResponse;
      }
      throw { message: "Network error. Please check your connection." };
    }
  },

  // Logout service
  logout: (): void => {
    // Use helper to clear tokens
    clearTokens();

    // Optionally make an API call to invalidate the token server-side
    apiClient.post("/user/auth/logout").catch(() => {
      // Silent fail if logout API call fails
    });
  },

  // Store tokens and user info
  storeTokens: (accessToken: string, refreshToken: string): void => {
    storeTokens(accessToken, refreshToken);
  },

  // Get stored tokens
  getTokens: () => {
    if (typeof window === "undefined")
      return { accessToken: null, refreshToken: null };

    return {
      accessToken: localStorage.getItem("auth_token"),
      refreshToken: localStorage.getItem("refresh_token"),
    };
  },

  // Check if user is authenticated with valid token
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;

    const accessToken = localStorage.getItem("auth_token");
    console.log("Checking if authenticated, token exists:", !!accessToken);

    // Check if token exists and is not expired
    if (!accessToken) {
      console.log("No access token found");
      return false;
    }

    try {
      // Decode token to check validity
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime - 30; // 30 seconds buffer

      console.log("Token validity check:", {
        exp: new Date(decoded.exp * 1000).toISOString(),
        now: new Date(currentTime * 1000).toISOString(),
        isExpired,
      });

      if (isExpired) {
        console.log("Token is expired, attempting refresh");
        // Try to silently refresh in the background if token expired
        refreshAccessToken().catch((err) => {
          console.error("Failed to refresh token:", err);
          clearTokens();
        });
        return false;
      }

      // Valid token
      return true;
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
    }
  },

  // Get current user role
  getUserRole: (): UserRole | null => {
    if (typeof window === "undefined") return null;

    const accessToken = localStorage.getItem("auth_token");
    return getUserRoleFromToken(accessToken);
  },

  // Get current user ID
  getUserId: (): string | null => {
    if (typeof window === "undefined") return null;

    const accessToken = localStorage.getItem("auth_token");
    return getUserIdFromToken(accessToken);
  },

  // Get time until token expiry
  getTokenExpiryTime: (token: string | null): number | null => {
    return getTokenExpiryTime(token);
  },

  // Check if user has specific role
  hasRole: (role: UserRole): boolean => {
    const userRole = authServices.getUserRole();
    return userRole === role;
  },

  // Validate if user can access a route based on role
  canAccess: (requiredRole?: UserRole): boolean => {
    const userRole = authServices.getUserRole();

    // If no specific role required, just check if authenticated
    if (!requiredRole) return !!userRole;

    // Otherwise check role match
    return userRole === requiredRole;
  },

  // Refresh token method (exposed for AuthProvider)
  refreshToken: async (): Promise<boolean> => {
    return refreshAccessToken();
  },

  // Access the authenticated API instance
  api: apiClient,
};

export default authServices;
