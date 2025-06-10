
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Flame, Target, CalendarDays, CheckCircle, TrendingUp, Goal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardStatsAndGoalsProps {
  newLeadsCount: number;
  hotLeadsCount: number; // Derived from 'Call-Back' status traders
  activeTradersGoalInitial?: number; // For initializing the monthly active traders goal input
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
    // Basic validation example (can be expanded)
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
    
    // For now, just show a toast. Persistence will be added later.
    toast({
      title: "Goals Noted (Client-Side)",
      description: "Goal saving and tracking functionality is coming soon!",
      duration: 5000,
    });
    // In a future implementation, this would involve calling a server action to save the goals.
    // console.log("Setting Goals:", { weeklyNewLeadsGoal, monthlyActiveTradersGoal });
  };

  return (
    <Card className="shadow-lg w-full border-accent/30">
      <CardHeader>
        <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div>
                <CardTitle className="text-2xl text-accent">Branch Pulse & Targets</CardTitle>
                <CardDescription>Key performance indicators and goal setting for your branch.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Active Leads"
            value={newLeadsCount}
            icon={<UserCheck className="h-6 w-6 text-blue-500" />}
            description="Traders currently in 'New Lead' status."
          />
          <StatCard
            title="Hot Leads"
            value={hotLeadsCount}
            icon={<Flame className="h-6 w-6 text-orange-500" />}
            description="Traders marked for 'Call-Back'."
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary"/>
                <h3 className="text-xl font-semibold text-primary">Set Your Branch Goals</h3>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyNewLeadsGoal" className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                Weekly New Leads Goal
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
                Monthly Active Traders Reached Goal
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
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-md border-border hover:border-primary/20 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
