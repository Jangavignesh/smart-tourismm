// ============================================================
// src/components/common/UniqueAnimations.jsx
// Each feature has its OWN unique animation style!
// ============================================================

import { motion } from "framer-motion";

// ── 1. WISHLIST — Heart Pulse ────────────────────────────────
// Cards pulse like a heartbeat when they enter
export const WishlistCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      delay: index * 0.08,
      type: "spring",
      stiffness: 200,
      damping: 12,
    }}
    whileHover={{
      scale: 1.04,
      boxShadow: "0 0 0 3px rgba(239,68,68,0.3), 0 16px 32px rgba(239,68,68,0.15)",
      transition: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

// ── 2. EXPLORE — Map Zoom ────────────────────────────────────
// Cards zoom in from a tiny dot like a map pin dropping
export const ExploreCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.3, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      delay: index * 0.06,
      type: "spring",
      stiffness: 260,
      damping: 20,
    }}
    whileHover={{
      scale: 1.03,
      y: -6,
      boxShadow: "0 20px 40px rgba(37,99,235,0.15)",
      transition: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

// ── 3. RECOMMENDATIONS — AI Spotlight ───────────────────────
// Cards slide in from left like AI is revealing them
export const RecommendationCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -40, rotateY: -15 }}
    animate={{ opacity: 1, x: 0, rotateY: 0 }}
    transition={{
      delay: index * 0.07,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }}
    whileHover={{
      scale: 1.02,
      x: 4,
      boxShadow: "0 16px 32px rgba(99,102,241,0.2)",
      transition: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

// ── 4. GROUP TRIPS — Team Bounce ─────────────────────────────
// Cards bounce in like team members joining
export const GroupTripCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay: index * 0.1,
      type: "spring",
      stiffness: 180,
      damping: 14,
    }}
    whileHover={{
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(124,58,237,0.15)",
      transition: { type: "spring", stiffness: 300 },
    }}
  >
    {children}
  </motion.div>
);

// ── 5. ITINERARY — Magic Reveal ──────────────────────────────
// Day cards flip in like turning pages
export const ItineraryCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, rotateX: -30, y: 30 }}
    animate={{ opacity: 1, rotateX: 0, y: 0 }}
    transition={{
      delay: index * 0.12,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }}
    style={{ transformPerspective: 1000 }}
    whileHover={{
      scale: 1.01,
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

// ── 6. DASHBOARD STATS — Pop In ─────────────────────────────
// Stat cards pop in with a spring effect
export const StatCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      delay: index * 0.1,
      type: "spring",
      stiffness: 300,
      damping: 15,
    }}
    whileHover={{
      scale: 1.05,
      boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    }}
  >
    {children}
  </motion.div>
);

// ── 7. NOTIFICATIONS — Slide from right ─────────────────────
export const NotificationItem = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// ── 8. EXPENSE — Count up slide ─────────────────────────────
export const ExpenseItem = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06, duration: 0.3 }}
    whileHover={{ x: 4, transition: { duration: 0.15 } }}
  >
    {children}
  </motion.div>
);

// ── 9. DESTINATION DETAIL — Hero zoom ───────────────────────
export const HeroSection = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.05 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

// ── 10. PAGE SECTION — Fade up ───────────────────────────────
// Use this to animate any section on a page
export const FadeSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

// ── USAGE GUIDE ──────────────────────────────────────────────
// Import what you need:
// import { WishlistCard, ExploreCard, GroupTripCard } from "../components/common/UniqueAnimations";
//
// WishlistPage:       <WishlistCard index={i}>{card}</WishlistCard>
// ExplorePage:        <ExploreCard index={i}>{card}</ExploreCard>
// RecommendationsPage:<RecommendationCard index={i}>{card}</RecommendationCard>
// GroupTripPage:      <GroupTripCard index={i}>{card}</GroupTripCard>
// ItineraryPage:      <ItineraryCard index={i}>{card}</ItineraryCard>
// DashboardPage:      <StatCard index={i}>{stat}</StatCard>
