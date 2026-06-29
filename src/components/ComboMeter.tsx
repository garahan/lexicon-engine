"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { comboMultiplier } from "@/lib/mastery";

/** Glowing combo bar that charges toward the next ×multiplier. */
export default function ComboMeter({ streak }: { streak: number }) {
  const mult = comboMultiplier(streak);
  const intoStep = streak % 3;
  const fill = mult >= 4 ? 1 : intoStep / 3;
  const active = streak > 0;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mult}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 16 }}
          className={`flex items-center gap-0.5 text-sm font-extrabold ${
            mult > 1 ? "text-grape-500" : "text-ink/30"
          }`}
        >
          <Zap size={14} fill={mult > 1 ? "#7c4dff" : "none"} />×{mult}
        </motion.div>
      </AnimatePresence>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-grape-400 to-brand-500"
          initial={false}
          animate={{ width: `${fill * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
          style={{ boxShadow: active ? "0 0 14px rgba(124,77,255,0.6)" : "none" }}
        />
        {active && (
          <div className="combo-shimmer animate-shimmer absolute inset-0 rounded-full" />
        )}
      </div>
    </div>
  );
}
