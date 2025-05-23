import { useEffect, useState, useCallback } from "react";
import { smartjectService } from "@/lib/services";
import type { SmartjectType } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

type GroupedSmartjects = {
  believe: SmartjectType[];
  need: SmartjectType[];
  provide: SmartjectType[];
};

export function useUserSmartjects(userId?: string) {
  const [smartjects, setSmartjects] = useState<GroupedSmartjects>({
    believe: [],
    need: [],
    provide: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchSmartjects = useCallback(async (refetch = false) => {
    if (!userId) return;

    setIsLoading(!refetch);

    try {
      const data = await smartjectService.getUserSmartjects(userId);

      const grouped: GroupedSmartjects = {
        believe: [],
        need: [],
        provide: [],
      };

      data.forEach((smartject) => {
        if (smartject.userVotes?.believe) grouped.believe.push(smartject);
        if (smartject.userVotes?.need) grouped.need.push(smartject);
        if (smartject.userVotes?.provide) grouped.provide.push(smartject);
      });

      setSmartjects(grouped);
    } catch (error) {
      console.error("Error fetching voted smartjects:", error);
      toast({
        title: "Error",
        description: "Failed to load your smartjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    fetchSmartjects(true);
  }, [fetchSmartjects]);

  useEffect(() => {
    fetchSmartjects();
  }, [fetchSmartjects]);

  return {
    smartjects,
    isLoading,
    refetch,
  };
}
