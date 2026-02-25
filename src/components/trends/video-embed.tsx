"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  postId: string;
  authorUsername: string;
  thumbnailUrl?: string | null;
  className?: string;
}

export function VideoEmbed({ postId, authorUsername, thumbnailUrl, className }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = `https://www.tiktok.com/@${authorUsername}/video/${postId}`;

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className={cn(
          "relative w-full aspect-[9/16] rounded-lg bg-muted overflow-hidden group cursor-pointer",
          className
        )}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-foreground ml-0.5" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={cn("w-full aspect-[9/16] rounded-lg overflow-hidden", className)}>
      <iframe
        src={`https://www.tiktok.com/embed/v2/${postId}`}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-popups"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
