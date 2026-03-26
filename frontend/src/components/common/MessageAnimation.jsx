// ============================================================
// src/components/common/MessageAnimation.jsx
// Smooth slide-in for chat messages
// Usage: wrap message bubble with this
// ============================================================
import { motion } from "framer-motion";

const MessageAnimation = ({ children, isMe, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{
      duration: 0.25,
      delay: index * 0.03,
      ease: [0.4, 0, 0.2, 1],
    }}
  >
    {children}
  </motion.div>
);

export default MessageAnimation;
