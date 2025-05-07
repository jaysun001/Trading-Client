import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";

// Create axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if token refresh is in progress
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}[] = [];

// Process the queue of failed requests
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (request.config.headers && token) {
      request.config.headers["Authorization"] = `Bearer ${token}`;
      request.resolve(apiClient(request.config));
    }
  });

  // Clear the queue
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If it's a 401 error and not a refresh token request itself and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/user/auth/refresh-token"
    ) {
      if (isRefreshing) {
        // If token refresh is already in progress, add request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token API
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          "http://localhost:8080/api/v1/user/auth/refresh-token",
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Save new tokens
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("auth_token", newAccessToken);

          // Update authorization header for original request
          if (originalRequest.headers) {
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
          }

          // Process any queued requests with new token
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (refreshError) {
        // Token refresh failed - logout user
        console.error("Failed to refresh token:", refreshError);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");

        // Process queued requests with error
        processQueue(error);
        isRefreshing = false;

        // Show error and redirect to login
        // toast.error("Your session has expired. Please log in again.");

        // Redirect to login page
        window.location.href = "/login";

        return Promise.reject(error);
      }
    }

    // Handle other errors or if token refresh fails
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      "An unexpected error occurred";
    console.error("API error:", errorMessage);

    return Promise.reject(error);
  }
);

// Helper function to handle logout (to be used in components)

export default apiClient;
