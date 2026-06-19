import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const inflightRequests = new Map();

function getRequestKey(config) {
  const paramsStr = config.params ? JSON.stringify(config.params) : "";
  return `${config.method?.toLowerCase()}:${config.url}:${paramsStr}`;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineError = new Error("No internet connection detected. Please check your network and try again.");
      offlineError.isOffline = true;
      offlineError.code = "OFFLINE";
      offlineError.response = { data: { success: false, message: offlineError.message } };
      return Promise.reject(offlineError);
    }

    config.__startTime = Date.now();

    const url = config.url || "";
    const isHeavyEndpoint =
      url.includes("/preview") ||
      url.includes("/generate") ||
      url.includes("/take") ||
      url.includes("/submit") ||
      url.includes("/resources") ||
      url.includes("/start") ||
      url.includes("/status") ||
      config.responseType === "blob";

    config.timeout = config.timeout || (isHeavyEndpoint ? 120000 : 15000);

    return config;
  },
  (error) => Promise.reject(error)
);

function isRetryableError(error) {
  const { config, response } = error;
  if (!config) return false;
  if (config.method?.toLowerCase() !== "get") return false;

  const maxRetries = 3;
  config.__retryCount = config.__retryCount || 0;
  if (config.__retryCount >= maxRetries) return false;

  const isNetworkOrTimeout = !response || error.code === "ECONNABORTED" || error.message === "Network Error";
  const isTransientStatus = response && [408, 503, 504].includes(response.status);

  return isNetworkOrTimeout || isTransientStatus;
}

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development" && response.config?.__startTime) {
      const duration = Date.now() - response.config.__startTime;
      console.log(`[API SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    if (process.env.NODE_ENV === "development" && config?.__startTime) {
      const duration = Date.now() - config.__startTime;
      console.warn(`[API FAILURE] ${config.method?.toUpperCase()} ${config.url} failed after ${duration}ms`);
    }

    if (isRetryableError(error)) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;

      const backoffDelay = Math.min(
        1000 * Math.pow(2, config.__retryCount) + Math.random() * 200,
        10000
      );

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return apiClient(config);
    }

    let normalizedMessage = "An unexpected error occurred. Please try again.";
    let status = response?.status || null;
    let isNetworkError = false;

    if (error.isOffline) {
      normalizedMessage = error.message;
    } else if (response) {
      normalizedMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    } else if (error.code === "ECONNABORTED") {
      normalizedMessage = "The request timed out. Please try again.";
      isNetworkError = true;
    } else if (error.message === "Network Error") {
      normalizedMessage = "A network error occurred. Please check your connection.";
      isNetworkError = true;
    }

    error.message = normalizedMessage;
    error.status = status;
    error.isNetworkError = isNetworkError;
    error.isOffline = !!error.isOffline;

    if (!error.response) {
      error.response = { data: { success: false, message: normalizedMessage } };
    } else if (!error.response.data) {
      error.response.data = { success: false, message: normalizedMessage };
    } else if (typeof error.response.data === "object" && !error.response.data.message) {
      error.response.data.message = normalizedMessage;
    }

    const authFreeEndpoints = [
      "/auth/login",
      "/auth/signup",
      "/auth/google-auth",
      "/auth/verify",
      "/auth/forgot-password",
      "/auth/change-password",
      "/auth/logout",
    ];

    const isAuthFree = authFreeEndpoints.some((endpoint) =>
      config?.url?.includes(endpoint)
    );

    if (status === 401 && !isAuthFree) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

const originalRequest = apiClient.request;

apiClient.request = function (config) {
  const method = config.method || "get";

  if (method.toLowerCase() === "get") {
    const key = getRequestKey(config);
    if (inflightRequests.has(key)) {
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
