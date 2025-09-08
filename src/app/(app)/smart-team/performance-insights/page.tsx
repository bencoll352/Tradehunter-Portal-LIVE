
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, AlertTriangle } from "lucide-react"; 

export default function PerformanceInsightsPage() {
  const appUrl = "https://ai.studio/apps/drive/17_f9RP33EDHhr82Qu7HUiHNQswkT_Xw_";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Performance Insights</CardTitle>
                  <CardDescription>
                      A Sales Performance & Data Insights Platform.
                      <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: Data accuracy within this tool is managed by the external provider. Verify critical information.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={appUrl}
              title="Performance Insights"
              className="w-full h-full border-0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
