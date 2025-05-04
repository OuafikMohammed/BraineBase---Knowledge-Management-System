import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Add token to headers for authenticated requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {  // Check if we're in the browser
    const token = localStorage.getItem("token");
    if (!config.url.includes("/login") && !config.url.includes("/register") && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;