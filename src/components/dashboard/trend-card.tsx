"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";
import { BreakoutScoreRing } from "@/components/shared/breakout-score-ring";
import { StatusBadge } from "@/components/shared/status-badge";
import { VelocityBadge } from "@/components/dashboard/velocity-badge";
import { Badge } from "@/components/ui/badge";
import { Hash, Music, Eye, Heart, Target } from "lucide-react";
import { FORMAT_TYPE_CONFIG } from "@/lib/constants";
import type { Trend } from "@/types/trend";

interface TrendCardProps {
  trend: Trend;
}

export function TrendCard({ trend }: TrendCardProps) {
  const typeIcon = trend.type === "music" ? Music : Hash;
  const TypeIcon = typeIcon;

  const formatConfig = trend.format_type
    ? FORMAT_TYPE_CONFIG[trend.format_type]
    : null;

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

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StatusBadge status={trend.status} />
                <VelocityBadge score={Number(trend.velocity_score)} />
                {formatConfig && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium"
                    style={{
                      borderColor: formatConfig.color,
                      color: formatConfig.color,
                      backgroundColor: `${formatConfig.color}10`,
                    }}
                  >
                    {formatConfig.label}
                  </Badge>
                )}
                {Number(trend.relevance_score) > 0 && (
                  <RelevanceBadge score={Number(trend.relevance_score)} />
                )}
                {!formatConfig && trend.category && (
                  <Badge variant="secondary" className="text-xs">
                    {trend.category}
                  </Badge>
                )}
              </div>

              {trend.format_label && (
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {trend.format_label}
                </p>
              )}

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

function RelevanceBadge({ score }: { score: number }) {
  const getConfig = (s: number) => {
    if (s >= 60) return { color: "#10B981", bg: "#ECFDF5" };
    if (s >= 40) return { color: "#F59E0B", bg: "#FFFBEB" };
    return { color: "#94A3B8", bg: "#F8FAFC" };
  };
  const config = getConfig(score);

  return (
    <Badge
      variant="outline"
      className="gap-1 font-medium text-xs"
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      <Target className="w-3 h-3" />
      {score}%
    </Badge>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
