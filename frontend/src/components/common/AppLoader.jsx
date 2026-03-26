// ============================================================
// src/components/common/AppLoader.jsx
// Full screen loader shown on app launch
// ============================================================
import { motion, AnimatePresence } from "framer-motion";

const AppLoader = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "linear-gradient(135deg, #1e3a8a, #1d4ed8, #3b82f6)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 64, marginBottom: 16 }}
          >
            🌍
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ color: "white", fontSize: 28, fontWeight: 700, margin: 0 }}
          >
            SmartTrip
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color: "#bfdbfe", fontSize: 14, marginTop: 8 }}
          >
            AI Tourism Platform
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: 8, marginTop: 40 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.7)" }}
            />
          ))}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AppLoader;
