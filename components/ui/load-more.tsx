import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntersectionObserver } from "./intersection-observer";

interface LoadMoreProps {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error?: string | null;
  onLoadMore: () => void;
  showButton?: boolean;
  loadingText?: string;
  noMoreText?: string;
  errorText?: string;
  className?: string;
}

export const LoadMore = ({
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  showButton = false,
  loadingText = "Loading more...",
  noMoreText = "No more items to load",
  errorText = "Failed to load more items",
  className = "",
}: LoadMoreProps) => {
  // Don't render anything if initial loading or no more items
  if (isLoading || (!hasMore && !error)) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
        <p className="text-red-500 text-sm mb-4">{errorText}</p>
        <Button
          onClick={onLoadMore}
          variant="outline"
          size="sm"
          disabled={isLoadingMore}
        >
          {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Try Again
        </Button>
      </div>
    );
  }

  // Show "no more items" message
  if (!hasMore) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <p className="text-gray-500 text-sm">{noMoreText}</p>
      </div>
    );
  }

  // Show button mode
  if (showButton) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Button
          onClick={onLoadMore}
          variant="outline"
          disabled={isLoadingMore}
          className="min-w-[120px]"
        >
          {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoadingMore ? loadingText : "Load More"}
        </Button>
      </div>
    );
  }

  // Default: use intersection observer with loading indicator
  return (
    <IntersectionObserver
      onIntersect={onLoadMore}
      disabled={isLoadingMore || !hasMore}
      className={`flex items-center justify-center py-8 ${className}`}
      threshold={0.1}
      rootMargin="100px"
    >
      {isLoadingMore && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{loadingText}</span>
        </div>
      )}
    </IntersectionObserver>
  );
};
