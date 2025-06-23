import { memo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { SkeletonGrid } from "./skeleton-grid";
import { CardSkeleton } from "./card-skeleton";
import type { SmartjectType } from "@/lib/types";

const SmartjectCard = dynamic(
  () =>
    import("@/components/smartject-card").then((mod) => ({
      default: mod.SmartjectCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  },
);

interface SmartjectsGridProps {
  smartjects: SmartjectType[];
  isLoading: boolean;
  onVoted: () => void;
  emptyMessage?: string;
}

export const SmartjectsGrid = memo(
  ({
    smartjects,
    isLoading,
    onVoted,
    emptyMessage = "No smartjects found matching your criteria.",
  }: SmartjectsGridProps) => {
    if (isLoading) {
      return <SkeletonGrid />;
    }

    if (smartjects.length === 0) {
      return (
        <div className="col-span-3 text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">{emptyMessage}</p>
          <Button variant="outline" asChild>
            <a href="/discover">Browse All Smartjects</a>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartjects.map((smartject) => (
          <SmartjectCard
            key={smartject.id}
            smartject={smartject}
            onVoted={onVoted}
            userVotes={smartject.userVotes}
          />
        ))}
      </div>
    );
  },
);

SmartjectsGrid.displayName = "SmartjectsGrid";
