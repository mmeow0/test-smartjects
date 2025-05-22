import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar(props: { onChange: (val: string) => void }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search smartjects, industries, technologies..."
        className="pl-10 pr-16"
        onChange={(e) => props.onChange(e.target.value)}
      />
      <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
        Search
      </Button>
    </div>
  );
}
