"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { VideoEmbed } from "./video-embed";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Share2, MessageCircle } from "lucide-react";
import type { RawContent } from "@/types/content";

interface ContentGridProps {
  contents: Array<RawContent & { relevance?: number }>;
}

export function ContentGrid({ contents }: ContentGridProps) {
  if (!contents.length) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {contents.map((content) => (
        <motion.div key={content.id} variants={staggerItem}>
          <div className="space-y-2">
            <VideoEmbed
              postId={content.post_id}
              authorUsername={content.author_username}
              thumbnailUrl={content.thumbnail_url}
            />
            <div className="space-y-1">
              <p className="text-xs font-medium truncate">@{content.author_username}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{content.caption}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {formatNum(content.views)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" />
                  {formatNum(content.likes)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
