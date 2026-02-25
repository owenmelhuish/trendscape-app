"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { INDUSTRIES } from "@/lib/constants";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BrandOnboardingProps {
  onComplete: () => void;
}

export function BrandOnboarding({ onComplete }: BrandOnboardingProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#14B8A6");
  const [submitting, setSubmitting] = useState(false);

  const addKeyword = useCallback(() => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setKeywordInput("");
    }
  }, [keywordInput, keywords]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const isValid = name.trim().length > 0 && keywords.length > 0;

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry,
          keywords,
          primary_color: primaryColor,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create brand");
      }

      toast.success("Brand created! Loading your dashboard...");
      onComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-12 max-w-lg mx-auto"
    >
      <motion.div variants={fadeInUp} className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Your Brand</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Set up your brand to start discovering trends in your industry.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="w-full">
        <GlassCard className="space-y-5">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name *</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords *</Label>
            <p className="text-xs text-muted-foreground">
              These keywords power TikTok trend scraping for your brand. Add terms your audience
              searches for.
            </p>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a keyword and press Enter"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyword}
                disabled={!keywordInput.trim()}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {keywords.length === 0 && (
              <p className="text-xs text-destructive">At least 1 keyword is required</p>
            )}
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="brand-color">Brand Color (optional)</Label>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-9 h-9 rounded-md border border-input cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{primaryColor}</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full teal-gradient text-white border-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Brand"
            )}
          </Button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
