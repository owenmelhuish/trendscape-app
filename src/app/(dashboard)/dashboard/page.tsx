"use client";

import { useBrand } from "@/hooks/use-brand";
import { useTrends } from "@/hooks/use-trends";
import { BrandSelector } from "@/components/layout/brand-selector";
import { SectionHeader } from "@/components/shared/section-header";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { TrendFeed } from "@/components/dashboard/trend-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { TREND_CATEGORIES } from "@/lib/constants";
import type { TrendStatus } from "@/types/trend";

const STATUS_FILTERS: { label: string; value: TrendStatus[] }[] = [
  { label: "All", value: [] },
  { label: "Emerging", value: ["emerging"] },
  { label: "Active", value: ["active"] },
  { label: "Peaking", value: ["peaking"] },
  { label: "Declining", value: ["declining"] },
];

export default function DashboardPage() {
  const { activeBrand, loading: brandLoading } = useBrand();
  const [statusFilter, setStatusFilter] = useState<TrendStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { trends, loading: trendsLoading } = useTrends({
    brandId: activeBrand?.id,
    status: statusFilter.length > 0 ? statusFilter : undefined,
    category: categoryFilter || undefined,
    limit: 50,
  });

  if (brandLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-24 bg-muted rounded-xl" />
    </div>;
  }

  if (!activeBrand) {
    return (
      <EmptyState
        icon={Building2}
        title="No brand selected"
        description="You need to be added to a brand to view trends. Contact your admin."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Trend Dashboard"
          description={`Tracking trends for ${activeBrand.name}`}
        />
        <BrandSelector />
      </div>

      <StatsBar trends={trends} />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.label}
              variant={JSON.stringify(statusFilter) === JSON.stringify(filter.value) ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className="h-7 text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Category:</span>
          <Button
            variant={!categoryFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("")}
            className="h-7 text-xs"
          >
            All
          </Button>
          {TREND_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="h-7 text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <TrendFeed trends={trends} loading={trendsLoading} />
    </div>
  );
}
