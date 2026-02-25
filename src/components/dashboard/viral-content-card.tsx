"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";
import { Eye, Heart, Share2, MessageCircle, Music } from "lucide-react";
import { VideoEmbed } from "@/components/trends/video-embed";
import { cn } from "@/lib/utils";
import type { RawContent } from "@/types/content";

interface ViralContentCardProps {
  content: RawContent;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function scoreBadgeColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

export function ViralContentCard({ content }: ViralContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const score = content.virality_score ?? 0;
  const engRate = content.engagement_rate
    ? `${(content.engagement_rate * 100).toFixed(1)}%`
    : "—";

  const isOriginalSound = content.music_name?.toLowerCase().includes("original sound");

  return (
    <motion.div
      variants={staggerItem}
      className="glass rounded-xl overflow-hidden group"
    >
      {/* Video thumbnail / embed */}
      <div className="relative">
        <VideoEmbed
          postId={content.post_id}
          authorUsername={content.author_username}
          thumbnailUrl={content.thumbnail_url}
        />

        {/* Virality score badge */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border",
              scoreBadgeColor(score)
            )}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Content info */}
      <div className="p-3 space-y-2">
        {/* Author */}
        <p className="text-sm font-medium truncate">
          @{content.author_username}
        </p>

        {/* Caption */}
        <p
          className={cn(
            "text-xs text-muted-foreground",
            !expanded && "line-clamp-2"
          )}
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setExpanded(!expanded); }}
        >
          {content.caption}
        </p>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNumber(content.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatNumber(content.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            {formatNumber(content.shares)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {engRate}
          </span>
        </div>

        {/* Music info */}
        {content.music_name && !isOriginalSound && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Music className="w-3 h-3 shrink-0" />
            {content.music_name}
          </p>
        )}
      </div>
    </motion.div>
  );
}
