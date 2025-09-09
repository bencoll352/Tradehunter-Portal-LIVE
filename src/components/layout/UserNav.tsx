
"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState }from 'react';
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { User, LogOut } from 'lucide-react';


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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>
            {branchInfo?.user ? getInitials(branchInfo.user) : <User/>}
            </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5 text-sm">
            <div className="font-medium">{branchInfo?.user || 'User'}</div>
            <div className="text-muted-foreground">{branchInfo?.displayLoginId || 'Branch'}</div>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
        </Button>
    </div>
  );
}
