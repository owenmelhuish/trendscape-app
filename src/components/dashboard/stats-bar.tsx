"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { Film, Zap, BarChart3, TrendingUp } from "lucide-react";
import type { RawContent } from "@/types/content";

interface StatsBarProps {
  content: RawContent[];
  total: number;
}

export function StatsBar({ content, total }: StatsBarProps) {
  const avgVirality = content.length > 0
    ? Math.round(content.reduce((s, c) => s + (c.virality_score ?? 0), 0) / content.length)
    : 0;
  const highestViews = content.length > 0
    ? Math.max(...content.map((c) => c.views))
    : 0;
  const over100k = content.filter((c) => c.views >= 100_000).length;

  const stats = [
    { icon: Film, label: "Total Videos", value: formatViews(total), color: "#14B8A6" },
    { icon: Zap, label: "Avg Virality", value: avgVirality, color: "#F59E0B" },
    { icon: BarChart3, label: "Highest Views", value: formatViews(highestViews), color: "#3B82F6" },
    { icon: TrendingUp, label: "Videos 100K+", value: over100k, color: "#8B5CF6" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={staggerItem}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
