import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBadgeProps {
  type: "industry" | "technology" | "function" | "team" | "date";
  value: string;
  onRemove: (value: string) => void;
}

export const FilterBadge = memo(
  ({ type, value, onRemove }: FilterBadgeProps) => {
    const handleRemove = useCallback(() => onRemove(value), [onRemove, value]);

    const colorConfig = {
      industry: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      technology: "bg-green-100 text-green-800 hover:bg-green-200",
      function: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      team: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      date: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    };

    const bgColor = colorConfig[type];

    return (
      <Badge
        variant="secondary"
        className={`flex items-center gap-1 ${bgColor} rounded-full px-3 py-1`}
      >
        {value}
        <X
          className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500"
          onClick={handleRemove}
        />
      </Badge>
    );
  },
);

FilterBadge.displayName = "FilterBadge";
