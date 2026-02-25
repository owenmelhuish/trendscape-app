"use client";

import { useBrand } from "@/hooks/use-brand";
import { useViralFeed, type ViralSortBy, type MinViewsFilter } from "@/hooks/use-viral-feed";
import { BrandSelector } from "@/components/layout/brand-selector";
import { SectionHeader } from "@/components/shared/section-header";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ViralContentCard } from "@/components/dashboard/viral-content-card";
import { BrandOnboarding } from "@/components/onboarding/brand-onboarding";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { Loader2 } from "lucide-react";

const SORT_OPTIONS: { label: string; value: ViralSortBy }[] = [
  { label: "Virality", value: "virality_score" },
  { label: "Views", value: "views" },
  { label: "Engagement", value: "engagement_rate" },
  { label: "Recent", value: "post_created_at" },
];

const MIN_VIEWS_OPTIONS: { label: string; value: MinViewsFilter }[] = [
  { label: "All", value: 0 },
  { label: "10K+", value: 10_000 },
  { label: "100K+", value: 100_000 },
  { label: "1M+", value: 1_000_000 },
];

export default function DashboardPage() {
  const { activeBrand, loading: brandLoading, refetch } = useBrand();

  const {
    content,
    total,
    loading,
    loadingMore,
    sortBy,
    setSortBy,
    minViews,
    setMinViews,
    loadMore,
    hasMore,
  } = useViralFeed({ brandId: activeBrand?.id });

  if (brandLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!activeBrand) {
    return <BrandOnboarding onComplete={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={`What's Viral in ${activeBrand.industry}`}
          description={`Ranked content feed for ${activeBrand.name}`}
        />
        <BrandSelector />
      </div>

      <StatsBar content={content} total={total} />

      {/* Sort & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={sortBy === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(opt.value)}
              className="h-7 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Min views:</span>
          {MIN_VIEWS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={minViews === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setMinViews(opt.value)}
              className="h-7 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[9/16] bg-muted rounded-xl" />
              <div className="mt-2 space-y-1">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No content found. Trigger a scrape to start discovering viral videos.</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {content.map((item) => (
              <ViralContentCard key={item.id} content={item} />
            ))}
          </motion.div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
