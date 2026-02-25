"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBrand } from "@/hooks/use-brand";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { VelocityBadge } from "@/components/dashboard/velocity-badge";
import { BreakoutScoreRing } from "@/components/shared/breakout-score-ring";
import { AIStrategyCard } from "@/components/trends/ai-strategy-card";
import { ContentGrid } from "@/components/trends/content-grid";
import { TrendTimeline } from "@/components/trends/trend-timeline";
import { GlassCard } from "@/components/layout/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Hash, Music, Eye, Heart, Users, Clock } from "lucide-react";
import type { Trend } from "@/types/trend";
import type { TrendReport } from "@/types/report";
import type { RawContent } from "@/types/content";

export default function TrendDetailPage() {
  const params = useParams();
  const trendId = params.trendId as string;
  const { activeBrand } = useBrand();
  const supabase = createClient();

  const [trend, setTrend] = useState<Trend | null>(null);
  const [contents, setContents] = useState<RawContent[]>([]);
  const [report, setReport] = useState<TrendReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!trendId) return;

      const { data: trendData } = await supabase
        .from("trends")
        .select("*")
        .eq("id", trendId)
        .single();

      if (trendData) setTrend(trendData);

      const { data: contentLinks } = await supabase
        .from("trend_content")
        .select("relevance, raw_content (*)")
        .eq("trend_id", trendId)
        .order("relevance", { ascending: false })
        .limit(20);

      if (contentLinks) {
        setContents(contentLinks.map((l: any) => ({ ...l.raw_content, relevance: l.relevance })));
      }

      const { data: reportData } = await supabase
        .from("trend_reports")
        .select("*")
        .eq("trend_id", trendId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reportData) setReport(reportData);
      setLoading(false);
    }

    fetchData();
  }, [trendId, supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!trend) {
    return <p className="text-muted-foreground">Trend not found.</p>;
  }

  const TypeIcon = trend.type === "music" ? Music : Hash;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mt-0.5">
            <TypeIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{trend.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={trend.status} />
              <VelocityBadge score={Number(trend.velocity_score)} />
              {trend.category && <Badge variant="secondary">{trend.category}</Badge>}
            </div>
          </div>
        </div>
        <BreakoutScoreRing score={Number(trend.breakout_score)} size={72} strokeWidth={5} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Total Views", value: formatLarge(Number(trend.total_views)) },
          { icon: Heart, label: "Total Likes", value: formatLarge(Number(trend.total_likes)) },
          { icon: Users, label: "Posts", value: String(trend.content_count) },
          { icon: Clock, label: "First Seen", value: new Date(trend.first_seen).toLocaleDateString() },
        ].map((metric) => (
          <GlassCard key={metric.label} className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <metric.icon className="w-3.5 h-3.5" />
              <span className="text-xs">{metric.label}</span>
            </div>
            <p className="text-lg font-bold">{metric.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Timeline */}
      <GlassCard>
        <TrendTimeline contents={contents} />
      </GlassCard>

      {/* AI Strategy */}
      <AIStrategyCard
        trendId={trendId}
        brandId={activeBrand?.id || ""}
        existingReport={report}
      />

      {/* Hashtags */}
      {trend.hashtag_cluster?.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-sm mb-3">Hashtag Cluster</h3>
          <div className="flex flex-wrap gap-2">
            {trend.hashtag_cluster.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Content Grid */}
      <div>
        <h3 className="font-semibold mb-3">Related Content</h3>
        <ContentGrid contents={contents} />
      </div>
    </div>
  );
}

function formatLarge(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
