"use client";

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showOutsideDays?: boolean;
  className?: string;
  classNames?: Record<string, string>;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <DayPicker
      classNames={{
        root: `${defaultClassNames.root} shadow-lg p-5`, // Add a shadow to the root element
        chevron: `${defaultClassNames.chevron} fill-amber-500`, // Change the color of the chevron
      }}
     {...props}
      disabled={[
          { after: new Date() },
        ]}
      showOutsideDays={showOutsideDays}
      mode="range"
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
