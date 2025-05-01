import axios from "axios";
import type { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api", // Ensure this points to your Laravel backend API
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important: Send cookies with cross-origin requests
});

// Remove the request interceptor that adds the Authorization header
// instance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers = config.headers || {};
//         config.headers["Authorization"] = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Optional: Add response interceptor to handle 401 errors globally if needed
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      // Check if we are already on the login page to avoid redirect loops
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        // Optionally clear any local user state if necessary
        // localStorage.removeItem("user"); // Example if user info was stored locally
        window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
