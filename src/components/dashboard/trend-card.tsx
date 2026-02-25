"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";
import { BreakoutScoreRing } from "@/components/shared/breakout-score-ring";
import { StatusBadge } from "@/components/shared/status-badge";
import { VelocityBadge } from "@/components/dashboard/velocity-badge";
import { Badge } from "@/components/ui/badge";
import { Hash, Music, Eye, Heart } from "lucide-react";
import type { Trend } from "@/types/trend";

interface TrendCardProps {
  trend: Trend;
}

export function TrendCard({ trend }: TrendCardProps) {
  const typeIcon = trend.type === "music" ? Music : Hash;
  const TypeIcon = typeIcon;

  return (
    <motion.div variants={staggerItem}>
      <Link href={`/trends/${trend.id}`}>
        <div className="glass rounded-xl p-4 glass-hover transition-all duration-300 cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm truncate group-hover:text-brand-teal transition-colors">
                  {trend.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={trend.status} />
                <VelocityBadge score={Number(trend.velocity_score)} />
                {trend.category && (
                  <Badge variant="secondary" className="text-xs">
                    {trend.category}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatCompact(Number(trend.total_views))}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {formatCompact(Number(trend.total_likes))}
                </span>
                <span>{trend.content_count} posts</span>
              </div>
            </div>

            <BreakoutScoreRing score={Number(trend.breakout_score)} size={52} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
