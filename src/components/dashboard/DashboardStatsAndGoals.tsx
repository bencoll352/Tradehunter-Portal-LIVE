"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, CalendarDays, CheckCircle, Goal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateGoalsAction } from '@/app/(app)/tradehunter/actions';
import type { BaseBranchId } from '@/types';

interface DashboardStatsAndGoalsProps {
  branchId: BaseBranchId;
  newLeadsCount: number;
  hotLeadsCount: number; 
  initialGoals: {
    weeklyNewLeadsGoal?: number;
    monthlyActiveTradersGoal?: number;
  };
  onGoalsUpdated: (goals: { weeklyNewLeadsGoal?: number; monthlyActiveTradersGoal?: number; }) => void;
}

export function DashboardStatsAndGoals({ 
    branchId,
    newLeadsCount, 
    hotLeadsCount,
    initialGoals,
    onGoalsUpdated
}: DashboardStatsAndGoalsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyNewLeadsGoal, setWeeklyNewLeadsGoal] = useState<string>("");
  const [monthlyActiveTradersGoal, setMonthlyActiveTradersGoal] = useState<string>("");

  useEffect(() => {
    setWeeklyNewLeadsGoal(initialGoals.weeklyNewLeadsGoal?.toString() || "");
    setMonthlyActiveTradersGoal(initialGoals.monthlyActiveTradersGoal?.toString() || "");
  }, [initialGoals]);


  const handleSetGoals = async () => {
    const weeklyGoalNum = weeklyNewLeadsGoal ? parseInt(weeklyNewLeadsGoal, 10) : undefined;
    const monthlyGoalNum = monthlyActiveTradersGoal ? parseInt(monthlyActiveTradersGoal, 10) : undefined;

    if (weeklyNewLeadsGoal && (isNaN(weeklyGoalNum!) || weeklyGoalNum! < 0)) {
        toast({ variant: "destructive", title: "Invalid Goal", description: "Weekly New Leads Goal must be a positive number." });
        return;
    }
    if (monthlyActiveTradersGoal && (isNaN(monthlyGoalNum!) || monthlyGoalNum! < 0)) {
        toast({ variant: "destructive", title: "Invalid Goal", description: "Monthly Active Traders Goal must be a positive number." });
        return;
    }

    setIsLoading(true);
    const result = await updateGoalsAction(branchId, {
      weeklyNewLeadsGoal: weeklyGoalNum,
      monthlyActiveTradersGoal: monthlyGoalNum,
    });
    setIsLoading(false);
    
    if (result.success && result.data) {
        toast({
            title: "Goals Updated",
            description: "Your new branch goals have been saved.",
        });
        onGoalsUpdated(result.data);
    } else {
        toast({
            variant: "destructive",
            title: "Error Saving Goals",
            description: result.error || "An unknown error occurred.",
        });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl text-primary">Branch Goals & Targets</CardTitle>
        </div>
        <CardDescription>Define your weekly and monthly targets to track progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyNewLeadsGoal" className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                Weekly New Leads
              </Label>
              <Input
                id="weeklyNewLeadsGoal"
                type="number"
                placeholder="e.g., 10"
                value={weeklyNewLeadsGoal}
                onChange={(e) => setWeeklyNewLeadsGoal(e.target.value)}
                className="text-base"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyActiveTradersGoal" className="flex items-center gap-1.5 text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                Monthly Active Traders
              </Label>
              <Input
                id="monthlyActiveTradersGoal"
                type="number"
                placeholder="e.g., 50"
                value={monthlyActiveTradersGoal}
                onChange={(e) => setMonthlyActiveTradersGoal(e.target.value)}
                className="text-base"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSetGoals} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Goal className="mr-2 h-5 w-5" />} 
              {isLoading ? "Saving..." : "Set Goals"}
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}
