import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SmartjectsGrid } from "./smartjects-grid";
import type { SmartjectType } from "@/lib/types";

interface SmartjectsTabsProps {
  sortBy: "recent" | "most-needed" | "most-provided" | "most-believed";
  onSortChange: (
    value: "recent" | "most-needed" | "most-provided" | "most-believed",
  ) => void;
  categorizedSmartjects: {
    recent: SmartjectType[];
    mostNeeded: SmartjectType[];
    mostProvided: SmartjectType[];
    mostBelieved: SmartjectType[];
  };
  isLoading: boolean;
  onVoted: () => void;
}

export const SmartjectsTabs = memo(
  ({
    sortBy,
    onSortChange,
    categorizedSmartjects,
    isLoading,
    onVoted,
  }: SmartjectsTabsProps) => {
    const getCurrentSmartjects = () => {
      switch (sortBy) {
        case "recent":
          return categorizedSmartjects.recent;
        case "most-needed":
          return categorizedSmartjects.mostNeeded;
        case "most-provided":
          return categorizedSmartjects.mostProvided;
        case "most-believed":
          return categorizedSmartjects.mostBelieved;
        default:
          return categorizedSmartjects.recent;
      }
    };

    const getEmptyMessage = () => {
      const sortType = sortBy === "recent" ? "recent " : "";
      return `No ${sortType}smartjects found matching your criteria.`;
    };

    return (
      <Tabs
        value={sortBy}
        onValueChange={(value) => onSortChange(value as typeof sortBy)}
      >
        <TabsContent value="recent" className="space-y-4">
          <SmartjectsGrid
            smartjects={getCurrentSmartjects()}
            isLoading={isLoading}
            onVoted={onVoted}
            emptyMessage={getEmptyMessage()}
          />
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
              asChild
            >
              <a href="/discover">View More</a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="most-needed" className="space-y-4">
          <SmartjectsGrid
            smartjects={getCurrentSmartjects()}
            isLoading={isLoading}
            onVoted={onVoted}
            emptyMessage={getEmptyMessage()}
          />
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
              asChild
            >
              <a href="/discover">View More</a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="most-provided" className="space-y-4">
          <SmartjectsGrid
            smartjects={getCurrentSmartjects()}
            isLoading={isLoading}
            onVoted={onVoted}
            emptyMessage={getEmptyMessage()}
          />
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
              asChild
            >
              <a href="/discover">View More</a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="most-believed" className="space-y-4">
          <SmartjectsGrid
            smartjects={getCurrentSmartjects()}
            isLoading={isLoading}
            onVoted={onVoted}
            emptyMessage={getEmptyMessage()}
          />
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
              asChild
            >
              <a href="/discover">View More</a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    );
  },
);

SmartjectsTabs.displayName = "SmartjectsTabs";
