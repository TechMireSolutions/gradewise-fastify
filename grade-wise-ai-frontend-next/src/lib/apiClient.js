import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// In-flight requests cache to deduplicate GET requests
const inflightRequests = new Map();

// Generate a unique key for deduplicating GET requests
function getRequestKey(config) {
  const paramsStr = config.params ? JSON.stringify(config.params) : "";
  return `${config.method?.toLowerCase()}:${config.url}:${paramsStr}`;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Request Interceptor
 * - Attaches Auth Token
 * - Enforces Offline Guard
 * - Configures Dynamic Timeout
 * - Registers Performance Timing
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Offline Guard
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineError = new Error("No internet connection detected. Please check your network and try again.");
      offlineError.isOffline = true;
      offlineError.code = "OFFLINE";
      // Shape it like axios error for compatibility with catch blocks
      offlineError.response = { data: { success: false, message: offlineError.message } };
      return Promise.reject(offlineError);
    }

    // 2. Performance Tracking
    config.__startTime = Date.now();

    // 3. Dynamic Timeout Engine
    const url = config.url || "";
    const isHeavyEndpoint =
      url.includes("/preview") ||
      url.includes("/generate") ||
      url.includes("/take") ||
      url.includes("/submit") ||
      url.includes("/resources") ||
      config.responseType === "blob";
    
    config.timeout = config.timeout || (isHeavyEndpoint ? 120000 : 15000);

    // 4. Attach Token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper to determine retry eligibility on failures
 */
function isRetryableError(error) {
  const { config, response } = error;
  if (!config) return false;
  
  // Only retry GET requests to prevent duplicate mutations on PUT/POST
  if (config.method?.toLowerCase() !== "get") return false;

  // Max retries limit
  const maxRetries = 3;
  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= maxRetries) return false;

  // Retry on network/timeout errors, or transient server status codes (408, 503, 504)
  const isNetworkOrTimeout = !response || error.code === "ECONNABORTED" || error.message === "Network Error";
  const isTransientStatus = response && [408, 503, 504].includes(response.status);

  return isNetworkOrTimeout || isTransientStatus;
}

/**
 * Response / Error Interceptor
 * - Performance Latency Logging
 * - Transient Retry Handler (exponential backoff & random jitter)
 * - Error Normalizer
 * - Auth Token Lifecycles (401 handler)
 */
apiClient.interceptors.response.use(
  (response) => {
    // Latency logging in Dev
    if (process.env.NODE_ENV === "development" && response.config?.__startTime) {
      const duration = Date.now() - response.config.__startTime;
      console.log(`[API SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Latency logging in Dev for failures
    if (process.env.NODE_ENV === "development" && config?.__startTime) {
      const duration = Date.now() - config.__startTime;
      console.warn(`[API FAILURE] ${config.method?.toUpperCase()} ${config.url} failed after ${duration}ms`);
    }

    // 1. Automatic Retry Handling
    if (isRetryableError(error)) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;

      // Exponential backoff with random jitter
      const backoffDelay = Math.min(
        1000 * Math.pow(2, config.__retryCount) + Math.random() * 200,
        10000
      );

      if (process.env.NODE_ENV === "development") {
        console.warn(`[API RETRY] Retrying ${config.url} (Attempt ${config.__retryCount}) in ${Math.round(backoffDelay)}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return apiClient(config);
    }

    // 2. Global Error Normalization
    let normalizedMessage = "An unexpected error occurred. Please try again.";
    let status = response?.status || null;
    let isNetworkError = false;

    if (error.isOffline) {
      normalizedMessage = error.message;
    } else if (response) {
      // Server responded with an error status (4xx, 5xx)
      normalizedMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    } else if (error.code === "ECONNABORTED") {
      normalizedMessage = "The request timed out. Please try again.";
      isNetworkError = true;
    } else if (error.message === "Network Error") {
      normalizedMessage = "A network error occurred. Please check your connection.";
      isNetworkError = true;
    }

    // Standardize error properties without breaking original object
    error.message = normalizedMessage;
    error.status = status;
    error.isNetworkError = isNetworkError;
    error.isOffline = !!error.isOffline;
    
    // Ensure response data has standard message field if missing
    if (!error.response) {
      error.response = { data: { success: false, message: normalizedMessage } };
    } else if (!error.response.data) {
      error.response.data = { success: false, message: normalizedMessage };
    } else if (typeof error.response.data === "object" && !error.response.data.message) {
      error.response.data.message = normalizedMessage;
    }

    // 3. Auth Cleanup on 401 Unauthorized
    const authFreeEndpoints = [
      "/auth/login",
      "/auth/signup",
      "/auth/google-auth",
      "/auth/verify",
      "/auth/forgot-password",
      "/auth/change-password",
    ];

    const isAuthFree = authFreeEndpoints.some((endpoint) =>
      config?.url?.includes(endpoint)
    );

    if (status === 401 && !isAuthFree) {
      console.error("Unauthorized response – logging out");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");
        
        // Prevent redirect loop if already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// --- Custom Request Wrapper for Deduplication ---
const originalRequest = apiClient.request;

apiClient.request = function (config) {
  const method = config.method || "get";
  
  // Deduplicate only GET requests to prevent caching issues and allow mutations
  if (method.toLowerCase() === "get") {
    const key = getRequestKey(config);
    if (inflightRequests.has(key)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[API DEDUPLICATE] Merging duplicate GET request to ${config.url}`);
      }
      return inflightRequests.get(key);
    }

    const promise = originalRequest.call(this, config).finally(() => {
      inflightRequests.delete(key);
    });

    inflightRequests.set(key, promise);
    return promise;
  }

  return originalRequest.call(this, config);
};

export default apiClient;
