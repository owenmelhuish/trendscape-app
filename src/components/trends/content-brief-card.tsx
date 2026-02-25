"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { GlassCard } from "@/components/layout/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FORMAT_TYPE_CONFIG } from "@/lib/constants";
import {
  Brain,
  Lightbulb,
  ListOrdered,
  Music,
  MessageSquare,
  Type,
  Quote,
  Target,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  Hash,
  Gauge,
} from "lucide-react";
import { useTrendAnalysis } from "@/hooks/use-trend-analysis";
import type { TrendReport } from "@/types/report";

interface ContentBriefCardProps {
  trendId: string;
  brandId: string;
  existingReport?: TrendReport | null;
}

export function ContentBriefCard({ trendId, brandId, existingReport }: ContentBriefCardProps) {
  const { loading, phase, message, report: newReport, error, analyze } = useTrendAnalysis();

  const report = newReport || existingReport;

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Content Brief</h3>
            <p className="text-xs text-muted-foreground">{message || "Processing..."}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (!report) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-teal" />
            <h3 className="font-semibold">Content Brief</h3>
          </div>
          <Button
            size="sm"
            onClick={() => analyze(trendId, brandId)}
            className="teal-gradient text-white border-0 gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Brief
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate an AI-powered content brief with recreation steps, hooks, and caption templates.
        </p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </GlassCard>
    );
  }

  const formatConfig = report.format_type
    ? FORMAT_TYPE_CONFIG[report.format_type]
    : null;

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <GlassCard>
        <div className="space-y-6">
          {/* 1. Format Badge + Difficulty */}
          <div className="flex items-center gap-3 flex-wrap">
            {formatConfig && (
              <Badge
                variant="outline"
                className="text-xs font-medium"
                style={{
                  borderColor: formatConfig.color,
                  color: formatConfig.color,
                  backgroundColor: `${formatConfig.color}10`,
                }}
              >
                {formatConfig.label}
              </Badge>
            )}
            {report.format_label && (
              <span className="text-sm font-medium text-muted-foreground">
                {report.format_label}
              </span>
            )}
            {report.estimated_difficulty && (
              <DifficultyBadge difficulty={report.estimated_difficulty} />
            )}
          </div>

          {/* 2. What Makes It Replicable */}
          {report.what_makes_it_replicable && (
            <Section icon={Lightbulb} iconColor="text-amber-500" title="What Makes It Replicable">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.what_makes_it_replicable}
              </p>
            </Section>
          )}

          {/* 3. Recreation Steps */}
          {report.recreation_steps?.length > 0 && (
            <Section icon={ListOrdered} iconColor="text-blue-500" title="Recreation Steps">
              <ol className="space-y-2">
                {report.recreation_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* 4. Sound Requirements */}
          {report.required_sound && (
            <Section icon={Music} iconColor="text-pink-500" title="Sound Requirements">
              <div className="space-y-2">
                {report.required_sound.music_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sound:</span>
                    <CopyableText text={report.required_sound.music_name} />
                  </div>
                )}
                {report.required_sound.music_author && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">By:</span>
                    <span className="text-sm">{report.required_sound.music_author}</span>
                  </div>
                )}
                {report.required_sound.is_original_sound && (
                  <Badge variant="secondary" className="text-xs">Original Sound / Voiceover</Badge>
                )}
                {report.required_sound.usage_note && (
                  <p className="text-sm text-muted-foreground italic">
                    {report.required_sound.usage_note}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* 5. Hook Suggestions */}
          {report.recommended_hooks?.length > 0 && (
            <Section icon={MessageSquare} iconColor="text-violet-500" title="Hook Suggestions">
              <div className="space-y-2">
                {report.recommended_hooks.map((hook, i) => (
                  <CopyableText key={i} text={hook} />
                ))}
              </div>
            </Section>
          )}

          {/* 6. Caption Templates */}
          {report.caption_templates?.length > 0 && (
            <Section icon={Type} iconColor="text-emerald-500" title="Caption Templates">
              <div className="space-y-2">
                {report.caption_templates.map((template, i) => (
                  <CopyableText key={i} text={template} />
                ))}
              </div>
            </Section>
          )}

          {/* 7. Brand Adaptation */}
          {report.brand_adaptation && (
            <Section icon={Target} iconColor="text-brand-teal" title="Brand Adaptation">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.brand_adaptation}
              </p>
            </Section>
          )}

          {/* 8. Content Angles */}
          {report.content_angles?.length > 0 && (
            <Section icon={Sparkles} iconColor="text-brand-teal" title="Content Ideas">
              <ul className="space-y-1.5">
                {report.content_angles.map((angle, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-brand-teal mt-0.5 flex-shrink-0">-</span>
                    {angle}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* 9. Ready-to-Post Captions */}
          {report.example_captions?.length > 0 && (
            <Section icon={Quote} iconColor="text-orange-500" title="Ready-to-Post Captions">
              <div className="space-y-2">
                {report.example_captions.map((caption, i) => (
                  <CopyableText key={i} text={caption} />
                ))}
              </div>
            </Section>
          )}

          {/* 10. Risk Notes */}
          {report.risk_notes && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-sm text-amber-800">Risk Notes</h4>
              </div>
              <p className="text-sm text-amber-700">{report.risk_notes}</p>
            </div>
          )}

          {/* Why Trending (collapsed) */}
          {report.why_trending && (
            <Section icon={Brain} iconColor="text-muted-foreground" title="Why It's Trending">
              <p className="text-sm text-muted-foreground leading-relaxed">{report.why_trending}</p>
            </Section>
          )}

          {/* Relevance Score */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Brand relevance</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full teal-gradient rounded-full"
                  style={{ width: `${report.relevance_score}%` }}
                />
              </div>
              <span className="text-xs font-medium">{report.relevance_score}%</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function Section({
  icon: Icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-2 group">
      <p className="text-sm text-muted-foreground flex-1 bg-muted/50 rounded-md px-3 py-1.5">
        {text}
      </p>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    easy: { color: "#10B981", bg: "#ECFDF5" },
    medium: { color: "#F59E0B", bg: "#FFFBEB" },
    hard: { color: "#EF4444", bg: "#FEF2F2" },
  };
  const c = config[difficulty.toLowerCase()] || config.medium;

  return (
    <Badge
      variant="outline"
      className="text-xs font-medium gap-1"
      style={{ borderColor: c.color, color: c.color, backgroundColor: c.bg }}
    >
      <Gauge className="w-3 h-3" />
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}
