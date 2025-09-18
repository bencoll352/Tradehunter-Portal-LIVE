
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TestTube2 } from "lucide-react";

export default function TestPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TestTube2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl text-primary">Test Page</CardTitle>
              <CardDescription>This is a test page for development and demonstration purposes.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>You can add any test components or content here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
