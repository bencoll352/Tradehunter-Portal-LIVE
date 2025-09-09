
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ChartData {
    name: string;
    count: number;
    fill: string;
}

interface BranchPerformanceChartProps {
    data: ChartData[];
}

const chartConfig = {
  count: {
    label: "Traders",
  },
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  "hot-leads": {
    label: "Hot Leads",
    color: "hsl(var(--chart-2))",
  },
  "new-leads": {
    label: "New Leads",
    color: "hsl(var(--chart-3))",
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function BranchPerformanceChart({ data }: BranchPerformanceChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Branch Performance Chart</CardTitle>
        <CardDescription>A visual summary of your trader pipeline status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 10, top: 10, right: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" dataKey="count" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={1}
                className="fill-muted-foreground text-sm"
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" layout="vertical" radius={5} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
