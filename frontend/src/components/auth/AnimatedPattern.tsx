"use client";

import { motion } from "framer-motion";

export function AnimatedPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {/* Hexagon outline grid (animated drift) */}
      <motion.svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-amber-400/15"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="hex-pattern"
            width="92"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 6-sided hex outline */}
            <path
              d="M46 2 L78 20 L78 60 L46 78 L14 60 L14 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </pattern>
        </defs>

        <motion.g
          animate={{ x: [0, 60], y: [0, 36] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        >
          <rect width="1400" height="900" fill="url(#hex-pattern)" />
        </motion.g>

        {/* subtle vertical split highlight like the reference */}
        <rect
          x="0"
          y="0"
          width="1200"
          height="800"
          fill="url(#left-vignette)"
        />

        <defs>
          <radialGradient id="left-vignette" cx="35%" cy="45%" r="85%">
            <stop offset="0%" stopColor="rgb(15 23 42 / 0)" />
            <stop offset="55%" stopColor="rgb(2 6 23 / 0.45)" />
            <stop offset="100%" stopColor="rgb(2 6 23 / 0.92)" />
          </radialGradient>
        </defs>
      </motion.svg>

      {/* soft amber bloom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_55%)]" />
    </div>
  );
}
