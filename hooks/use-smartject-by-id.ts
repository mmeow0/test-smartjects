import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { smartjectService } from "@/lib/services";
import type { SmartjectType } from "@/lib/types";

export function useSmartjectById(smartjectId?: string) {
  const router = useRouter();
  const [smartject, setSmartject] = useState<SmartjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { toast } = useToast();

  const fetchSmartject = useCallback(
    async (refetch = false) => {
      if (!smartjectId) return;

      setIsLoading(!refetch);
      setError(null);

      try {
        const data = await smartjectService.getSmartjectById(smartjectId);

        if (data) {
          setSmartject(data);
        } else {
          toast({
            title: "Error",
            description: "Smartject not found",
            variant: "destructive",
          });
          router.push("/hub");
        }
      } catch (error) {
        console.error("Error fetching smartject:", error);
        toast({
          title: "Error",
          description: "Failed to load smartject details",
          variant: "destructive",
        });
        setError(error instanceof Error ? error : new Error("Unknown error"));
        setSmartject(null);
      } finally {
        setIsLoading(false);
      }
    },
    [smartjectId, router]
  );

  const refetch = useCallback(() => {
    fetchSmartject(true);
  }, [fetchSmartject]);

  useEffect(() => {
    fetchSmartject();
  }, [fetchSmartject]);

  return {
    smartject,
    isLoading,
    error,
    refetch,
  };
}
