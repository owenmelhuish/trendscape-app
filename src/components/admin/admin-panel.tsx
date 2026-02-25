"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/layout/glass-card";
import { BrandTable } from "@/components/admin/brand-table";
import { ScrapeJobMonitor } from "@/components/admin/scrape-job-monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { INDUSTRIES } from "@/lib/constants";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Brand } from "@/types/brand";

function AdminContent() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", slug: "", industry: INDUSTRIES[0] as string, keywords: "" });
  const supabase = createClient();

  const fetchBrands = async () => {
    const { data } = await supabase.from("brands").select("*").order("created_at", { ascending: false });
    if (data) setBrands(data);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBrand.name,
          slug: newBrand.slug || undefined,
          industry: newBrand.industry,
          keywords: newBrand.keywords.split(",").map((k) => k.trim()).filter(Boolean),
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create brand");
      }

      toast.success("Brand created");
      setDialogOpen(false);
      setNewBrand({ name: "", slug: "", industry: INDUSTRIES[0] as string, keywords: "" });
      fetchBrands();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from("brands").update({ is_active: active }).eq("id", id);
    fetchBrands();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand and all its data?")) return;
    await supabase.from("brands").delete().eq("id", id);
    toast.success("Brand deleted");
    fetchBrands();
  };

  const handleTriggerAllScrapes = async () => {
    for (const brand of brands.filter((b) => b.is_active)) {
      await fetch("/api/scrape/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      });
    }
    toast.success("Scrapes triggered for all active brands");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Admin Panel" description="Manage brands and scraping jobs" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTriggerAllScrapes} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Scrape All
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="teal-gradient text-white border-0 gap-1">
                <Plus className="w-3.5 h-3.5" />
                New Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={newBrand.slug}
                    onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                    placeholder={newBrand.name.toLowerCase().replace(/\s+/g, "-")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select
                    value={newBrand.industry}
                    onChange={(e) => setNewBrand({ ...newBrand, industry: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={newBrand.keywords}
                    onChange={(e) => setNewBrand({ ...newBrand, keywords: e.target.value })}
                    placeholder="trend1, trend2, trend3"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">Create Brand</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <BrandTable
        brands={brands}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      <GlassCard>
        <h3 className="font-semibold mb-4">Recent Scrape Jobs</h3>
        <ScrapeJobMonitor />
      </GlassCard>
    </div>
  );
}

export function AdminPanel() {
  return (
    <AuthProvider>
      <Header />
      <AdminContent />
    </AuthProvider>
  );
}
