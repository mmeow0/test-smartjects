import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

type FilterCategoryProps = {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  icon?: React.ReactNode;
};

export const FilterCategory = ({
  title,
  options,
  selected,
  onToggle,
  icon,
}: FilterCategoryProps) => {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          aria-expanded={selected.length > 0}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 space-y-2">
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="max-h-60 pr-2">
            <div className="space-y-1">
              {filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <div
                    key={option}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => onToggle(option)}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <Badge variant="secondary" className="h-5 px-1.5">
                        <X className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
