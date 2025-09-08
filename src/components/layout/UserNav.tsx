
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
      const storedUser = localStorage.getItem('loggedInUser');
      const info = getBranchInfo(storedLoggedInId, storedUser);
      setBranchInfo(info);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInId');
    localStorage.removeItem('loggedInUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.replace('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                      <AvatarFallback>
                        {branchInfo?.user ? getInitials(branchInfo.user.split('@')[0]) : <User/>}
                      </AvatarFallback>
                  </Avatar>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{branchInfo?.branchName || 'Loading...'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {branchInfo?.user || 'user@example.com'}
                      </p>
                  </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                 {/* Future items can go here */}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );
}
