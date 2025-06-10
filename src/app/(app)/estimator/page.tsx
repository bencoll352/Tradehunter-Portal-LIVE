"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, HelpCircle, ListChecks } from "lucide-react";
import { InfoAccordion } from "@/components/common/InfoAccordion";

const estimatorInfoSections = [
  {
    id: "estimator-capabilities",
    title: "Materials Estimator Capabilities",
    icon: ListChecks,
    defaultOpen: true,
    content: [
      "Access External Estimator: This page embeds an external Building Materials Estimator tool.",
      "Estimate Project Materials: Use the tool to estimate quantities of various materials needed for common construction projects.",
    ],
  },
  {
    id: "estimator-how-to-use",
    title: "How to Use the Materials Estimator",
    icon: HelpCircle,
    content: [
      "Access the Estimator: Click the 'Estimator' tab in the main header.",
      "Navigate the Tool: Use the interface and scrollbars provided within the embedded content area to interact with the estimator.",
      "Input Project Details: Follow the instructions within the embedded tool to input your project specifications.",
      "View Estimates: The tool will provide material estimates based on your inputs.",
      "Note: This is an external tool. For detailed questions about its specific calculations or features, refer to any help documentation provided within the tool itself.",
      "The Branch Booster on the Dashboard page also has a 'Estimate Project Materials' quick action that can provide general material lists using its own knowledge base."
    ],
  },
];


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
      <InfoAccordion sections={estimatorInfoSections} className="mt-8"/>
    </div>
  );
}
