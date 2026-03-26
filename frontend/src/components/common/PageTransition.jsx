// ============================================================
// src/components/common/PageTransition.jsx
// Wrap any page with this for smooth fade+slide animation
// ============================================================
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
