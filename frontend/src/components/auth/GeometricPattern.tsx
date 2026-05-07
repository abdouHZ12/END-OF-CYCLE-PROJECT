"use client";
import { motion } from "motion/react";

export function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id="hexagons"
            width="120"
            height="104"
            patternUnits="userSpaceOnUse"
          >
            <motion.path
              d="M60 2 L112 32 L112 92 L60 122 L8 92 L8 32 Z"
              fill="none"
              stroke="rgba(255, 165, 0, 0.4)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}