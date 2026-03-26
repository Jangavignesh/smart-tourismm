// ============================================================
// src/components/layout/Navbar.js
// ============================================================

import NotificationBell from "../common/NotificationBell";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out. See you soon! 👋");
    navigate("/");
    setMenuOpen(false);
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`text-sm font-medium transition-colors duration-200 ${
          active ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <div>
              <span className="font-bold text-slate-800 text-lg leading-none block">SmartTrip</span>
              <span className="text-xs text-blue-500 font-medium leading-none">AI Tourism</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLink("/", "Home")}
            {navLink("/explore", "Explore")}
            {isAuthenticated && navLink("/dashboard", "Dashboard")}
            {isAuthenticated && navLink("/recommendations", "My Picks")}
            {isAuthenticated && navLink("/group-trips", "👥 Groups")}
            {isAuthenticated && navLink("/itinerary", "🗺️ AI Trip")}
            {isAuthenticated && navLink("/wishlist", "❤️ Wishlist")}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link to="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm group-hover:bg-blue-200 transition-colors">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name?.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 flex flex-col gap-4 animate-fade-in">
            {navLink("/", "Home")}
            {navLink("/explore", "Explore")}
            {isAuthenticated && navLink("/dashboard", "Dashboard")}
            {isAuthenticated && navLink("/recommendations", "My Picks")}
            {isAuthenticated && navLink("/preferences", "My Preferences")}
            <hr className="border-slate-100" />
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-left text-sm text-red-500 font-medium">
                Logout ({user?.name})
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-600">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-blue-600">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
