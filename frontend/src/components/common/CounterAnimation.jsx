// ============================================================
// src/components/common/CounterAnimation.jsx
// Animated number counter for budget/stats
// Usage: <CounterAnimation value={50000} prefix="₹" />
// ============================================================
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

const CounterAnimation = ({ value = 0, prefix = "", suffix = "", duration = 1.5, className = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    const totalFrames = Math.round(duration * 60);
    const step = end / totalFrames;
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
};

export default CounterAnimation;
