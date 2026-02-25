"use client";

import { GlassCard } from "@/components/layout/glass-card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, MessageSquare, AlertTriangle } from "lucide-react";
import type { TrendReport } from "@/types/report";

interface ReportDetailProps {
  report: TrendReport;
}

export function ReportDetail({ report }: ReportDetailProps) {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold">Why It's Trending</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{report.why_trending}</p>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <h3 className="font-semibold">How to Use It</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{report.how_to_use}</p>
      </GlassCard>

      {report.content_angles?.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold">Content Angles</h3>
          </div>
          <ul className="space-y-2">
            {report.content_angles.map((angle, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-brand-teal font-bold">{i + 1}.</span>
                {angle}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {report.talking_points?.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold mb-3">Talking Points</h3>
          <div className="flex flex-wrap gap-2">
            {report.talking_points.map((point, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {point}
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}

      {report.risk_notes && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Risk Notes</h3>
          </div>
          <p className="text-sm text-amber-700">{report.risk_notes}</p>
        </div>
      )}
    </div>
  );
}
