"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BrandWithRole } from "@/types/brand";

interface BrandContextType {
  brands: BrandWithRole[];
  activeBrand: BrandWithRole | null;
  setActiveBrand: (brand: BrandWithRole) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType>({
  brands: [],
  activeBrand: null,
  setActiveBrand: () => {},
  loading: true,
  refetch: async () => {},
});

export function useBrand() {
  return useContext(BrandContext);
}

export { BrandContext };

export function useBrandProvider() {
  const [brands, setBrands] = useState<BrandWithRole[]>([]);
  const [activeBrand, setActiveBrandState] = useState<BrandWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBrands = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("brand_members")
      .select(`role, brands (*)`)
      .eq("user_id", user.id);

    if (!error && data) {
      const mapped: BrandWithRole[] = data.map((row: any) => ({
        ...row.brands,
        role: row.role,
      }));
      setBrands(mapped);

      // Restore active brand from cookie or pick first
      const savedSlug = document.cookie
        .split("; ")
        .find((c) => c.startsWith("active_brand="))
        ?.split("=")[1];

      const saved = mapped.find((b) => b.slug === savedSlug);
      setActiveBrandState(saved || mapped[0] || null);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const setActiveBrand = useCallback((brand: BrandWithRole) => {
    setActiveBrandState(brand);
    document.cookie = `active_brand=${brand.slug}; path=/; max-age=31536000`;
  }, []);

  return {
    brands,
    activeBrand,
    setActiveBrand,
    loading,
    refetch: fetchBrands,
  };
}
