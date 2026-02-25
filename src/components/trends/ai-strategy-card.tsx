"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, AlertTriangle, MessageSquare, Sparkles } from "lucide-react";
import { useTrendAnalysis } from "@/hooks/use-trend-analysis";
import type { TrendReport } from "@/types/report";

interface AIStrategyCardProps {
  trendId: string;
  brandId: string;
  existingReport?: TrendReport | null;
}

export function AIStrategyCard({ trendId, brandId, existingReport }: AIStrategyCardProps) {
  const { loading, phase, message, report: newReport, error, analyze } = useTrendAnalysis();

  const report = newReport || existingReport;

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Analysis</h3>
            <p className="text-xs text-muted-foreground">{message || "Processing..."}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </GlassCard>
    );
  }

  if (!report) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-teal" />
            <h3 className="font-semibold">AI Strategy</h3>
          </div>
          <Button
            size="sm"
            onClick={() => analyze(trendId, brandId)}
            className="teal-gradient text-white border-0 gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate AI-powered strategy notes for this trend.
        </p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </GlassCard>
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <GlassCard>
        <div className="space-y-5">
          {/* Why Trending */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-sm">Why It&apos;s Trending</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.why_trending}</p>
          </div>

          {/* How to Use */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <h4 className="font-semibold text-sm">How to Use It</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.how_to_use}</p>
          </div>

          {/* Content Angles */}
          {report.content_angles?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Content Ideas</h4>
              </div>
              <ul className="space-y-1.5">
                {report.content_angles.map((angle, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-brand-teal mt-0.5">-</span>
                    {angle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Notes */}
          {report.risk_notes && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-sm text-amber-800">Risk Notes</h4>
              </div>
              <p className="text-sm text-amber-700">{report.risk_notes}</p>
            </div>
          )}

          {/* Relevance Score */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Relevance to brand</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full teal-gradient rounded-full"
                  style={{ width: `${report.relevance_score}%` }}
                />
              </div>
              <span className="text-xs font-medium">{report.relevance_score}%</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
