// ============================================================
// src/components/common/HeartAnimation.jsx
// Animated heart for wishlist feature
// Usage: <HeartAnimation active={isFavorited} onClick={toggle} />
// ============================================================
import { motion, AnimatePresence } from "framer-motion";

const HeartAnimation = ({ active, onClick, size = 24 }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.8 }}
    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 1 }}
  >
    <AnimatePresence mode="wait">
      {active ? (
        <motion.span
          key="active"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1.3, 0.9, 1.1, 1], opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4, times: [0, 0.4, 0.7, 1] }}
          style={{ fontSize: size, display: "block" }}
        >
          ❤️
        </motion.span>
      ) : (
        <motion.span
          key="inactive"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: size, display: "block" }}
        >
          🤍
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

export default HeartAnimation;
