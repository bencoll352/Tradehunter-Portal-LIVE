
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { getTradersByBranch } from "@/lib/mock-data";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { MiniDashboardStats } from './MiniDashboardStats'; // New import
import { parseISO } from 'date-fns'; // For date calculations

type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BranchId, values: TraderFormValues) => Promise<Trader | null>;
  updateTraderAction: (branchId: BranchId, traderId: string, values: TraderFormValues) => Promise<Trader | null>;
  deleteTraderAction: (branchId: BranchId, traderId: string) => Promise<boolean>;
  bulkAddTradersAction: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction,
}: DashboardClientPageContentProps) {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForTable, setKeyForTable] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
      setBranchId(storedBranchId);
      if (storedBranchId) {
        const initialTraders = getTradersByBranch(storedBranchId);
        setTraders(initialTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      }
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (branchId) {
      const currentTraders = getTradersByBranch(branchId);
      setTraders(currentTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      setKeyForTable(prev => prev + 1); 
    }
  }, [branchId]);

  const liveTradersCount = useMemo(() => {
    return traders.filter(t => t.status === 'Active').length;
  }, [traders]);

  const recentlyActiveTradersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return traders.filter(t => {
      try {
        const lastActivityDate = parseISO(t.lastActivity);
        return lastActivityDate >= thirtyDaysAgo;
      } catch (e) {
        // Handle potential invalid date string in lastActivity
        console.warn(`Invalid date format for trader ID ${t.id}: ${t.lastActivity}`);
        return false; 
      }
    }).length;
  }, [traders]);

  const handleAdd = async (values: TraderFormValues): Promise<void> => {
    if (!branchId) {
      console.error("Branch ID not available for add action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return;
    }
    const newTrader = await addTraderAction(branchId, values);
    if (newTrader) {
      setTraders(prev => [...prev, newTrader].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: `${newTrader.name} added successfully.`});
    }
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<void> => {
     if (!branchId) {
      console.error("Branch ID not available for update action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return;
    }
    const updatedTrader = await updateTraderAction(branchId, traderId, values);
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: `${updatedTrader.name} updated successfully.`});
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update trader." });
    }
  };

  const handleDelete = async (traderId: string) => {
     if (!branchId) {
      console.error("Branch ID not available for delete action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return false;
    }
    const success = await deleteTraderAction(branchId, traderId);
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
    } else {
       toast({ variant: "destructive", title: "Error", description: "Failed to delete trader from server." });
    }
    return success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]) => {
    if (!branchId) {
      console.error("Branch ID not available for bulk add action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return null;
    }
    const newTraders = await bulkAddTradersAction(branchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    } 
    return newTraders;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full md:w-1/2 lg:w-1/3" /> {/* Skeleton for mini dashboard */}
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!branchId) {
    return <p>Error: Branch ID not found. Please ensure you are logged in.</p>;
  }
  
  return (
    <div className="space-y-6"> {/* Outer div to space mini-dashboard and main content */}
      <MiniDashboardStats 
        liveTradersCount={liveTradersCount}
        recentlyActiveTradersCount={recentlyActiveTradersCount}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Trader Overview</CardTitle>
              <CardDescription>Manage traders for branch: {branchId}</CardDescription>
            </CardHeader>
            <CardContent>
              <TraderTableClient 
                key={keyForTable}
                initialTraders={traders} 
                branchId={branchId}
                allBranchTraders={traders}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onBulkAdd={handleBulkAdd}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProfitPartnerAgentClient traders={traders} />
        </div>
      </div>
    </div>
  );
}
