"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onSelect?: (date?: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  className,
  date,
  onSelect,
  placeholder = "Pick a date range",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (selectedRange?: DateRange) => {
      onSelect?.(selectedRange);

    },
    [onSelect],
  );

  const formatDateRange = (dateRange?: DateRange) => {
    if (!dateRange?.from) {
      return placeholder;
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "MMM dd, y")} - ${format(dateRange.to, "MMM dd, y")}`;
    }

    return format(dateRange.from, "MMM dd, y");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date-range-picker"
          variant="outline"
          className={cn(
            "w-10 justify-center text-center font-normal bg-white border-gray-200 hover:bg-gray-50 h-10",
            !date?.from && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="h-4 w-4" />
          {/* {formatDateRange(date)} */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={1}
          disabled={disabled}
          className="rounded-md border"
          showOutsideDays={false}
        />
      </PopoverContent>
    </Popover>
  );
}
