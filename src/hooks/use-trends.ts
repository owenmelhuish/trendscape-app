"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trend, TrendStatus, FormatType } from "@/types/trend";

type SortBy = "breakout_score" | "relevance_score" | "velocity_score";

interface UseTrendsOptions {
  brandId: string | undefined;
  status?: TrendStatus[];
  category?: string;
  formatType?: FormatType;
  sortBy?: SortBy;
  limit?: number;
}

export function useTrends({ brandId, status, category, formatType, sortBy = "breakout_score", limit = 20 }: UseTrendsOptions) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTrends = useCallback(async () => {
    if (!brandId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("trends")
      .select("*")
      .eq("brand_id", brandId);

    if (status?.length) {
      query = query.in("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (formatType) {
      query = query.eq("format_type", formatType);
    }

    query = query.order(sortBy, { ascending: false }).limit(limit);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTrends(data || []);
    }
    setLoading(false);
  }, [brandId, status, category, formatType, sortBy, limit, supabase]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { trends, loading, error, refetch: fetchTrends };
}
