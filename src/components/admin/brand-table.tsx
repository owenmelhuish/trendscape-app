"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { Brand } from "@/types/brand";

interface BrandTableProps {
  brands: Brand[];
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function BrandTable({ brands, onToggleActive, onDelete }: BrandTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Brand</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Industry</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Keywords</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: brand.primary_color || "#14B8A6" }}
                  >
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{brand.industry}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap">
                  {brand.keywords?.slice(0, 3).map((k) => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                  ))}
                  {(brand.keywords?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{brand.keywords!.length - 3}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={brand.is_active ? "default" : "outline"} className="text-xs">
                  {brand.is_active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleActive(brand.id, !brand.is_active)}
                  >
                    {brand.is_active ? (
                      <ToggleRight className="w-4 h-4 text-brand-teal" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(brand.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
