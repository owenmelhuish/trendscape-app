"use client";

import type { RawContent } from "@/types/content";

interface TrendTimelineProps {
  contents: RawContent[];
}

export function TrendTimeline({ contents }: TrendTimelineProps) {
  if (!contents.length) return null;

  // Group by day
  const grouped = contents.reduce<Record<string, number>>((acc, c) => {
    const day = new Date(c.post_created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const days = Object.entries(grouped).slice(-7);
  const maxCount = Math.max(...days.map(([, c]) => c));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Post Activity</h4>
      <div className="flex items-end gap-1.5 h-20">
        {days.map(([day, count]) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm teal-gradient"
              style={{
                height: `${(count / maxCount) * 100}%`,
                minHeight: "4px",
              }}
            />
            <span className="text-[10px] text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
