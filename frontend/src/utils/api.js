// ============================================================
// src/utils/api.js - Axios Instance with Auth Interceptors
// ============================================================

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 seconds for TripAdvisor API calls
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// ── User ────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getPreferences: () => api.get("/users/preferences"),
  savePreferences: (preferences) => api.post("/users/preferences", { preferences }),
};

// ── Recommendations ─────────────────────────────────────────
export const recommendationAPI = {
  getRecommendations: () => api.get("/recommendations"),
  exploreDestinations: (params) => api.get("/recommendations/explore", { params }),
};

// ── Destinations (TripAdvisor Cloud) ────────────────────────
export const destinationAPI = {
  // Get all destinations (200+ from 25 cities)
  getAll: (params) => api.get("/destinations", { params }),
  // Get popular destinations for a specific city
  getPopular: (city, limit = 30) => api.get("/destinations/popular", { params: { city, limit } }),
  // Get destinations by category (30+ per category)
  getByCategory: (category, limit = 30) => api.get("/destinations/bycategory", { params: { category, limit } }),
  // Search destinations
  search: (q, limit = 20) => api.get("/destinations/search", { params: { q, limit } }),
  // Get single destination
  getById: (id) => api.get(`/destinations/${id}`),
};

// ── Group Trips ─────────────────────────────────────────────
export const groupTripAPI = {
  getMyTrips: () => api.get("/group-trips"),
  createTrip: (data) => api.post("/group-trips", data),
  getTripById: (id) => api.get(`/group-trips/${id}`),
  joinTrip: (tripCode) => api.post("/group-trips/join", { tripCode }),
  updateTrip: (id, data) => api.put(`/group-trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/group-trips/${id}`),
  addDestination: (id, data) => api.post(`/group-trips/${id}/destinations`, data),
  removeDestination: (id, destId) => api.delete(`/group-trips/${id}/destinations/${destId}`),
  voteDestination: (id, destId) => api.post(`/group-trips/${id}/destinations/${destId}/vote`),
};

// ── Favorites ───────────────────────────────────────────────
export const favoritesAPI = {
  getFavorites: () => api.get("/favorites"),
  addFavorite: (id) => api.post(`/favorites/${id}`),
  removeFavorite: (id) => api.delete(`/favorites/${id}`),
};

// ── POI (Overpass API Integration) ──────────────────────────
export const poiAPI = {
  getNearbyPlaces: (data) => api.post("/poi/nearby", data),
};

export default api;
