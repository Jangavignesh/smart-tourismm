// ============================================================
// src/pages/GroupTripDetailPage.js - V2
// Fixed: chat notification on edit + add members in edit form
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { initSocket, getSocket } from "../utils/socketService";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import GroupChat from "../components/common/GroupChat";
import MeetingPointTab from "../components/common/MeetingPointTab";
import ExpenseSplit from "../components/common/ExpenseSplit";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const GroupTripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("destinations");
  const [addingDest, setAddingDest] = useState(false);
  const [tabBadges, setTabBadges] = useState({ chat: 0, expenses: 0, meeting: 0, members: 0 });
  const [destForm, setDestForm] = useState({ destinationName: "", city: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", description: "", startDate: "", endDate: "",
    totalBudget: "", status: "planning", newEmails: "",
  });
  const [emailError, setEmailError] = useState("");

  // Socket ref — initialized when GroupChat mounts
  const socketRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTrip(); }, [id]);

  const activeTabRef = useRef("destinations");

  // Keep ref in sync with state
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Show badge on tabs when activity happens
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    const addBadge = (tab) => {
      if (activeTabRef.current !== tab) {
        setTabBadges(prev => ({ ...prev, [tab]: (prev[tab] || 0) + 1 }));
      }
    };

    const loadSocket = () => {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
      const socket = window.io?.(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      if (!socket) return;

      socket.emit("join_trip", id);

      socket.on("new_message", () => addBadge("chat"));

      socket.on("system_message", (msg) => {
        if (msg.text?.includes("expense")) addBadge("expenses");
        else if (msg.text?.includes("meeting") || msg.text?.includes("poll") || msg.text?.includes("location")) addBadge("meeting");
        else if (msg.text?.includes("member") || msg.text?.includes("joined")) addBadge("members");
        else addBadge("chat");
      });
    };

    if (window.io) {
      loadSocket();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js";
      script.onload = loadSocket;
      document.head.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Clear badge when user visits that tab
  useEffect(() => {
    setTabBadges(prev => ({ ...prev, [activeTab]: 0 }));
  }, [activeTab]);

  // Initialize shared socket for the whole page
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    initSocket(token, (s) => {
      s.emit("join_trip", id);
      socketRef.current = s;
    });

    return () => {
      const s = getSocket();
      if (s) s.emit("leave_trip", id);
    };
  }, [id]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/group-trips/${id}`);
      const t = res.data.trip;
      setTrip(t);
      setEditForm({
        name: t.name || "",
        description: t.description || "",
        startDate: t.startDate ? t.startDate.split("T")[0] : "",
        endDate: t.endDate ? t.endDate.split("T")[0] : "",
        totalBudget: t.totalBudget || "",
        status: t.status || "planning",
        newEmails: "",
      });
    } catch { toast.error("Could not load trip."); }
    finally { setLoading(false); }
  };

  const isCreator = trip?.creator?.toString() === user?._id?.toString();

  // ── Edit Group ───────────────────────────────────────────
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEditForm(p => ({ ...p, newEmails: val }));
    if (!val.trim()) { setEmailError(""); return; }
    const emails = val.split(",").map(e => e.trim()).filter(Boolean);
    const invalid = emails.filter(e => !validateEmail(e));
    setEmailError(invalid.length > 0 ? `Invalid: ${invalid.join(", ")}` : "");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) { toast.error("Trip name is required!"); return; }
    if (editForm.startDate && editForm.endDate) {
      if (new Date(editForm.endDate) < new Date(editForm.startDate)) {
        toast.error("End date must be after start date!"); return;
      }
    }
    if (emailError) { toast.error("Fix invalid emails first!"); return; }

    setSaving(true);
    try {
      // Validate new emails
      const newEmails = editForm.newEmails
        ? editForm.newEmails.split(",").map(e => e.trim()).filter(Boolean)
        : [];

      const invalidEmails = newEmails.filter(e => !validateEmail(e));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid emails: ${invalidEmails.join(", ")}`);
        setSaving(false);
        return;
      }

      // Build changes list for chat notification
      const changes = [];
      if (editForm.name !== trip.name) changes.push(`name → "${editForm.name}"`);
      if (editForm.description !== (trip.description || "")) changes.push("description updated");
      if (editForm.startDate !== (trip.startDate?.split("T")[0] || "")) changes.push("start date changed");
      if (editForm.endDate !== (trip.endDate?.split("T")[0] || "")) changes.push("end date changed");
      if (Number(editForm.totalBudget) !== (trip.totalBudget || 0)) changes.push(`budget → ₹${Number(editForm.totalBudget || 0).toLocaleString("en-IN")}`);
      if (editForm.status !== trip.status) changes.push(`status → ${editForm.status}`);
      if (newEmails.length > 0) changes.push(`invited ${newEmails.length} new member(s)`);

      // Update trip
      await api.put(`/group-trips/${id}`, {
        name: editForm.name,
        description: editForm.description,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        totalBudget: editForm.totalBudget ? Number(editForm.totalBudget) : 0,
        status: editForm.status,
        invitedEmails: [
          ...(trip.invitedEmails || []),
          ...newEmails,
        ],
      });

      // Send chat notification via socket
      const activeSocket = getSocket();
      if (changes.length > 0 && activeSocket?.connected) {
        activeSocket.emit("group_updated", {
          tripId: id,
          updatedBy: user?.name,
          changes: changes.join(", "),
        });
      }

      toast.success("Group updated! ✅");
      setShowEditModal(false);
      setEmailError("");
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update group.");
    } finally { setSaving(false); }
  };

  // ── Destinations ─────────────────────────────────────────
  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (!destForm.destinationName) { toast.error("Enter destination name!"); return; }
    setAddingDest(true);
    try {
      await api.post(`/group-trips/${id}/destinations`, {
        destinationId: `manual_${Date.now()}`,
        destinationName: destForm.destinationName,
        city: destForm.city,
      });
      toast.success("Destination added! 📍");
      setDestForm({ destinationName: "", city: "" });
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add.");
    } finally { setAddingDest(false); }
  };

  const handleVote = async (destId) => {
    try {
      const res = await api.post(`/group-trips/${id}/destinations/${destId}/vote`);
      toast.success(res.data.message);
      fetchTrip();
    } catch { toast.error("Could not vote."); }
  };

  const handleRemoveDest = async (destId) => {
    if (!window.confirm("Remove this destination?")) return;
    try {
      await api.delete(`/group-trips/${id}/destinations/${destId}`);
      toast.success("Removed.");
      fetchTrip();
    } catch { toast.error("Could not remove."); }
  };

  const copyTripCode = () => {
    navigator.clipboard.writeText(trip.tripCode);
    toast.success("Code copied! 📋");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Trip not found</h2>
        <button onClick={() => navigate("/group-trips")} className="text-violet-500 hover:underline">← Back</button>
      </div>
    </div>
  );

  const perPersonBudget = trip.totalBudget && trip.members?.length
    ? Math.round(trip.totalBudget / trip.members.length) : 0;
  const sortedDestinations = [...(trip.destinations || [])].sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => navigate("/group-trips")} className="text-violet-200 text-sm hover:text-white mb-3 block">
            ← Back to trips
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{trip.name}</h1>
                {isCreator && (
                  <button onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all border border-white/30">
                    ✏️ Edit Group
                  </button>
                )}
              </div>
              <p className="text-violet-200 text-sm mt-1">By {trip.creatorName}</p>
              {trip.description && <p className="text-violet-100 text-sm mt-1">{trip.description}</p>}
            </div>
            <button onClick={copyTripCode}
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-center hover:bg-white/30 transition-all">
              <p className="text-xs text-violet-200">Trip Code</p>
              <p className="text-2xl font-bold tracking-widest">{trip.tripCode}</p>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: "👥", label: "Members", value: trip.members?.length || 1 },
              { icon: "📍", label: "Places", value: trip.destinations?.length || 0 },
              { icon: "💰", label: "Budget", value: trip.totalBudget ? `₹${(trip.totalBudget/1000).toFixed(0)}k` : "—" },
              { icon: "👤", label: "Per Person", value: perPersonBudget ? `₹${(perPersonBudget/1000).toFixed(0)}k` : "—" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
                <p className="text-xl">{s.icon}</p>
                <p className="text-sm font-bold">{s.value}</p>
                <p className="text-xs text-violet-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "destinations", label: "📍 Destinations" },
              { id: "members",      label: "👥 Members" },
              { id: "budget",       label: "💰 Budget" },
              { id: "chat",         label: "💬 Chat" },
              { id: "meeting",      label: "📌 Meeting Point" },
              { id: "expenses",     label: "💸 Expenses" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {tab.label}
                {tabBadges[tab.id] > 0 && (
                  <span className="absolute top-2 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {tabBadges[tab.id] > 9 ? "9+" : tabBadges[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* DESTINATIONS */}
        {activeTab === "destinations" && (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">➕ Add Destination</h3>
              <form onSubmit={handleAddDestination} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={destForm.destinationName}
                    onChange={e => setDestForm(p => ({ ...p, destinationName: e.target.value }))}
                    placeholder="Destination name *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                  <input type="text" value={destForm.city}
                    onChange={e => setDestForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                </div>
                <button type="submit" disabled={addingDest}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {addingDest ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding...</> : "📍 Add Destination"}
                </button>
              </form>
            </div>

            {sortedDestinations.length > 0 ? (
              <div className="space-y-3">
                {sortedDestinations.map((dest, i) => {
                  const hasVoted = dest.votes?.some(v => v?.toString() === user?._id?.toString());
                  return (
                    <div key={dest.destinationId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{dest.destinationName}</p>
                        <p className="text-xs text-slate-400">{dest.city && `📍 ${dest.city} · `}Added by {dest.addedBy}</p>
                      </div>
                      <button onClick={() => handleVote(dest.destinationId)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          hasVoted ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
                        }`}>
                        👍 {dest.votes?.length || 0}
                      </button>
                      <button onClick={() => handleRemoveDest(dest.destinationId)} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <div className="text-5xl mb-3">📍</div>
                <p className="text-slate-500">No destinations added yet!</p>
              </div>
            )}
          </>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">👥 Members ({trip.members?.length || 1})</h3>
              <div className="space-y-3">
                {trip.members?.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {trip.creator?.toString() === member.user?.toString() && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">👑 Creator</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === "accepted" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5 text-center">
              <p className="text-sm font-medium text-violet-700 mb-2">Share code to invite:</p>
              <button onClick={copyTripCode} className="text-4xl font-bold tracking-widest text-violet-700">{trip.tripCode}</button>
              <p className="text-xs text-violet-400 mt-1">Tap to copy</p>
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === "budget" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">💰 Budget</h3>
            {trip.totalBudget > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Total Budget</p>
                  <p className="text-4xl font-bold text-green-700">₹{trip.totalBudget.toLocaleString("en-IN")}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-xs text-blue-500 mb-1">Per Person</p>
                    <p className="text-2xl font-bold text-blue-700">₹{perPersonBudget.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-blue-400">{trip.members?.length} members</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                    <p className="text-xs text-purple-500 mb-1">Destinations</p>
                    <p className="text-2xl font-bold text-purple-700">{trip.destinations?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-slate-500">No budget set</p>
                {isCreator && (
                  <button onClick={() => setShowEditModal(true)} className="mt-3 text-violet-600 text-sm hover:underline">
                    ✏️ Edit group to add budget
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <GroupChat tripId={id} tripName={trip.name} />
        )}

        {/* MEETING POINT */}
        {activeTab === "meeting" && (
          <MeetingPointTab tripId={id} tripMembers={trip.members} />
        )}

        {/* EXPENSES */}
        {activeTab === "expenses" && (
          <ExpenseSplit tripId={id} tripMembers={trip.members} />
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
              <h2 className="font-bold text-xl">✏️ Edit Group Trip</h2>
              <p className="text-violet-200 text-sm mt-0.5">Changes will appear in group chat automatically</p>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Trip Name *</label>
                <input type="text" value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Description</label>
                <textarea value={editForm.description} rows={2}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 resize-none" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">Start Date</label>
                  <input type="date" value={editForm.startDate}
                    onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">End Date</label>
                  <input type="date" value={editForm.endDate}
                    onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                    min={editForm.startDate}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">💰 Total Budget (₹)</label>
                <input type="number" value={editForm.totalBudget} min="0"
                  onChange={e => setEditForm(p => ({ ...p, totalBudget: e.target.value }))}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Status</label>
                <select value={editForm.status}
                  onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400">
                  <option value="planning">📝 Planning</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="completed">🏁 Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              {/* ── ADD MEMBERS (optional) ── */}
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <label className="text-sm font-medium text-violet-700 block mb-1.5">
                  👥 Invite More Members <span className="text-violet-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={editForm.newEmails}
                  onChange={handleEmailChange}
                  placeholder="friend1@gmail.com, friend2@gmail.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    emailError ? "border-red-400 bg-red-50" : "border-violet-200 focus:border-violet-400 bg-white"
                  }`} />
                {emailError ? (
                  <p className="text-xs text-red-500 mt-1">⚠️ {emailError}</p>
                ) : (
                  <p className="text-xs text-violet-400 mt-1">Separate with commas. They can join using the trip code.</p>
                )}

                {/* Current invited emails */}
                {trip.invitedEmails?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-violet-500 font-medium mb-1">Already invited:</p>
                    <div className="flex flex-wrap gap-1">
                      {trip.invitedEmails.map((email, i) => (
                        <span key={i} className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEmailError(""); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !!emailError}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</> : "Save Changes ✅"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupTripDetailPage;
