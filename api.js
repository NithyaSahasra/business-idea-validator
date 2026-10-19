const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let inMemoryAccessToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (inMemoryAccessToken) {
    headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include", // Required for HttpOnly refresh cookies
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If 401 Unauthorized and not already refreshing, attempt silent refresh
    if (response.status === 401 && !endpoint.includes("/api/auth/login") && !endpoint.includes("/api/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            fetchOptions.headers["Authorization"] = `Bearer ${newToken}`;
            return fetch(url, fetchOptions);
          })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json().catch(() => ({ detail: "Request failed" }));
              throw new Error(err.detail || "Request failed");
            }
            return res.json();
          });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          inMemoryAccessToken = refreshData.access_token;
          processQueue(null, refreshData.access_token);

          // Retry the original request with new token
          fetchOptions.headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
          const retryRes = await fetch(url, fetchOptions);
          if (!retryRes.ok) {
            const err = await retryRes.json().catch(() => ({ detail: "Request failed" }));
            throw new Error(err.detail || "Request failed");
          }
          return retryRes.json();
        } else {
          clearAccessToken();
          processQueue(new Error("Session expired"), null);
          throw new Error("Session expired. Please sign in again.");
        }
      } catch (refreshErr) {
        clearAccessToken();
        processQueue(refreshErr, null);
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Network request failed" }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: "GET" }),
  post: (endpoint, body) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: "DELETE" }),
};
