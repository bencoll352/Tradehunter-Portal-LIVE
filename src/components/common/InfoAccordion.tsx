
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
          <AccordionItem value={section.id} key={section.id} className="border border-sidebar-border rounded-md bg-sidebar-accent/10 overflow-hidden">
            <AccordionTrigger className="px-3 py-2.5 text-sm hover:no-underline [&[data-state=open]>svg]:text-sidebar-primary data-[state=open]:bg-sidebar-accent/30 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
              <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:gap-0">
                <IconComponent className="h-4 w-4 text-sidebar-primary group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                <span className="font-semibold text-sidebar-foreground text-left group-data-[collapsible=icon]:hidden">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-1 text-xs bg-sidebar-accent/10 group-data-[collapsible=icon]:hidden">
              <div className="space-y-1.5 text-sidebar-foreground/90">
                {section.content.map((point, pIndex) => (
                  <div key={pIndex} className="flex items-start">
                    <span className="mr-2 mt-0.5 text-sidebar-primary">&#8227;</span> {/* Bullet point */}
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

