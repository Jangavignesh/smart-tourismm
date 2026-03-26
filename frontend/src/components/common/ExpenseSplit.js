// ============================================================
// src/components/common/ExpenseSplit.js
// Group Expense Tracker + Settlement Calculator
// ============================================================

import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "food",       label: "Food",       emoji: "🍽️" },
  { id: "transport",  label: "Transport",  emoji: "🚗" },
  { id: "hotel",      label: "Hotel",      emoji: "🏨" },
  { id: "activities", label: "Activities", emoji: "🎯" },
  { id: "shopping",   label: "Shopping",   emoji: "🛍️" },
  { id: "other",      label: "Other",      emoji: "💰" },
];

const getCatEmoji = (cat) => CATEGORIES.find(c => c.id === cat)?.emoji || "💰";
const getCatLabel = (cat) => CATEGORIES.find(c => c.id === cat)?.label || "Other";

const ExpenseSplit = ({ tripId, tripMembers }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("expenses"); // expenses | settlement
  const [form, setForm] = useState({ amount: "", description: "", category: "other" });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = (user?._id || storedUser?._id || "").toString();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, [tripId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [expRes, setRes] = await Promise.all([
        api.get(`/expenses/trip/${tripId}`),
        api.get(`/expenses/trip/${tripId}/settlement`),
      ]);
      setExpenses(expRes.data.expenses || []);
      setSettlement(setRes.data);
    } catch { toast.error("Could not load expenses."); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) { toast.error("Amount and description required!"); return; }
    if (parseFloat(form.amount) <= 0) { toast.error("Amount must be greater than 0!"); return; }
    setAdding(true);
    try {
      await api.post("/expenses", { tripId, ...form, amount: parseFloat(form.amount) });
      toast.success("Expense added! 💰");
      setForm({ amount: "", description: "", category: "other" });
      setShowForm(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Could not add expense."); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted.");
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Could not delete."); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl">💸 Expense Split</h3>
              <p className="text-green-200 text-sm mt-0.5">Track and split group expenses fairly</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-white text-green-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-50 transition-colors shadow-md">
              {showForm ? "✕ Cancel" : "+ Add Expense"}
            </button>
          </div>

          {/* Summary stats */}
          {settlement && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Total Spent", value: `₹${settlement.totalAmount?.toLocaleString("en-IN")}` },
                { label: "Per Person", value: `₹${settlement.perPerson?.toLocaleString("en-IN")}` },
                { label: "Expenses", value: expenses.length },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-green-200">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add expense form */}
        {showForm && (
          <form onSubmit={handleAdd} className="p-5 border-b border-slate-100 space-y-3 bg-green-50">
            <p className="text-sm font-bold text-slate-700">➕ Add New Expense</p>

            {/* Category picker */}
            <div className="grid grid-cols-6 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                  className={`py-2 rounded-xl text-center border-2 transition-all ${form.category === cat.id ? "border-green-500 bg-green-100" : "border-slate-200 bg-white hover:border-green-300"}`}>
                  <div className="text-lg">{cat.emoji}</div>
                  <div className="text-xs mt-0.5 text-slate-600">{cat.label}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Amount (₹) *</label>
                <input type="number" min="1" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Description *</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Hotel booking"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400" />
              </div>
            </div>

            <p className="text-xs text-slate-400">💡 Paid by you · Split equally among all {tripMembers?.length || 1} members</p>

            <button type="submit" disabled={adding}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              {adding ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding...</> : "💰 Add Expense"}
            </button>
          </form>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "expenses", label: `💰 Expenses (${expenses.length})` },
            { id: "settlement", label: "🧮 Settlement" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.id ? "border-green-500 text-green-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Expenses list */}
        {activeTab === "expenses" && (
          <div className="divide-y divide-slate-50">
            {expenses.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">💸</div>
                <p className="text-slate-500 font-medium text-sm">No expenses yet!</p>
                <p className="text-slate-400 text-xs mt-1">Add your first expense above</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
                    {getCatEmoji(exp.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{exp.description}</p>
                    <p className="text-xs text-slate-400">
                      Paid by <span className="font-medium text-slate-600">{exp.paidByName}</span>
                      {exp.paidBy === myId && <span className="text-blue-500 ml-1">(You)</span>}
                      · {getCatLabel(exp.category)} · {formatDate(exp.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800">₹{exp.amount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-400">÷ {exp.splitAmong?.length || 1} members</p>
                  </div>
                  {exp.paidBy === myId && (
                    <button onClick={() => handleDelete(exp._id)}
                      className="text-slate-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0">
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Settlement tab */}
        {activeTab === "settlement" && (
          <div className="p-5 space-y-4">
            {!settlement || expenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🧮</div>
                <p className="text-slate-500 text-sm">Add expenses first to see settlement!</p>
              </div>
            ) : (
              <>
                {/* Who paid what */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">💳 Who Paid What</p>
                  <div className="space-y-2">
                    {settlement.paidSummary?.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">
                          {p.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-700">
                            {p.userName}
                            {p.userId === myId && <span className="text-xs text-blue-500 ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400">
                            Paid ₹{p.paid.toLocaleString("en-IN")} · Share ₹{p.share.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${p.balance > 0 ? "bg-green-100 text-green-700" : p.balance < 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                          {p.balance > 0 ? `+₹${p.balance}` : p.balance < 0 ? `-₹${Math.abs(p.balance)}` : "✅ Settled"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settlement transactions */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">💸 Who Owes Whom</p>
                  {settlement.settlement?.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-green-700 font-bold">✅ All settled up!</p>
                      <p className="text-green-500 text-xs mt-1">Everyone paid their fair share</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {settlement.settlement?.map((s, i) => (
                        <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${s.fromId === myId ? "bg-red-50 border-red-200" : s.toId === myId ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 text-sm">
                            {s.from?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">
                              <span className="text-red-600">{s.from}</span>
                              {s.fromId === myId && <span className="text-xs text-blue-500 ml-1">(You)</span>}
                              <span className="text-slate-400 mx-2">→</span>
                              <span className="text-green-600">{s.to}</span>
                              {s.toId === myId && <span className="text-xs text-blue-500 ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-slate-400">Transfer required</p>
                          </div>
                          <p className="font-bold text-slate-800">₹{s.amount.toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category breakdown */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">📊 Spending by Category</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                      const total = expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0);
                      if (total === 0) return null;
                      const pct = Math.round((total / settlement.totalAmount) * 100);
                      return (
                        <div key={cat.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                          <div className="text-xl">{cat.emoji}</div>
                          <p className="text-xs text-slate-500 mt-1">{cat.label}</p>
                          <p className="text-sm font-bold text-slate-700">₹{total.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-slate-400">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSplit;
