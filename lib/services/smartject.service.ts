import { getSupabaseBrowserClient } from "../supabase";
import type { SmartjectType } from "../types";

export const smartjectService = {
  // Get user votes mapping
  async getUserVotes(
    userId: string,
  ): Promise<{ [smartjectId: string]: ("believe" | "need" | "provide")[] }> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("votes")
      .select("smartject_id, vote_type")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user votes:", error);
      return {};
    }

    const result: {
      [smartjectId: string]: ("believe" | "need" | "provide")[];
    } = {};

    if (data) {
      data.forEach((vote: any) => {
        if (!result[vote.smartject_id]) result[vote.smartject_id] = [];
        if (
          vote.vote_type === "believe" ||
          vote.vote_type === "need" ||
          vote.vote_type === "provide"
        ) {
          result[vote.smartject_id].push(vote.vote_type);
        }
      });
    }

    return result;
  },

  // Get smartjects with pagination and filtering
  async getSmartjectsPaginated(
    userId?: string,
    page: number = 0,
    pageSize: number = 12,
    filters?: {
      query?: string;
      industries?: string[];
      audience?: string[];
      businessFunctions?: string[];
    },
    sortBy:
      | "recent"
      | "most-needed"
      | "most-provided"
      | "most-believed" = "recent",
  ): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    // Step 1: Get smartject IDs that match the filters from related tables
    let filteredSmartjectIds: string[] | null = null;

    // Check if we have any related table filters that need special handling
    const hasRelatedFilters =
      (filters?.industries && filters.industries.length > 0) ||
      (filters?.audience && filters.audience.length > 0) ||
      (filters?.businessFunctions && filters.businessFunctions.length > 0);

    if (hasRelatedFilters) {
      const smartjectIds = new Set<string>();

      // Get IDs from industry filter
      if (filters?.industries && filters.industries.length > 0) {
        const { data: industryData, error: industryError } = await supabase
          .from("smartject_industries")
          .select("smartject_id, industries!inner(name)")
          .in("industries.name", filters.industries);

        if (industryError) {
          console.error("Error fetching industry filtered IDs:", industryError);
          return [];
        }

        if (industryData && industryData.length > 0) {
          industryData.forEach((item: any) => smartjectIds.add(item.smartject_id));
        } else {
          return []; // No matches found
        }
      }

      // Get IDs from audience filter
      if (filters?.audience && filters.audience.length > 0) {
        const { data: audienceData, error: audienceError } = await supabase
          .from("smartject_audience")
          .select("smartject_id, audience!inner(name)")
          .in("audience.name", filters.audience);

        if (audienceError) {
          console.error("Error fetching audience filtered IDs:", audienceError);
          return [];
        }

        if (audienceData && audienceData.length > 0) {
          const audienceIds = new Set(audienceData.map((item: any) => item.smartject_id));
          if (smartjectIds.size > 0) {
            // Intersect with existing IDs
            const intersection = new Set([...smartjectIds].filter(id => audienceIds.has(id)));
            smartjectIds.clear();
            intersection.forEach(id => smartjectIds.add(id));
          } else {
            audienceData.forEach((item: any) => smartjectIds.add(item.smartject_id));
          }
        } else {
          return []; // No matches found
        }
      }

      // Get IDs from business functions filter
      if (filters?.businessFunctions && filters.businessFunctions.length > 0) {
        const { data: functionsData, error: functionsError } = await supabase
          .from("smartject_business_functions")
          .select("smartject_id, business_functions!inner(name)")
          .in("business_functions.name", filters.businessFunctions);

        if (functionsError) {
          console.error("Error fetching business functions filtered IDs:", functionsError);
          return [];
        }

        if (functionsData && functionsData.length > 0) {
          const functionIds = new Set(functionsData.map((item: any) => item.smartject_id));
          if (smartjectIds.size > 0) {
            // Intersect with existing IDs
            const intersection = new Set([...smartjectIds].filter(id => functionIds.has(id)));
            smartjectIds.clear();
            intersection.forEach(id => smartjectIds.add(id));
          } else {
            functionsData.forEach((item: any) => smartjectIds.add(item.smartject_id));
          }
        } else {
          return []; // No matches found
        }
      }

      filteredSmartjectIds = Array.from(smartjectIds);

      // If no smartjects match the filters, return empty array
      if (filteredSmartjectIds.length === 0) {
        return [];
      }
    }


    // Step 2: Get full smartject data
    let query = supabase.from("smartjects").select(
      `
      *,
      smartject_industries (
        industries (name)
      ),
      smartject_business_functions (
        business_functions (name)
      ),
      smartject_audience (
        audience (name)
      ),
      votes (vote_type),
      comments(count)
    `,
    );

    // If we have filtered IDs, only get those smartjects
    if (filteredSmartjectIds) {
      query = query.in("id", filteredSmartjectIds);
    } else {
      // Apply text search filter only if no related filters were applied
      if (filters?.query && filters.query.trim()) {
        const searchTerm = `%${filters.query.toLowerCase()}%`;
        query = query.or(
          `title.ilike.${searchTerm},mission.ilike.${searchTerm},problematics.ilike.${searchTerm},scope.ilike.${searchTerm}`,
        );
      }
    }

    let data: any[] = [];
    let error: any = null;

    // Apply sorting based on sortBy parameter
    if (sortBy === "recent") {
      // For recent sorting, use database ordering with pagination
      const { data: dbData, error: dbError } = await query
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      data = dbData || [];
      error = dbError;
    } else {
      // For vote-based sorting, fetch all matching records and sort in memory
      const { data: allData, error: allError } = await query.order(
        "created_at",
        { ascending: false },
      );

      if (allError || !allData) {
        data = [];
        error = allError;
      } else {
        // Convert to SmartjectType format first for consistent sorting
        const formattedData = allData.map((item: any) => {
          const voteCount = {
            believe: 0,
            need: 0,
            provide: 0,
          };

          if (Array.isArray(item.votes)) {
            item.votes.forEach((vote: any) => {
              if (vote.vote_type && voteCount.hasOwnProperty(vote.vote_type)) {
                voteCount[vote.vote_type as keyof typeof voteCount]++;
              }
            });
          }

          return { ...item, voteCount };
        });

        // Sort based on vote type
        let sortedData: any[];
        switch (sortBy) {
          case "most-needed":
            sortedData = formattedData.sort(
              (a, b) => b.voteCount.need - a.voteCount.need,
            );
            break;
          case "most-provided":
            sortedData = formattedData.sort(
              (a, b) => b.voteCount.provide - a.voteCount.provide,
            );
            break;
          case "most-believed":
            sortedData = formattedData.sort(
              (a, b) => b.voteCount.believe - a.voteCount.believe,
            );
            break;
          default:
            sortedData = formattedData;
        }

        // Apply pagination after sorting
        data = sortedData.slice(page * pageSize, (page + 1) * pageSize);
      }
    }

    if (error || !data) {
      console.error("Error fetching smartjects:", error);
      return [];
    }

    return this.formatSmartjects(data, userVotesMap, userId);
  },

  // Get all smartjects (legacy method)
  async getSmartjects(userId?: string): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    const { data, error } = await supabase
      .from("smartjects")
      .select(
        `
      *,
      smartject_industries (
        industries (name)
      ),
      smartject_business_functions (
        business_functions (name)
      ),
      smartject_audience (
        audience (name)
      ),
      votes (vote_type),
      comments(count)
    `,
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching smartjects:", error);
      return [];
    }

    return this.formatSmartjects(data, userVotesMap, userId);
  },

  // Format smartjects data
  formatSmartjects(
    data: any[],
    userVotesMap: { [smartjectId: string]: ("believe" | "need" | "provide")[] },
    userId?: string,
  ): SmartjectType[] {
    return data.map((item: any) => {
      const voteCount = {
        believe: 0,
        need: 0,
        provide: 0,
      };

      if (Array.isArray(item.votes)) {
        item.votes.forEach((vote: any) => {
          if (vote.vote_type && voteCount.hasOwnProperty(vote.vote_type)) {
            voteCount[vote.vote_type as keyof typeof voteCount]++;
          }
        });
      }

      const userVotes = {
        believe: false,
        need: false,
        provide: false,
      };

      if (userId && userVotesMap[item.id as string]) {
        for (const voteType of userVotesMap[item.id as string]) {
          if (
            voteType === "believe" ||
            voteType === "need" ||
            voteType === "provide"
          ) {
            userVotes[voteType as keyof typeof userVotes] = true;
          }
        }
      }

      const industries = Array.isArray(item.smartject_industries)
        ? item.smartject_industries
            .map((i: any) => i.industries?.name)
            .filter(Boolean)
        : [];
      const businessFunctions = Array.isArray(item.smartject_business_functions)
        ? item.smartject_business_functions
            .map((f: any) => f.business_functions?.name)
            .filter(Boolean)
        : [];
      const audience = Array.isArray(item.smartject_audience)
        ? item.smartject_audience
            .map((a: any) => a.audience?.name)
            .filter(Boolean)
        : [];

      return {
        id: item.id as string,
        title: item.title as string,
        votes: voteCount,
        userVotes,
        comments:
          (Array.isArray(item.comments) && item.comments[0]?.count) || 0,
        createdAt: item.created_at as string,
        mission: (item.mission || "") as string,
        problematics: (item.problematics || "") as string,
        scope: (item.scope || "") as string,
        howItWorks: (item.how_it_works || "") as string,
        architecture: (item.architecture || "") as string,
        innovation: (item.innovation || "") as string,
        useCase: (item.use_case || "") as string,
        industries,
        businessFunctions,
        audience,
        relevantLinks: [] as { title: string; url: string }[],
        researchPapers: [] as { title: string; url: string }[],
        image: item.image_url as string | undefined,
      };
    });
  },

  // Get a single smartject by ID
  async getSmartjectById(
    id: string,
    userId?: string,
  ): Promise<SmartjectType | null> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    const { data, error } = await supabase
      .from("smartjects")
      .select(
        `
        *,
        smartject_industries (
          industries (name)
        ),
        smartject_business_functions (
          business_functions (name)
        ),
        smartject_audience (
          audience (name)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching smartject with ID ${id}:`, error);
      return null;
    }

    // Count votes
    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("smartject_id", id);

    if (voteError) {
      console.error(`Error fetching votes for smartject ${id}:`, voteError);
    }

    const voteCount = {
      believe: 0,
      need: 0,
      provide: 0,
    };

    if (voteData) {
      voteData.forEach((vote: any) => {
        if (vote.vote_type === "believe") voteCount.believe++;
        if (vote.vote_type === "need") voteCount.need++;
        if (vote.vote_type === "provide") voteCount.provide++;
      });
    }

    const userVotes = {
      believe: false,
      need: false,
      provide: false,
    };

    if (userId && userVotesMap[data.id as string]) {
      for (const voteType of userVotesMap[data.id as string]) {
        if (
          voteType === "believe" ||
          voteType === "need" ||
          voteType === "provide"
        ) {
          userVotes[voteType as keyof typeof userVotes] = true;
        }
      }
    }

    // Count comments
    const { count, error: commentError } = await supabase
      .from("comments")
      .select("id", { count: "exact" })
      .eq("smartject_id", id);

    if (commentError) {
      console.error(
        `Error counting comments for smartject ${id}:`,
        commentError,
      );
    }

    // Extract industries
    const industries = Array.isArray(data.smartject_industries)
      ? data.smartject_industries
          .map((industry: any) => industry.industries?.name)
          .filter(Boolean)
      : [];

    // Extract business functions
    const businessFunctions = Array.isArray(data.smartject_business_functions)
      ? data.smartject_business_functions
          .map((func: any) => func.business_functions?.name)
          .filter(Boolean)
      : [];

    // Extract audience
    const audience = Array.isArray(data.smartject_audience)
      ? data.smartject_audience
          .map((aud: any) => aud.audience?.name)
          .filter(Boolean)
      : [];

    return {
      id: data.id as string,
      title: data.title as string,
      votes: voteCount,
      userVotes,
      comments: count || 0,
      createdAt: data.created_at as string,
      mission: (data.mission || "") as string,
      problematics: (data.problematics || "") as string,
      scope: (data.scope || "") as string,
      howItWorks: (data.how_it_works || "") as string,
      architecture: (data.architecture || "") as string,
      innovation: (data.innovation || "") as string,
      useCase: (data.use_case || "") as string,
      industries,
      businessFunctions,
      audience,
      researchPapers: (data.research_papers || []) as {
        title: string;
        url: string;
      }[],
      relevantLinks: [] as { title: string; url: string }[],
      image: data.image_url as string | undefined,
    };
  },

  // Get user's voted smartjects
  async getUserSmartjects(userId: string): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    // Get all votes by user with smartject_id and vote type
    const { data: userVotes, error: voteError } = await supabase
      .from("votes")
      .select("smartject_id, vote_type")
      .eq("user_id", userId);

    if (voteError || !userVotes) {
      console.error("Error fetching user votes:", voteError);
      return [];
    }

    // Build vote map by smartject_id
    const userVotesMap: {
      [smartjectId: string]: ("believe" | "need" | "provide")[];
    } = {};
    const smartjectIds = new Set<string>();

    for (const vote of userVotes) {
      const smartjectId = vote.smartject_id as string;
      const voteType = vote.vote_type as string;

      smartjectIds.add(smartjectId);
      if (!userVotesMap[smartjectId]) {
        userVotesMap[smartjectId] = [];
      }
      if (
        voteType === "believe" ||
        voteType === "need" ||
        voteType === "provide"
      ) {
        userVotesMap[smartjectId].push(
          voteType as "believe" | "need" | "provide",
        );
      }
    }

    // Fetch smartjects that were voted on
    const { data, error } = await supabase
      .from("smartjects")
      .select(
        `
      *,
      smartject_industries (
        industries (name)
      ),
      smartject_business_functions (
        business_functions (name)
      ),
      smartject_audience (
        audience (name)
      ),
      votes (vote_type),
      comments(count)
    `,
      )
      .in("id", Array.from(smartjectIds));

    if (error || !data) {
      console.error("Error fetching voted smartjects:", error);
      return [];
    }

    return this.formatSmartjects(data, userVotesMap, userId);
  },

  // Get available filter options
  async getAvailableFilters(): Promise<{
    industries: string[];
    audience: string[];
    businessFunctions: string[];
  }> {
    const supabase = getSupabaseBrowserClient();

    const [industriesRes, audienceRes, functionsRes] = await Promise.all([
      supabase.from("industries").select("name"),
      supabase.from("audience").select("name"),
      supabase.from("business_functions").select("name"),
    ]);

    const industries =
      industriesRes.error || !industriesRes.data
        ? []
        : industriesRes.data.map((i: any) => i.name);

    const audience =
      audienceRes.error || !audienceRes.data
        ? []
        : audienceRes.data.map((a: any) => a.name);

    const businessFunctions =
      functionsRes.error || !functionsRes.data
        ? []
        : functionsRes.data.map((f: any) => f.name);

    return {
      industries,
      audience,
      businessFunctions,
    };
  },
};
