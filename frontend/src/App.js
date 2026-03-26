// ============================================================
// src/App.js - With working animations
// ============================================================

import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import AppLoader from "./components/common/AppLoader";
import PageTransition from "./components/common/PageTransition";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PreferencesPage from "./pages/PreferencesPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ExplorePage from "./pages/ExplorePage";
import WishlistPage from "./pages/WishlistPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import GroupTripPage from "./pages/GroupTripPage";
import ItineraryPage from "./pages/ItineraryPage";
import GroupTripDetailPage from "./pages/GroupTripDetailPage";

// ── Animated Routes — needs useLocation inside Router ────────
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><ExplorePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/destination/:id" element={<PageTransition><DestinationDetailPage /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><PageTransition><PreferencesPage /></PageTransition></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><PageTransition><RecommendationsPage /></PageTransition></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><PageTransition><WishlistPage /></PageTransition></ProtectedRoute>} />
        <Route path="/group-trips" element={<ProtectedRoute><PageTransition><GroupTripPage /></PageTransition></ProtectedRoute>} />
        <Route path="/itinerary" element={<ProtectedRoute><PageTransition><ItineraryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/group-trips/:id" element={<ProtectedRoute><PageTransition><GroupTripDetailPage /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AppLoader show={loading} />
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: "12px", fontSize: "14px", fontFamily: "Inter, sans-serif" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          <Navbar />
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
