
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle } from "lucide-react"; 

export default function SalesNavigatorAgentPage() {
  const agentUrl = "https://sales-navigator-302177537641.us-west1.run.app";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Sales Navigator</CardTitle>
                  <CardDescription>
                      A specialized agent to help navigate sales data, identify leads, and provide tactical recommendations.
                      <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: Data accuracy within this agent is managed by the external provider. Verify critical information.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={agentUrl}
              title="Sales Navigator"
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
