
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function EstimatorPage() {
  const estimatorAppUrl = "https://building-materials-estimator-302177537641.us-west1.run.app/";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Materials Estimator</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Access the external Building Materials Estimator tool.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            This section embeds the Building Materials Estimator application. Use the scrollbars within the embedded content to navigate.
            If you encounter any issues, please try accessing the site directly.
          </p>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={estimatorAppUrl}
              title="Building Materials Estimator"
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
