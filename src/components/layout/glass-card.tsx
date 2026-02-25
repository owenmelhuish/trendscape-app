import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6",
        hover && "glass-hover transition-all duration-300 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
