import axios from "axios";

const productionUrl = "https://productivity-tracker-api.onrender.com";
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? productionUrl
      : "http://localhost:8000/api/v1",

  withCredentials: true,
});

export default api;
