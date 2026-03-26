// ============================================================
// src/context/AuthContext.js - Global Auth State
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True on first load while checking token

  // ── On mount: restore session from localStorage ──────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally re-validate token by fetching profile
          const res = await userAPI.getProfile();
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch {
          // Token invalid — clear session
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  // ── Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  // ── Logout ───────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ── Update user in context (after preferences saved, etc.) ─
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
