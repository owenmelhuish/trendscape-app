"use client";

import { useState, useCallback } from "react";

interface ScrapeState {
  loading: boolean;
  jobId: string | null;
  error: string | null;
}

export function useScrape() {
  const [state, setState] = useState<ScrapeState>({
    loading: false,
    jobId: null,
    error: null,
  });

  const triggerScrape = useCallback(async (brandId: string) => {
    setState({ loading: true, jobId: null, error: null });

    try {
      const response = await fetch("/api/scrape/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState({ loading: false, jobId: null, error: data.error });
      } else {
        setState({ loading: false, jobId: data.jobId, error: null });
      }
    } catch (error) {
      setState({ loading: false, jobId: null, error: String(error) });
    }
  }, []);

  return { ...state, triggerScrape };
}
