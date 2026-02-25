"use client";

import { useState, useCallback, useRef } from "react";

type ScrapeStatus = "idle" | "scraping" | "processing" | "completed" | "failed";

interface ScrapeState {
  status: ScrapeStatus;
  jobId: string | null;
  error: string | null;
}

export function useScrape() {
  const [state, setState] = useState<ScrapeState>({
    status: "idle",
    jobId: null,
    error: null,
  });
  const abortRef = useRef(false);

  const triggerScrape = useCallback(async (brandId: string) => {
    abortRef.current = false;
    setState({ status: "scraping", jobId: null, error: null });

    try {
      const response = await fetch("/api/scrape/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState({ status: "failed", jobId: null, error: data.error });
        return;
      }

      const { jobId } = data;
      setState({ status: "scraping", jobId, error: null });

      // Poll loop
      while (!abortRef.current) {
        const pollRes = await fetch("/api/scrape/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, brandId }),
        });

        const pollData = await pollRes.json();

        if (pollData.status === "completed") {
          setState({ status: "completed", jobId, error: null });
          return;
        }

        if (pollData.status === "failed") {
          setState({ status: "failed", jobId, error: "Scrape run failed" });
          return;
        }

        // Still running — wait a moment before polling again
        setState((prev) => ({ ...prev, status: "processing" }));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      setState({ status: "failed", jobId: null, error: String(error) });
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { ...state, triggerScrape, cancel };
}
