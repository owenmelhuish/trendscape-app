"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { BrandContext, useBrandProvider } from "@/hooks/use-brand";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const brandContext = useBrandProvider();

  return (
    <BrandContext.Provider value={brandContext}>
      <div className="min-h-screen">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 max-w-7xl">{children}</main>
        </div>
      </div>
    </BrandContext.Provider>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
