// ============================================================
// src/components/common/NotificationBell.js
// Real-time notification bell for navbar
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { initSocket } from "../../utils/socketService";
import { useAuth } from "../../context/AuthContext";

const TYPE_ICONS = {
  group_message:  "💬",
  group_edit:     "✏️",
  member_joined:  "👥",
  expense_added:  "💸",
  meeting_poll:   "📌",
  trip_invite:    "✉️",
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = (user?._id || storedUser?._id || "").toString();

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!myId) return;
    fetchNotifications();

    // Real-time via socket
    const token = localStorage.getItem("token");
    initSocket(token, (socket) => {
      socket.on("new_notification", (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        setUnreadCount(prev => prev + 1);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClear = async () => {
    try {
      await api.delete("/notifications/clear");
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleClick = async (notif) => {
    // Mark as read
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    // Navigate to link
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">🔔 Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-blue-500 hover:underline font-medium">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClear} className="text-xs text-slate-400 hover:text-red-500">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-slate-400 font-medium">No notifications yet!</p>
                <p className="text-xs text-slate-300 mt-1">Activity will appear here</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${!notif.isRead ? "bg-blue-100" : "bg-slate-100"}`}>
                    {TYPE_ICONS[notif.type] || "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-bold text-slate-800" : "font-medium text-slate-600"} truncate`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-slate-300 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
