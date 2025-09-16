
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode[];
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
    <Accordion type="multiple" defaultValue={defaultOpenValues} className={cn("w-full space-y-2", className)}>
      {sections.map((section) => {
        const IconComponent = section.icon;
        return (
          <AccordionItem value={section.id} key={section.id} className="border-0">
            <AccordionTrigger className="px-3 py-2.5 text-sm hover:no-underline rounded-md bg-muted/50 hover:bg-muted text-foreground">
              <div className="flex items-center gap-2.5">
                <IconComponent className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-left">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-2 text-sm bg-card text-muted-foreground">
              <div className="space-y-2">
                {section.content.map((point, pIndex) => (
                  <div key={pIndex} className="flex items-start">
                    {/* The content itself is now a React node which may or may not have an icon */}
                    {point}
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
