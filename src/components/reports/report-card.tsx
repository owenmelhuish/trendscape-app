"use client";

import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";
import { GlassCard } from "@/components/layout/glass-card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Target } from "lucide-react";
import type { TrendReport } from "@/types/report";

interface ReportCardProps {
  report: TrendReport & { trend_name?: string };
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <motion.div variants={staggerItem}>
      <GlassCard hover>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-teal" />
              <h3 className="font-semibold text-sm">{report.trend_name || "Trend Report"}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium">{report.relevance_score}%</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{report.why_trending}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {report.content_angles?.slice(0, 2).map((angle, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {angle.length > 40 ? angle.slice(0, 40) + "..." : angle}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(report.generated_at).toLocaleDateString()}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
