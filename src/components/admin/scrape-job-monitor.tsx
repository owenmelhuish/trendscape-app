"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ScrapeJob } from "@/types/scrape";

interface ScrapeJobMonitorProps {
  brandId?: string;
}

const statusConfig: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: "#94A3B8" },
  running: { icon: Loader2, color: "#3B82F6" },
  completed: { icon: CheckCircle, color: "#14B8A6" },
  failed: { icon: XCircle, color: "#EF4444" },
};

export function ScrapeJobMonitor({ brandId }: ScrapeJobMonitorProps) {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      let query = supabase
        .from("scrape_jobs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      if (brandId) {
        query = query.eq("brand_id", brandId);
      }

      const { data } = await query;
      if (data) setJobs(data);
      setLoading(false);
    }

    fetchJobs();
  }, [brandId, supabase]);

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => {
        const config = statusConfig[job.status];
        const Icon = config.icon;

        return (
          <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 ${job.status === "running" ? "animate-spin" : ""}`}
                style={{ color: config.color }}
              />
              <div>
                <p className="text-sm font-medium">
                  {job.keywords_used?.join(", ") || "No keywords"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.started_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {job.items_found > 0 && (
                <span className="text-xs text-muted-foreground">{job.items_found} items</span>
              )}
              <Badge
                variant="outline"
                className="text-xs capitalize"
                style={{ borderColor: config.color, color: config.color }}
              >
                {job.status}
              </Badge>
            </div>
          </div>
        );
      })}
      {jobs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No scrape jobs yet.</p>
      )}
    </div>
  );
}
