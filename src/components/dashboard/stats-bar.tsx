"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { TrendingUp, Zap, BarChart3, Music } from "lucide-react";
import type { Trend } from "@/types/trend";

interface StatsBarProps {
  trends: Trend[];
}

export function StatsBar({ trends }: StatsBarProps) {
  const activeTrends = trends.filter((t) => ["emerging", "active", "peaking"].includes(t.status)).length;
  const avgBreakout = trends.length > 0
    ? Math.round(trends.reduce((s, t) => s + Number(t.breakout_score), 0) / trends.length)
    : 0;
  const totalViews = trends.reduce((s, t) => s + Number(t.total_views), 0);
  const musicTrends = trends.filter((t) => t.type === "music").length;

  const stats = [
    { icon: TrendingUp, label: "Active Trends", value: activeTrends, color: "#14B8A6" },
    { icon: Zap, label: "Avg Breakout", value: avgBreakout, color: "#F59E0B" },
    { icon: BarChart3, label: "Total Views", value: formatViews(totalViews), color: "#3B82F6" },
    { icon: Music, label: "Music Trends", value: musicTrends, color: "#8B5CF6" },
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
