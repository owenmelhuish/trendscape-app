"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface TeamMembersProps {
  brandId: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

export function TeamMembers({ brandId }: TeamMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from("brand_members")
        .select("*")
        .eq("brand_id", brandId);

      if (data) setMembers(data);
      setLoading(false);
    }

    fetchMembers();
  }, [brandId, supabase]);

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm">{members.length} team member{members.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">{member.user_id.slice(0, 8)}...</span>
            <Badge variant="outline" className="capitalize text-xs">{member.role}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
