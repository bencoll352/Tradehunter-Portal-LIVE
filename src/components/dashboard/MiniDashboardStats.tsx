
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";

interface MiniDashboardStatsProps {
  liveTradersCount: number;
  recentlyActiveTradersCount: number;
}

export function MiniDashboardStats({ liveTradersCount, recentlyActiveTradersCount }: MiniDashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Live Traders
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveTradersCount}</div>
          <p className="text-xs text-muted-foreground">
            Total traders with active status
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Recently Active Traders
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentlyActiveTradersCount}</div>
          <p className="text-xs text-muted-foreground">
            Traders with activity in the last 30 days
          </p>
        </CardContent>
      </Card>
      {/* Additional stat cards can be added here in the future if needed */}
    </div>
  );
}
