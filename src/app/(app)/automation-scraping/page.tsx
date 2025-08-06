
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";

export default function AutomationScrapingPage() {
  const botasaurusUrl = "https://github.com/bencoll352/botasaurus";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl text-primary">Botasaurus: Automation & Scraping</CardTitle>
              <CardDescription>
                Access the powerful open-source web scraping and automation framework.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            Botasaurus is a sophisticated tool designed for creating resilient, scalable, and powerful scrapers and bots. It provides a rich set of features to handle common automation challenges like avoiding detection, managing browser instances, and handling data storage.
          </p>
          <p className="mb-6 text-foreground">
            Click the button below to visit the official GitHub repository where you can explore the code, view the documentation, and get started with building your own automations.
          </p>
          <Button asChild>
            <a href={botasaurusUrl} target="_blank" rel="noopener noreferrer">
              Go to Botasaurus <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
