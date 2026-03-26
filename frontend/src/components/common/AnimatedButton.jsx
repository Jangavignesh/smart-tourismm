// ============================================================
// src/components/common/AnimatedButton.jsx
// Button with ripple + scale animations
// Usage: <AnimatedButton className="..." onClick={fn}>Click</AnimatedButton>
// ============================================================
import { motion } from "framer-motion";

const AnimatedButton = ({ children, onClick, className = "", disabled = false, type = "button" }) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={className}
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.button>
);

export default AnimatedButton;
