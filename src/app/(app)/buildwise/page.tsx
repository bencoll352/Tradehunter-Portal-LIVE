
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, AlertTriangle } from "lucide-react"; 

export default function BuildwisePage() {
  const buildwiseAppUrl = "https://studio.firebase.google.com/u/0/studio-4493006154"; 

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">BuildWise Portal</CardTitle>
                  <CardDescription>
                      Access specialised data and insights from the BuildWise external application.
                      <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: Data accuracy within this portal is managed by the external provider. Verify critical information.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={buildwiseAppUrl}
              title="BuildWise Portal"
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
