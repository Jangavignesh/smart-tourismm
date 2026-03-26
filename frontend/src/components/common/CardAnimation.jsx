// ============================================================
// src/components/common/CardAnimation.jsx
// Wrap any card for staggered entry + hover animations
// Usage: <CardAnimation index={i}>{your card}</CardAnimation>
// ============================================================
import { motion } from "framer-motion";

const CardAnimation = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.4,
      delay: index * 0.07,
      ease: [0.4, 0, 0.2, 1],
    }}
    whileHover={{
      y: -6,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      transition: { duration: 0.2 },
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

export default CardAnimation;
