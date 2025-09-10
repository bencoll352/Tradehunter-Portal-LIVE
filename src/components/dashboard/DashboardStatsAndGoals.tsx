
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, CalendarDays, CheckCircle, Goal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStatsAndGoalsProps {
  newLeadsCount: number;
  hotLeadsCount: number; 
  activeTradersGoalInitial?: number; 
}

export function DashboardStatsAndGoals({ 
    newLeadsCount, 
    hotLeadsCount,
    activeTradersGoalInitial = 0
}: DashboardStatsAndGoalsProps) {
  const { toast } = useToast();
  const [weeklyNewLeadsGoal, setWeeklyNewLeadsGoal] = useState<string>("");
  const [monthlyActiveTradersGoal, setMonthlyActiveTradersGoal] = useState<string>(activeTradersGoalInitial > 0 ? String(activeTradersGoalInitial) : "");

  const handleSetGoals = () => {
    const weeklyGoalNum = parseInt(weeklyNewLeadsGoal, 10);
    const monthlyGoalNum = parseInt(monthlyActiveTradersGoal, 10);

    if (weeklyNewLeadsGoal && (isNaN(weeklyGoalNum) || weeklyGoalNum < 0)) {
        toast({ variant: "destructive", title: "Invalid Goal", description: "Weekly New Leads Goal must be a positive number." });
        return;
    }
    if (monthlyActiveTradersGoal && (isNaN(monthlyGoalNum) || monthlyGoalNum < 0)) {
        toast({ variant: "destructive", title: "Invalid Goal", description: "Monthly Active Traders Goal must be a positive number." });
        return;
    }
    
    toast({
      title: "Goals Noted (Client-Side)",
      description: "Goal saving and tracking functionality is coming soon!",
      duration: 5000,
    });
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl text-primary">Branch Goals & Targets</CardTitle>
        </div>
        <CardDescription>Define your weekly and monthly targets to track progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSetGoals} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Goal className="mr-2 h-5 w-5" /> Set Goals (Coming Soon)
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}
