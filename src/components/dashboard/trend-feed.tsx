"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { TrendCard } from "./trend-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import type { Trend } from "@/types/trend";

interface TrendFeedProps {
  trends: Trend[];
  loading: boolean;
}

export function TrendFeed({ trends, loading }: TrendFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!trends.length) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No trends yet"
        description="Trends will appear here after your first scrape and detection run."
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {trends.map((trend) => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </motion.div>
  );
}
