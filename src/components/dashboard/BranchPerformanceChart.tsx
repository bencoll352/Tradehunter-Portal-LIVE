
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ChartData {
    name: string;
    count: number;
    fill: string;
}

interface BranchPerformanceChartProps {
    data: ChartData[];
}

export function BranchPerformanceChart({ data }: BranchPerformanceChartProps) {
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Branch Performance Chart</CardTitle>
        <CardDescription>A visual summary of your trader pipeline status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ 
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="count" fill="currentColor" radius={[0, 4, 4, 0]} className="fill-primary" />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
