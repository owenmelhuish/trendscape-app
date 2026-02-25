import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface VelocityBadgeProps {
  score: number;
}

export function VelocityBadge({ score }: VelocityBadgeProps) {
  const getConfig = (score: number) => {
    if (score >= 75) return { label: "Rapid", color: "#EF4444", bg: "#FEF2F2" };
    if (score >= 50) return { label: "Fast", color: "#F59E0B", bg: "#FFFBEB" };
    if (score >= 25) return { label: "Moderate", color: "#3B82F6", bg: "#EFF6FF" };
    return { label: "Slow", color: "#94A3B8", bg: "#F8FAFC" };
  };

  const config = getConfig(score);

  return (
    <Badge
      variant="outline"
      className="gap-1 font-medium text-xs"
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      <Zap className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
