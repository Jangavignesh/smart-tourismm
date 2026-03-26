// ============================================================
// src/components/common/WeatherAnimation.jsx
// Floating weather icon animation
// Usage: <WeatherAnimation icon="🌤️" />
// ============================================================
import { motion } from "framer-motion";

const WeatherAnimation = ({ icon = "🌤️", size = 48 }) => (
  <motion.div
    animate={{
      y: [0, -8, 0],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{ fontSize: size, display: "inline-block", cursor: "default" }}
  >
    {icon}
  </motion.div>
);

export default WeatherAnimation;
