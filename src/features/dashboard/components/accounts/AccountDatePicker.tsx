"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addMonths, format, startOfDay } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AccountDatePickerProps {
  label: string;
  placeholder: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  startingDate?: Date | undefined; // For ending date calculations
  showPresets?: boolean; // Show quick duration presets
  minDate?: Date; // Minimum selectable date
}

export default function AccountDatePicker({
  label,
  placeholder,
  date,
  setDate,
  startingDate,
  showPresets = false,
  minDate,
}: AccountDatePickerProps) {
  // Helper function to calculate ending date based on preset duration
  const handlePresetSelection = (value: string) => {
    // Use startingDate if available, otherwise use today as fallback
    const baseDate = startingDate
      ? startOfDay(startingDate)
      : startOfDay(new Date());

    switch (value) {
      case "1_month":
        setDate(addMonths(baseDate, 1));
        break;
      case "2_months":
        setDate(addMonths(baseDate, 2));
        break;
      case "3_months":
        setDate(addMonths(baseDate, 3));
        break;
      case "6_months":
        setDate(addMonths(baseDate, 6));
        break;
      case "1_year":
        setDate(addMonths(baseDate, 12));
        break;
      default:
        break;
    }
  };

  // Helper function to format the base date for display
  const getBaseDateText = () => {
    if (startingDate) {
      return `from ${format(startingDate, "MMM dd, yyyy")}`;
    }
    return "from today";
  };

  // Calculate disabled dates
  const getDisabledDate = (date: Date) => {
    // If minDate is provided, use it
    if (minDate) {
      return date < minDate;
    }

    // If startingDate is provided, don't allow dates before it
    if (startingDate) {
      return date < new Date(startingDate);
    }

    // Default: allow all dates (no arbitrary restrictions)
    return false;
  };

  return (
    <Popover>
      <Label>{label}</Label>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={showPresets ? "flex flex-col space-y-2 p-2" : "p-0"}
      >
        {showPresets && (
          <Select onValueChange={handlePresetSelection}>
            <SelectTrigger>
              <SelectValue placeholder="Quick select duration" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[280px]">
              <SelectItem value="1_month">
                <div className="flex flex-col">
                  <span>1 month</span>
                  <span className="text-xs text-muted-foreground">
                    {getBaseDateText()}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="2_months">
                <div className="flex flex-col">
                  <span>2 months</span>
                  <span className="text-xs text-muted-foreground">
                    {getBaseDateText()}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="3_months">
                <div className="flex flex-col">
                  <span>3 months</span>
                  <span className="text-xs text-muted-foreground">
                    {getBaseDateText()}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="6_months">
                <div className="flex flex-col">
                  <span>6 months</span>
                  <span className="text-xs text-muted-foreground">
                    {getBaseDateText()}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="1_year">
                <div className="flex flex-col">
                  <span>1 year</span>
                  <span className="text-xs text-muted-foreground">
                    {getBaseDateText()}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className={showPresets ? "rounded-md border" : ""}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={getDisabledDate}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
