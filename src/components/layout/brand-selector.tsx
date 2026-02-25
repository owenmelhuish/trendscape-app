"use client";

import { cn } from "@/lib/utils";
import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Building2 } from "lucide-react";

export function BrandSelector() {
  const { brands, activeBrand, setActiveBrand, loading } = useBrand();

  if (loading) {
    return (
      <div className="h-9 w-40 bg-muted animate-pulse rounded-lg" />
    );
  }

  if (!brands.length) {
    return (
      <div className="text-sm text-muted-foreground">No brands configured</div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[160px] justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: activeBrand?.primary_color || "#14B8A6" }}
            >
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span className="truncate max-w-[120px]">{activeBrand?.name || "Select brand"}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            onClick={() => setActiveBrand(brand)}
            className={cn(
              "gap-2",
              brand.id === activeBrand?.id && "bg-accent"
            )}
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: brand.primary_color || "#14B8A6" }}
            >
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{brand.name}</span>
              <span className="text-xs text-muted-foreground">{brand.industry}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
