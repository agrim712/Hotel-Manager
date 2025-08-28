// src/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// create an axios instance that always sends token in headers
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// attach token automatically from localStorage (or other store)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // store your JWT here
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`, // token in headers as requested
    };
  }
  return config;
}, (err) => Promise.reject(err));

export default api;
