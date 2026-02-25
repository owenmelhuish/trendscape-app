"use client";

import { useBrand } from "@/hooks/use-brand";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/layout/glass-card";
import { BrandForm } from "@/components/settings/brand-form";
import { KeywordEditor } from "@/components/settings/keyword-editor";
import { TeamMembers } from "@/components/settings/team-members";
import { EmptyState } from "@/components/shared/empty-state";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import type { Brand } from "@/types/brand";

export default function SettingsPage() {
  const { activeBrand, loading, refetch } = useBrand();
  const supabase = createClient();

  if (loading) return null;

  if (!activeBrand) {
    return (
      <EmptyState
        icon={Settings}
        title="No brand selected"
        description="Select a brand to manage settings."
      />
    );
  }

  const handleSaveBrand = async (updates: Partial<Brand>) => {
    const { error } = await supabase
      .from("brands")
      .update(updates)
      .eq("id", activeBrand.id);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Brand updated");
      refetch();
    }
  };

  const handleSaveKeywords = async (keywords: string[]) => {
    const { error } = await supabase
      .from("brands")
      .update({ keywords })
      .eq("id", activeBrand.id);

    if (error) {
      toast.error("Failed to save keywords");
    } else {
      toast.success("Keywords updated");
      refetch();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader
        title="Settings"
        description={`Configure ${activeBrand.name}`}
      />

      <GlassCard>
        <h3 className="font-semibold mb-4">Brand Details</h3>
        <BrandForm brand={activeBrand} onSave={handleSaveBrand} />
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-4">Tracking Keywords</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These keywords are used to scrape TikTok for relevant content.
        </p>
        <KeywordEditor keywords={activeBrand.keywords || []} onSave={handleSaveKeywords} />
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-4">Team</h3>
        <TeamMembers brandId={activeBrand.id} />
      </GlassCard>
    </div>
  );
}
