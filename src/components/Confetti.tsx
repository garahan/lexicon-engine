"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#f25c2a", "#7c4dff", "#10b981", "#f59e0b", "#ff9b76"];

/** Lightweight burst of confetti pieces. Mount it to trigger; unmount to stop. */
export default function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 260,
        y: 220 + Math.random() * 260,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.15,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 7,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <div className="absolute left-1/2 top-24">
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
            transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 2,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
