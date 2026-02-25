"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDUSTRIES } from "@/lib/constants";
import type { Brand } from "@/types/brand";

interface BrandFormProps {
  brand: Brand;
  onSave: (updates: Partial<Brand>) => Promise<void>;
}

export function BrandForm({ brand, onSave }: BrandFormProps) {
  const [name, setName] = useState(brand.name);
  const [industry, setIndustry] = useState(brand.industry);
  const [primaryColor, setPrimaryColor] = useState(brand.primary_color || "#14B8A6");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ name, industry, primary_color: primaryColor });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Brand Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Brand Color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-10 h-10 rounded-md cursor-pointer"
          />
          <Input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-28"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
