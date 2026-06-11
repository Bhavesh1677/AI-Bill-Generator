import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required to send cookies to backend
});

// Interceptor to attach the JWT access token from memory if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens or unauthenticated errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token expired (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid retrying if the request itself was the refresh-token endpoint
      if (originalRequest.url?.includes("/users/refresh-token")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        // Attempt to refresh the access token
        const res = await axios.post(
          `${API_BASE}/users/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear everything and redirect to login if necessary
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // We can let the context handle logout state
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
