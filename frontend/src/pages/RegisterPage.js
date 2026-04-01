// ============================================================
// src/pages/RegisterPage.js - WITH REAL EMAIL VALIDATION
// Uses Abstract API to verify email really exists
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const [emailMsg, setEmailMsg] = useState("");
  const [emailChecked, setEmailChecked] = useState("");

  // Smart email check — catches obviously fake emails
  const smartEmailCheck = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid");
      setEmailMsg("❌ Invalid email format");
      return false;
    }

    const [local, domain] = email.split("@");
    const domainName = domain.split(".")[0];

    // Check for obviously fake patterns
    const fakePatterns = [
      /^fake/i, /^test/i, /^dummy/i, /^abc/i, /^xyz/i,
      /^asdf/i, /^qwer/i, /^1234/, /^0000/,
      /(.)\1{4,}/, // repeated chars like aaaa, 11111
    ];

    const hasFakeLocal = fakePatterns.some(p => p.test(local));
    const hasFakeDomain = fakePatterns.some(p => p.test(domainName));

    // Check for random looking strings (like fakeemail99999)
    const hasRandomNumbers = /[a-z]{4,}\d{4,}/i.test(local);

    if (hasFakeLocal || hasFakeDomain || hasRandomNumbers) {
      setEmailStatus("invalid");
      setEmailMsg("❌ This email looks fake. Please use a real email!");
      return false;
    }

    // Valid real email domains
    const validDomains = [
      "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
      "icloud.com", "protonmail.com", "live.com", "rediffmail.com",
      "ymail.com", "aol.com", "zoho.com", "mail.com",
    ];

    const isKnownDomain = validDomains.includes(domain.toLowerCase());
    if (!isKnownDomain) {
      // Allow but warn for unknown domains
      setEmailStatus("valid");
      setEmailMsg("⚠️ Email accepted");
      return true;
    }

    setEmailStatus("valid");
    setEmailMsg("✅ Email looks good!");
    return true;
  };

  // ── Real Email Validation using Abstract API ─────────────
  const verifyEmail = async (email) => {
    const API_KEY = process.env.REACT_APP_EMAIL_VERIFY_KEY;
    const DISABLE_EMAIL_VERIFY = (process.env.REACT_APP_DISABLE_EMAIL_VERIFY || "").toLowerCase() === "true";

    // If no API key or API fails — use smart format check
    // Or if disabled in production via env flag
    if (DISABLE_EMAIL_VERIFY || !API_KEY || API_KEY === "your_key_here") {
      return smartEmailCheck(email);
    }

    setEmailStatus("checking");
    setEmailMsg("Verifying email...");

    try {
      const res = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`
      );

      // Handle rate limit or auth errors
      if (res.status === 429 || res.status === 401) {
        return smartEmailCheck(email);
      }

      const data = await res.json();

      console.log("=== Email Validation Result ===");
      console.log("Email:", email);
      console.log("Deliverability:", data.deliverability);
      console.log("Is valid format:", data.is_valid_format?.value);
      console.log("Is disposable:", data.is_disposable_email?.value);
      console.log("Is MX found:", data.is_mx_found?.value);
      console.log("Is SMTP valid:", data.is_smtp_valid?.value);
      console.log("Full response:", data);
      console.log("==============================");

      // Block invalid format
      if (data.is_valid_format?.value === false) {
        setEmailStatus("invalid");
        setEmailMsg("❌ Invalid email format");
        return false;
      }

      // Block disposable emails
      if (data.is_disposable_email?.value === true) {
        setEmailStatus("invalid");
        setEmailMsg("❌ Temporary/disposable emails not allowed");
        return false;
      }

      // Block if no MX records (domain can't receive email)
      if (data.is_mx_found?.value === false) {
        setEmailStatus("invalid");
        setEmailMsg("❌ This email domain cannot receive emails");
        return false;
      }

      // Block if SMTP invalid (mailbox doesn't exist)
      if (data.is_smtp_valid?.value === false) {
        setEmailStatus("invalid");
        setEmailMsg("❌ This email address does not exist");
        return false;
      }

      // Block UNDELIVERABLE
      if (data.deliverability === "UNDELIVERABLE") {
        setEmailStatus("invalid");
        setEmailMsg("❌ This email cannot receive messages");
        return false;
      }

      // Only allow DELIVERABLE
      if (data.deliverability === "DELIVERABLE") {
        setEmailStatus("valid");
        setEmailMsg("✅ Email verified — real and exists!");
        return true;
      }

      // Block everything else (RISKY, UNKNOWN)
      setEmailStatus("invalid");
      setEmailMsg("❌ Could not verify this email. Please use a real email address!");
      return false;
    } catch (err) {
      return smartEmailCheck(email);
    }
  };

  const handleEmailBlur = async () => {
    const email = form.email.trim();
    if (!email) return;
    if (email === emailChecked) return; // avoid re-checking same email
    setEmailChecked(email);
    await verifyEmail(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === "email") {
      setEmailStatus(null);
      setEmailMsg("");
      setEmailChecked("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error("Name is required!"); return; }
    if (form.name.trim().length < 2) { toast.error("Name must be at least 2 characters!"); return; }
    if (!form.email.trim()) { toast.error("Email is required!"); return; }
    if (!form.password) { toast.error("Password is required!"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters!"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match!"); return; }

    // Verify email if not already verified
    if (emailStatus !== "valid") {
      const isValid = await verifyEmail(form.email.trim());
      if (!isValid) {
        toast.error("Please use a valid email address!");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success(`Welcome to SmartTrip, ${res.data.user.name}! 🎉`);
      navigate("/preferences");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getEmailBorderClass = () => {
    if (emailStatus === "valid") return "border-green-400 focus:border-green-500";
    if (emailStatus === "invalid") return "border-red-400 focus:border-red-500";
    if (emailStatus === "checking") return "border-blue-400 focus:border-blue-500";
    return "border-slate-200 focus:border-blue-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-3xl mb-4 shadow-lg shadow-blue-500/30">
            🌍
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Join SmartTrip</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account to start planning</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
              />
            </div>

            {/* Email with real validation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 pr-10 ${getEmailBorderClass()}`}
                />
                {/* Status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus === "checking" && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {emailStatus === "valid" && <span className="text-green-500 text-lg">✓</span>}
                  {emailStatus === "invalid" && <span className="text-red-500 text-lg">✗</span>}
                </div>
              </div>
              {/* Email status message */}
              {emailMsg && (
                <p className={`text-xs mt-1.5 ${
                  emailStatus === "valid" ? "text-green-600" :
                  emailStatus === "invalid" ? "text-red-500" :
                  "text-blue-500"
                }`}>
                  {emailMsg}
                </p>
              )}
              {!emailMsg && (
                <p className="text-xs text-slate-400 mt-1">We'll verify your email is real</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
              />
              {form.password && form.password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-400"
                }`}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || emailStatus === "invalid" || emailStatus === "checking"}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : emailStatus === "checking" ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying email...</>
              ) : (
                "Create Account 🚀"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
