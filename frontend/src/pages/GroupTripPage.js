// ============================================================
// src/pages/GroupTripPage.js - V3
// + Email validation
// + Members pie chart
// + Add destinations in create form
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const STATUS_META = {
  planning:  { label: "Planning",  color: "bg-blue-100 text-blue-700",   emoji: "📝" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700", emoji: "✅" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-700", emoji: "🏁" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700",     emoji: "❌" },
};

const INDIAN_CITIES = [
  "Agra", "Jaipur", "Goa", "Delhi", "Varanasi", "Udaipur",
  "Mumbai", "Mysore", "Amritsar", "Rishikesh", "Manali",
  "Ooty", "Darjeeling", "Kolkata", "Chennai", "Hampi",
  "Jodhpur", "Munnar", "Kochi", "Pushkar"
];

const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ── Members Chart Component ──────────────────────────────────
const MembersChart = ({ members }) => {
  if (!members || members.length === 0) return null;

  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4"
  ];

  const accepted = members.filter(m => m.status === "accepted").length;
  const pending  = members.filter(m => m.status === "pending").length;
  const total    = members.length;

  // Simple donut chart using SVG
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 45;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;

  const acceptedPct = accepted / total;
  const pendingPct  = pending / total;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 mb-4">👥 Members Overview</h3>
      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size}>
            {/* Background circle */}
            <circle cx={cx} cy={cy} r={r}
              fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
            {/* Accepted arc */}
            <circle cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#6366f1"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * acceptedPct} ${circumference}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            {/* Pending arc */}
            {pending > 0 && (
              <circle cx={cx} cy={cy} r={r}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * pendingPct} ${circumference}`}
                strokeLinecap="round"
                strokeDashoffset={`${-circumference * acceptedPct}`}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-xs text-slate-400">members</p>
          </div>
        </div>

        {/* Legend + member list */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-slate-600">Accepted</span>
            <span className="ml-auto font-bold text-slate-800">{accepted}</span>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm text-slate-600">Pending</span>
              <span className="ml-auto font-bold text-slate-800">{pending}</span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            {members.slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: colors[i % colors.length] }}>
                  {m.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-600 truncate">{m.name}</span>
                {m.status === "accepted" && <span className="ml-auto text-xs text-green-500">✓</span>}
              </div>
            ))}
            {members.length > 4 && (
              <p className="text-xs text-slate-400 pl-8">+{members.length - 4} more</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
const GroupTripPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [emailError, setEmailError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
    invitedEmails: "",
    destinations: [], // list of {name, city}
  });

  const [destInput, setDestInput] = useState({ name: "", city: "" });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    fetchTrips();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get("/group-trips");
      setTrips(res.data.trips || []);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  };

  // ── Email validation ─────────────────────────────────────
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, invitedEmails: val }));
    if (!val) { setEmailError(""); return; }

    const emails = val.split(",").map(e => e.trim()).filter(Boolean);
    const invalid = emails.filter(e => e && !validateEmail(e));
    setEmailError(invalid.length > 0 ? `Invalid: ${invalid.join(", ")}` : "");
  };

  // ── Add destination to form ──────────────────────────────
  const handleAddDest = () => {
    if (!destInput.name.trim()) { toast.error("Enter destination name!"); return; }
    setForm(p => ({
      ...p,
      destinations: [...p.destinations, { name: destInput.name.trim(), city: destInput.city.trim() }]
    }));
    setDestInput({ name: "", city: "" });
  };

  const handleRemoveDest = (i) => {
    setForm(p => ({ ...p, destinations: p.destinations.filter((_, idx) => idx !== i) }));
  };

  // ── Create trip ──────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Trip name is required!"); return; }
    if (form.name.trim().length < 3) { toast.error("Name must be at least 3 characters!"); return; }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date must be after start date!"); return;
    }
    if (form.totalBudget && (isNaN(form.totalBudget) || Number(form.totalBudget) < 0)) {
      toast.error("Budget must be a positive number!"); return;
    }
    if (emailError) { toast.error("Please fix invalid email addresses!"); return; }

    const emails = form.invitedEmails
      ? form.invitedEmails.split(",").map(e => e.trim()).filter(Boolean)
      : [];

    const invalidEmails = emails.filter(e => !validateEmail(e));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid emails: ${invalidEmails.join(", ")}`); return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/group-trips", {
        name: form.name,
        description: form.description,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        totalBudget: form.totalBudget ? Number(form.totalBudget) : 0,
        invitedEmails: emails,
      });

      const tripId = res.data.trip._id;

      // Add destinations to the trip
      for (const dest of form.destinations) {
        await api.post(`/group-trips/${tripId}/destinations`, {
          destinationId: `dest_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
          destinationName: dest.name,
          city: dest.city,
          image: "",
        }).catch(() => {});
      }

      toast.success("Group trip created! 🎉");
      setShowCreateModal(false);
      setForm({ name: "", description: "", startDate: "", endDate: "", totalBudget: "", invitedEmails: "", destinations: [] });
      setEmailError("");
      fetchTrips();
      navigate(`/group-trips/${tripId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create trip.");
    } finally { setSubmitting(false); }
  };

  // ── Join trip ────────────────────────────────────────────
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) { toast.error("Enter a trip code!"); return; }
    if (joinCode.trim().length !== 6) { toast.error("Trip code must be 6 characters!"); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/group-trips/join", { tripCode: joinCode.toUpperCase() });
      toast.success(res.data.message);
      setShowJoinModal(false);
      setJoinCode("");
      fetchTrips();
      navigate(`/group-trips/${res.data.trip._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid trip code.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await api.delete(`/group-trips/${id}`);
      toast.success("Trip deleted.");
      fetchTrips();
    } catch { toast.error("Could not delete trip."); }
  };

  const handleLeave = async (id, name) => {
    if (!window.confirm(`Leave "${name}"? You can rejoin using the trip code.`)) return;
    try {
      const res = await api.delete(`/group-trips/${id}/leave`);
      toast.success(res.data.message);
      fetchTrips();
    } catch (err) { toast.error(err.response?.data?.message || "Could not leave trip."); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">👥 Group Trip Planning</h1>
          <p className="text-violet-200 mb-6">Plan trips with friends — vote on destinations, split budgets!</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors shadow-lg">
              ✨ Create New Trip
            </button>
            <button onClick={() => setShowJoinModal(true)}
              className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 border border-violet-400 transition-colors">
              🔗 Join with Code
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : trips.length > 0 ? (
          <div className="space-y-8">
            {trips.map(trip => {
              const status = STATUS_META[trip.status] || STATUS_META.planning;
              const days = trip.startDate && trip.endDate
                ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000*60*60*24))
                : null;
              const perPerson = trip.totalBudget && trip.members?.length
                ? Math.round(trip.totalBudget / trip.members.length) : 0;
              
              // Standardized creator check
              const isCreator = trip.creator?.toString() === (user?._id || user?.id || "").toString();

              return (
                <div key={trip._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">{trip.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">By {trip.creatorName}</p>
                        {trip.description && <p className="text-sm text-slate-500 mt-1">{trip.description}</p>}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                        {status.emoji} {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { icon: "👥", label: "Members", value: trip.members?.length || 1 },
                        { icon: "📍", label: "Places", value: trip.destinations?.length || 0 },
                        { icon: "📅", label: "Days", value: days || "—" },
                        { icon: "💰", label: "Per Person", value: perPerson ? `₹${(perPerson/1000).toFixed(0)}k` : "—" },
                      ].map(s => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                          <p className="text-xl">{s.icon}</p>
                          <p className="text-sm font-bold text-slate-700">{s.value}</p>
                          <p className="text-xs text-slate-400">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Members Chart */}
                    <MembersChart members={trip.members} />

                    {/* Destinations preview */}
                    {trip.destinations?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">📍 Planned Destinations</p>
                        <div className="flex flex-wrap gap-2">
                          {trip.destinations.slice(0, 5).map((d, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
                              {d.destinationName}
                            </span>
                          ))}
                          {trip.destinations.length > 5 && (
                            <span className="text-xs px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                              +{trip.destinations.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Trip code + dates */}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-2">
                        <p className="text-xs text-violet-400">Trip Code</p>
                        <p className="text-lg font-bold text-violet-700 tracking-widest">{trip.tripCode}</p>
                      </div>
                      {trip.startDate && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                          <p className="text-xs text-slate-400">Travel Dates</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {new Date(trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            {trip.endDate && ` → ${new Date(trip.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                          </p>
                        </div>
                      )}
                      {trip.totalBudget > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                          <p className="text-xs text-green-500">Total Budget</p>
                          <p className="text-sm font-bold text-green-700">{fmt(trip.totalBudget)}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => navigate(`/group-trips/${trip._id}`)}
                        className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors">
                        Open Trip →
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(trip.tripCode); toast.success("Code copied! 📋"); }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-colors">
                        📋 Copy Code
                      </button>
                      {isCreator ? (
                        <button onClick={() => handleDelete(trip._id)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 text-sm rounded-xl transition-colors"
                          title="Delete trip">
                          🗑️
                        </button>
                      ) : (
                        <button onClick={() => handleLeave(trip._id, trip.name)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-500 text-sm rounded-xl transition-colors"
                          title="Leave trip">
                          🚪 Leave
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No group trips yet!</h3>
            <p className="text-slate-400 mb-6">Create a trip and invite your friends!</p>
            <button onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors">
              ✨ Create Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-4">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
              <h2 className="font-bold text-xl">✨ Create Group Trip</h2>
              <p className="text-violet-200 text-sm mt-0.5">Plan your next adventure!</p>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Trip Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Goa Beach Trip 🏖️"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What's this trip about?"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 resize-none" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    min={form.startDate || new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">💰 Total Budget (₹)</label>
                <input type="number" value={form.totalBudget}
                  onChange={e => setForm(p => ({ ...p, totalBudget: e.target.value }))}
                  placeholder="e.g. 50000"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
              </div>

              {/* Invite emails */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">📧 Invite Friends (emails)</label>
                <input type="text" value={form.invitedEmails}
                  onChange={handleEmailChange}
                  placeholder="friend1@gmail.com, friend2@gmail.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    emailError ? "border-red-400 focus:border-red-500 bg-red-50" : "border-slate-200 focus:border-violet-400"
                  }`} />
                {emailError ? (
                  <p className="text-xs text-red-500 mt-1">⚠️ {emailError}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Separate multiple emails with commas</p>
                )}
              </div>

              {/* ── ADD DESTINATIONS ── */}
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">📍 Add Destinations</label>
                <div className="flex gap-2">
                  <input type="text" value={destInput.name}
                    onChange={e => setDestInput(p => ({ ...p, name: e.target.value }))}
                    placeholder="Destination name"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400" />
                  <select value={destInput.city}
                    onChange={e => setDestInput(p => ({ ...p, city: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400">
                    <option value="">City</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" onClick={handleAddDest}
                    className="px-4 py-2.5 bg-violet-100 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-200 transition-colors">
                    + Add
                  </button>
                </div>

                {/* Added destinations list */}
                {form.destinations.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {form.destinations.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-violet-50 rounded-xl px-3 py-2 border border-violet-100">
                        <span className="text-sm text-violet-800 font-medium">
                          📍 {d.name} {d.city && <span className="text-violet-400 font-normal">— {d.city}</span>}
                        </span>
                        <button type="button" onClick={() => handleRemoveDest(i)}
                          className="text-violet-400 hover:text-red-500 transition-colors text-sm ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateModal(false); setEmailError(""); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !!emailError}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                    : "Create Trip 🎉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── JOIN MODAL ── */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
              <h2 className="font-bold text-xl">🔗 Join a Trip</h2>
              <p className="text-violet-200 text-sm mt-0.5">Enter the 6-digit code from your friend</p>
            </div>
            <form onSubmit={handleJoin} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1.5">Trip Code</label>
                <input type="text" value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-2xl font-bold tracking-widest outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 uppercase" />
                <p className="text-xs text-slate-400 mt-1 text-center">6 character code</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowJoinModal(false); setJoinCode(""); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || joinCode.length !== 6}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Joining...</>
                    : "Join Trip 🎉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupTripPage;
