
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
                Welcome to the TradeHunter Pro Estimator – your dedicated tool to streamline and enhance the quoting process.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            Designed specifically for UK builders merchants like Jewson, this feature empowers your team to rapidly generate precise, professional project estimates for your trade customers. By simplifying complex calculations and ensuring accuracy, the Estimator saves valuable time, reduces errors, and enables you to provide quick, detailed quotes, ultimately increasing your sales conversion rates and elevating customer service. Unlock faster, more efficient estimating and turn more enquiries into profitable projects.
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
