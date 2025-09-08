
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Flame, UserPlus } from "lucide-react"; // Changed PhoneCall to Flame

interface MiniDashboardStatsProps {
  liveTradersCount: number;
  recentlyActiveTradersCount: number;
  callBackTradersCount: number; 
  newLeadTradersCount: number;  
}

export function MiniDashboardStats({ 
  liveTradersCount, 
  recentlyActiveTradersCount,
  callBackTradersCount,
  newLeadTradersCount
}: MiniDashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Active Traders
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveTradersCount}</div>
          <p className="text-xs text-muted-foreground">
            Total traders with 'Active' status
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Hot Leads 🔥
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{callBackTradersCount}</div>
          <p className="text-xs text-muted-foreground">
            Traders status 'Call-Back' (Hot Leads)
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            New Leads
          </CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newLeadTradersCount}</div>
          <p className="text-xs text-muted-foreground">
            Traders identified as 'New Lead'
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
    </div>
  );
}
