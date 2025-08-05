
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, AlertTriangle } from "lucide-react"; 

export default function OutreachProPage() {
  const appUrl = "https://outreach-pro-ai-sales-assistant-302177537641.us-west1.run.app";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Outreach Pro</CardTitle>
                  <CardDescription>
                      A sales assistant to help craft compelling outreach messages and manage targeted campaigns.
                      <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: Data accuracy within this system is managed by the external provider. Verify critical information.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={appUrl}
              title="Outreach Pro"
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
