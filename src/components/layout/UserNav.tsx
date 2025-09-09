
"use client";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState }from 'react';
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { LogOut } from 'lucide-react';

export function UserNav() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      const info = getBranchInfo(storedLoggedInId);
      setBranchInfo(info);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInId');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.replace('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    // For "LEATHERHEAD Manager", take 'LM'
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {getInitials(branchInfo?.user)}
            </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5 text-sm text-sidebar-foreground">
            <div className="font-medium">{branchInfo?.displayLoginId || 'User'}</div>
            <div className="text-xs text-sidebar-foreground/70">{branchInfo?.role || 'Role'}</div>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
        </Button>
    </div>
  );
}
