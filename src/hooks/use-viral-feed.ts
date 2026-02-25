"use client";

import { useState, useEffect, useCallback } from "react";
import type { RawContent } from "@/types/content";

export type ViralSortBy = "virality_score" | "views" | "likes" | "engagement_rate" | "post_created_at";
export type MinViewsFilter = 0 | 10_000 | 100_000 | 1_000_000;

interface UseViralFeedOptions {
  brandId: string | undefined;
}

const PAGE_SIZE = 24;

export function useViralFeed({ brandId }: UseViralFeedOptions) {
  const [content, setContent] = useState<RawContent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ViralSortBy>("virality_score");
  const [minViews, setMinViews] = useState<MinViewsFilter>(0);
  const [offset, setOffset] = useState(0);

  const fetchContent = useCallback(async (reset = true) => {
    if (!brandId) {
      setLoading(false);
      return;
    }

    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const currentOffset = reset ? 0 : offset;
    const params = new URLSearchParams({
      brandId,
      sortBy,
      minViews: String(minViews),
      limit: String(PAGE_SIZE),
      offset: String(currentOffset),
    });

    try {
      const res = await fetch(`/api/content/viral?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (reset) {
        setContent(data.content);
      } else {
        setContent((prev) => [...prev, ...data.content]);
      }
      setTotal(data.total);
      setOffset(currentOffset + PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [brandId, sortBy, minViews, offset]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchContent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, sortBy, minViews]);

  const loadMore = useCallback(() => {
    if (!loadingMore && content.length < total) {
      fetchContent(false);
    }
  }, [loadingMore, content.length, total, fetchContent]);

  const hasMore = content.length < total;

  return {
    content,
    total,
    loading,
    loadingMore,
    error,
    sortBy,
    setSortBy,
    minViews,
    setMinViews,
    loadMore,
    hasMore,
    refetch: () => fetchContent(true),
  };
}
