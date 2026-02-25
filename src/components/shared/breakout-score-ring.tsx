"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BreakoutScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function BreakoutScoreRing({ score, size = 56, strokeWidth = 4, className }: BreakoutScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "#14B8A6";
    if (score >= 60) return "#3B82F6";
    if (score >= 40) return "#F59E0B";
    return "#94A3B8";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        />
      </svg>
      <span className="absolute text-xs font-bold">{Math.round(score)}</span>
    </div>
  );
}
