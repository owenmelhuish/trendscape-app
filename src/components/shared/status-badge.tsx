import { Badge } from "@/components/ui/badge";
import { TREND_STATUS_CONFIG } from "@/lib/constants";
import type { TrendStatus } from "@/types/trend";

interface StatusBadgeProps {
  status: TrendStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = TREND_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className="font-medium"
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: `${config.color}10`,
      }}
    >
      {config.label}
    </Badge>
  );
}
