"use client";

import { useEffect, useRef, useCallback } from "react";

interface IntersectionObserverProps {
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const IntersectionObserver = ({
  onIntersect,
  threshold = 0.1,
  rootMargin = "0px",
  disabled = false,
  children,
  className,
}: IntersectionObserverProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (disabled) return;

      const [entry] = entries;
      if (entry?.isIntersecting) {
        onIntersect();
      }
    },
    [onIntersect, disabled],
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target || disabled) return;

    // Check if we're in browser environment and IntersectionObserver is available
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      return;
    }

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new window.IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(target);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersect, threshold, rootMargin, disabled]);

  return (
    <div ref={targetRef} className={className}>
      {children}
    </div>
  );
};
