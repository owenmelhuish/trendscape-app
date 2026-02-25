"use client";

import { useState, useCallback } from "react";
import type { TrendReport } from "@/types/report";

interface AnalysisState {
  loading: boolean;
  phase: string | null;
  message: string | null;
  report: TrendReport | null;
  error: string | null;
}

export function useTrendAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    phase: null,
    message: null,
    report: null,
    error: null,
  });

  const analyze = useCallback(async (trendId: string, brandId: string) => {
    setState({ loading: true, phase: null, message: null, report: null, error: null });

    try {
      const response = await fetch("/api/trends/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId, brandId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start analysis");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setState((prev) => ({
                ...prev,
                phase: data.phase,
                message: data.message,
              }));
            } else if (data.type === "complete") {
              setState({
                loading: false,
                phase: "complete",
                message: "Analysis complete",
                report: data.report,
                error: null,
              });
            } else if (data.type === "error") {
              setState((prev) => ({
                ...prev,
                loading: false,
                error: data.message,
              }));
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: String(error),
      }));
    }
  }, []);

  return { ...state, analyze };
}
