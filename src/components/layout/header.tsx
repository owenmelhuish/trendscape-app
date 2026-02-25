"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 border-b border-border/50 glass sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg teal-gradient" />
          <span className="font-bold text-base">TrendScape</span>
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-brand-teal" />
                </div>
                <span className="text-sm hidden sm:inline">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
