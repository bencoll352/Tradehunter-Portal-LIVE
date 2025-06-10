
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Added this import

interface InfoSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode[]; // Array of content points (can be strings or JSX)
  defaultOpen?: boolean;
}

interface InfoAccordionProps {
  sections: InfoSection[];
  className?: string;
}

export function InfoAccordion({ sections, className }: InfoAccordionProps) {
  const defaultOpenValues = sections
    .filter(section => section.defaultOpen)
    .map(section => section.id);

  return (
    <Accordion type="multiple" defaultValue={defaultOpenValues} className={cn("w-full space-y-3", className)}>
      {sections.map((section) => {
        const IconComponent = section.icon;
        return (
          <AccordionItem value={section.id} key={section.id} className="border rounded-lg shadow-sm bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-lg hover:no-underline [&[data-state=open]>svg]:text-primary data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-3">
                <IconComponent className="h-5 w-5 text-primary" />
                <span className="font-semibold text-card-foreground text-left">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 text-sm bg-card">
              <div className="space-y-2 text-muted-foreground">
                {section.content.map((point, pIndex) => (
                  <div key={pIndex} className="flex items-start">
                    <span className="mr-2 mt-1 text-primary">&#8227;</span> {/* Bullet point */}
                    <div className="flex-1">{point}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
