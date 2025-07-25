import { useEffect, useState, useCallback, useMemo } from "react";
import { smartjectService } from "@/lib/services";
import type { SmartjectType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type Filters = {
  query?: string;
  industries?: string[];
  audience?: string[];
  businessFunctions?: string[];
};

type AvailableFilters = {
  industries: string[];
  audience: string[];
  businessFunctions: string[];
};

export function useSmartjects(userId?: string) {
  const { toast } = useToast();

  const [smartjects, setSmartjects] = useState<SmartjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    industries: [],
    audience: [],
    businessFunctions: [],
  });

  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    industries: [],
    audience: [],
    businessFunctions: [],
  });

  const fetchSmartjects = useCallback(
    async (refetch: boolean = false) => {
      setIsLoading(!refetch);
      try {
        const data = await smartjectService.getSmartjects(userId);
        setSmartjects(data);
      } catch (error) {
        console.error("Error fetching smartjects:", error);
        toast({
          title: "Error",
          description: "Failed to load smartjects",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const refetch = () => fetchSmartjects(true);

  const fetchAvailableFilters = useCallback(async () => {
    try {
      const filters = await smartjectService.getAvailableFilters();
      setAvailableFilters(filters);

      setFilters((prev) => ({
        ...prev,
        industries: filters.industries,
        audience: filters.audience,
        businessFunctions: filters.businessFunctions,
      }));
    } catch (error) {
      console.error("Error fetching available filters:", error);
      toast({
        title: "Error",
        description: "Failed to load available filters",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchSmartjects();
    fetchAvailableFilters();
  }, [fetchSmartjects, fetchAvailableFilters]);

  const setFilter = (field: keyof Filters, value: string[] | string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      industries: [],
      audience: [],
      businessFunctions: [],
    });
  };

  const filteredSmartjects = useMemo(() => {
    return smartjects.filter((s) => {
      const matchesQuery =
        !filters.query ||
        s.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
        s.mission?.toLowerCase().includes(filters.query.toLowerCase()) ||
        s.problematics?.toLowerCase().includes(filters.query.toLowerCase()) ||
        s.scope?.toLowerCase().includes(filters.query.toLowerCase());

      const matchesIndustries =
        filters.industries?.length === 0 ||
        filters.industries?.some((i) => s.industries?.includes(i));

      const matchesAudience =
        filters.audience?.length === 0 ||
        filters.audience?.some((t) => s.audience?.includes(t));

      const matchesFunctions =
        filters.businessFunctions?.length === 0 ||
        filters.businessFunctions?.some((f) =>
          s.businessFunctions?.includes(f)
        );

      return (
        matchesQuery &&
        matchesIndustries &&
        matchesAudience &&
        matchesFunctions
      );
    });
  }, [smartjects, filters]);

  return {
    smartjects: filteredSmartjects,
    allSmartjects: smartjects,
    isLoading,
    filters,
    setFilter,
    clearFilters,
    refetch,
    meta: availableFilters,
  };
}
