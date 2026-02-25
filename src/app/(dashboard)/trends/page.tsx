"use client";

import { useBrand } from "@/hooks/use-brand";
import { useTrends } from "@/hooks/use-trends";
import { SectionHeader } from "@/components/shared/section-header";
import { BrandSelector } from "@/components/layout/brand-selector";
import { TrendFeed } from "@/components/dashboard/trend-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

export default function TrendsPage() {
  const { activeBrand, loading: brandLoading } = useBrand();
  const { trends, loading: trendsLoading } = useTrends({
    brandId: activeBrand?.id,
    limit: 100,
  });

  if (brandLoading) return null;

  if (!activeBrand) {
    return (
      <EmptyState
        icon={Building2}
        title="No brand selected"
        description="Select a brand to explore trends."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Trend Explorer"
          description="Browse all detected trends"
        />
        <BrandSelector />
      </div>
      <TrendFeed trends={trends} loading={trendsLoading} />
    </div>
  );
}
