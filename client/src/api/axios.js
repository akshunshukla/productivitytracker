import axios from "axios";

const productionUrl = "https://productivity-tracker-api.onrender.com/api/v1";
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? productionUrl
      : "http://localhost:8000/api/v1",

  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/user/refreshAccessToken") {
      originalRequest._retry = true;
      try {
        await api.post("/user/refreshAccessToken");
        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
