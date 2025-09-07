import { getSupabaseBrowserClient } from "../supabase";
import type { SmartjectType } from "../types";
import { BatchProcessor } from "../utils/batch-processor";

// Cache for available filters to improve performance
const filtersCache: {
  data: {
    industries: string[];
    audience: string[];
    businessFunctions: string[];
    teams: string[];
  } | null;
  timestamp: number;
  ttl: number; // Time to live in milliseconds (30 minutes)
} = {
  data: null,
  timestamp: 0,
  ttl: 30 * 60 * 1000, // 30 minutes
};

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
      teams?: string[];
      startDate?: string;
      endDate?: string;
    },
    sortBy:
      | "recent"
      | "most-needed"
      | "most-provided"
      | "most-believed" = "recent",
  ): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    // Check if we have any related filters
    const hasRelatedFilters =
      (filters?.industries && filters.industries.length > 0) ||
      (filters?.audience && filters.audience.length > 0) ||
      (filters?.businessFunctions && filters.businessFunctions.length > 0) ||
      (filters?.teams && filters.teams.length > 0);

    if (hasRelatedFilters) {
      // Smart approach: Use incremental loading with client-side filtering
      // This avoids large IN clauses and provides better performance

      let results: any[] = [];
      let currentPage = 0;
      const maxAttempts = 50; // Increased limit to handle large datasets
      const batchSize = 100; // Larger batch size for better performance

      while (results.length < pageSize && currentPage < maxAttempts) {
        // Skip to the correct position for this page, then get the current batch
        const baseOffset = page * pageSize;
        const offset = baseOffset + currentPage * batchSize;

        // Start with all smartjects, apply basic filters first
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
            smartject_teams (
              teams (name)
            ),
            votes (vote_type),
            comments(count)
          `,
        );

        // Apply text search filter
        if (filters?.query && filters.query.trim()) {
          const searchTerm = `%${filters.query.toLowerCase()}%`;
          query = query.or(
            `title.ilike.${searchTerm},mission.ilike.${searchTerm},problematics.ilike.${searchTerm},scope.ilike.${searchTerm}`,
          );
        }

        // Apply date filters
        if (filters?.startDate && filters.startDate.trim() !== "") {
          query = query.gte("created_at", filters.startDate);
        }
        if (filters?.endDate && filters.endDate.trim() !== "") {
          query = query.lte("created_at", filters.endDate);
        }

        // For filtered queries, use a mixed approach to get better coverage
        // Instead of strict date ordering, use a combination of strategies
        if (currentPage % 2 === 0) {
          // Even pages: Order by created_at (newest first)
          query = query.order("created_at", { ascending: false });
        } else {
          // Odd pages: Order by id to get different distribution
          query = query.order("id", { ascending: false });
        }
        query = query.range(offset, offset + batchSize - 1);

        const { data, error } = await query;

        if (error || !data) {
          console.error("Error fetching smartjects:", error);
          break;
        }

        // If no more data, stop
        if (data.length === 0) {
          break;
        }

        // If we got less than expected, we might be near the end
        const isLastBatch = data.length < batchSize;

        // Apply filters using BatchProcessor for efficiency
        const filterConditions: Array<(item: any) => boolean> = [];

        // Add industry filter
        if (filters?.industries && filters.industries.length > 0) {
          filterConditions.push((item: any) => {
            if (!item.smartject_industries?.length) return false;
            const itemIndustries = item.smartject_industries
              .map((si: any) => si.industries?.name)
              .filter(Boolean);
            return filters.industries!.some((ind) =>
              itemIndustries.includes(ind),
            );
          });
        }

        // Add audience filter
        if (filters?.audience && filters.audience.length > 0) {
          filterConditions.push((item: any) => {
            if (!item.smartject_audience?.length) return false;
            const itemAudience = item.smartject_audience
              .map((sa: any) => sa.audience?.name)
              .filter(Boolean);
            return filters.audience!.some((aud) => itemAudience.includes(aud));
          });
        }

        // Add business functions filter
        if (
          filters?.businessFunctions &&
          filters.businessFunctions.length > 0
        ) {
          filterConditions.push((item: any) => {
            if (!item.smartject_business_functions?.length) return false;
            const itemFunctions = item.smartject_business_functions
              .map((sbf: any) => sbf.business_functions?.name)
              .filter(Boolean);
            return filters.businessFunctions!.some((func) =>
              itemFunctions.includes(func),
            );
          });
        }

        // Add teams filter
        if (filters?.teams && filters.teams.length > 0) {
          filterConditions.push((item: any) => {
            if (!item.smartject_teams?.length) return false;
            const itemTeams = item.smartject_teams
              .map((st: any) => st.teams?.name)
              .filter(Boolean);
            return filters.teams!.some((team) => itemTeams.includes(team));
          });
        }

        // Apply all filters efficiently
        const filteredBatch = BatchProcessor.multiFilter(
          data,
          filterConditions,
        );

        // Add filtered results to our collection
        results.push(...filteredBatch);

        // Move to next batch
        currentPage++;

        // If we have enough results, stop
        if (results.length >= pageSize) {
          break;
        }

        // If this was the last batch and we still don't have enough results,
        // we've reached the end of available data
        if (isLastBatch) {
          break;
        }
      }

      // Trim results to requested page size
      let filteredData = results.slice(0, pageSize);

      // Apply vote-based sorting if needed
      if (sortBy !== "recent") {
        const formattedData = filteredData.map((item: any) => {
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
        switch (sortBy) {
          case "most-needed":
            filteredData = formattedData.sort(
              (a, b) => b.voteCount.need - a.voteCount.need,
            );
            break;
          case "most-provided":
            filteredData = formattedData.sort(
              (a, b) => b.voteCount.provide - a.voteCount.provide,
            );
            break;
          case "most-believed":
            filteredData = formattedData.sort(
              (a, b) => b.voteCount.believe - a.voteCount.believe,
            );
            break;
        }
      }

      // Take only the needed page size
      const paginatedData = filteredData.slice(0, pageSize);

      return this.formatSmartjects(paginatedData, userVotesMap, userId);
    }

    // For queries without related filters, use the standard approach
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
      smartject_teams (
        teams (name)
      ),
      votes (vote_type),
      comments(count)
    `,
    );

    // Apply text search filter
    if (filters?.query && filters.query.trim()) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      query = query.or(
        `title.ilike.${searchTerm},mission.ilike.${searchTerm},problematics.ilike.${searchTerm},scope.ilike.${searchTerm}`,
      );
    }

    // Apply date filters
    if (filters?.startDate && filters.startDate.trim() !== "") {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate && filters.endDate.trim() !== "") {
      query = query.lte("created_at", filters.endDate);
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
      // For vote-based sorting, fetch a larger batch to ensure we have enough data after sorting
      const multiplier = Math.max(3, Math.ceil(50 / pageSize)); // Dynamic multiplier based on pageSize
      const batchSize = pageSize * multiplier;
      const startRange = page * batchSize;
      const endRange = startRange + batchSize - 1;

      const { data: allData, error: allError } = await query
        .order("created_at", { ascending: false })
        .range(startRange, endRange);

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

        // Take only the needed page size after sorting
        // Skip to the correct position for this specific page within the sorted results
        const startIndex = (page % multiplier) * pageSize;
        data = sortedData.slice(startIndex, startIndex + pageSize);
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
      smartject_teams (
        teams (name)
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
      const teams = Array.isArray(item.smartject_teams)
        ? item.smartject_teams.map((t: any) => t.teams?.name).filter(Boolean)
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
        teams,
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
        ),
        smartject_teams (
          teams (name)
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

    const teams = Array.isArray(data.smartject_teams)
      ? data.smartject_teams.map((aud: any) => aud.teams?.name).filter(Boolean)
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
      teams,
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
      smartject_teams (
        teams (name)
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

  // Get available filter options from smartjects table to ensure all values are included
  async getAvailableFilters(forceRefresh: boolean = false): Promise<{
    industries: string[];
    audience: string[];
    businessFunctions: string[];
    teams: string[];
  }> {
    // Check cache first
    const now = Date.now();
    if (
      !forceRefresh &&
      filtersCache.data &&
      now - filtersCache.timestamp < filtersCache.ttl
    ) {
      return filtersCache.data;
    }

    const supabase = getSupabaseBrowserClient();

    try {
      // Get all smartjects with their related data in batches to avoid limits
      const batchSize = 1000;
      let allIndustries = new Set<string>();
      let allAudience = new Set<string>();
      let allBusinessFunctions = new Set<string>();
      let allTeams = new Set<string>();

      let hasMore = true;
      let offset = 0;

      while (hasMore) {
        const { data: smartjects, error } = await supabase
          .from("smartjects")
          .select(
            `
            smartject_industries (
              industries (name)
            ),
            smartject_business_functions (
              business_functions (name)
            ),
            smartject_audience (
              audience (name)
            ),
            smartject_teams (
              teams (name)
            )
          `,
          )
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error("Error fetching smartjects for filters:", error);
          break;
        }

        if (!smartjects || smartjects.length === 0) {
          hasMore = false;
          break;
        }

        // Extract unique values
        smartjects.forEach((smartject: any) => {
          // Industries
          smartject.smartject_industries?.forEach((si: any) => {
            if (si.industries?.name) {
              allIndustries.add(si.industries.name);
            }
          });

          // Audience
          smartject.smartject_audience?.forEach((sa: any) => {
            if (sa.audience?.name) {
              allAudience.add(sa.audience.name);
            }
          });

          // Business Functions
          smartject.smartject_business_functions?.forEach((sf: any) => {
            if (sf.business_functions?.name) {
              allBusinessFunctions.add(sf.business_functions.name);
            }
          });

          // Teams
          smartject.smartject_teams?.forEach((st: any) => {
            if (st.teams?.name) {
              allTeams.add(st.teams.name);
            }
          });
        });

        // Check if we got a full batch (indicating there might be more)
        hasMore = smartjects.length === batchSize;
        offset += batchSize;

        // Safety limit to prevent infinite loops
        if (offset > 50000) {
          console.warn("Reached safety limit while fetching filter values");
          break;
        }
      }

      const result = {
        industries: Array.from(allIndustries).sort(),
        audience: Array.from(allAudience).sort(),
        businessFunctions: Array.from(allBusinessFunctions).sort(),
        teams: Array.from(allTeams).sort(),
      };

      // Cache the result
      filtersCache.data = result;
      filtersCache.timestamp = Date.now();

      return result;
    } catch (error) {
      console.error("Error in getAvailableFilters:", error);

      // Fallback to the original approach if the new method fails
      const [industriesRes, audienceRes, functionsRes, teamsRes] =
        await Promise.all([
          supabase.from("industries").select("name").limit(10000),
          supabase.from("audience").select("name").limit(10000),
          supabase.from("business_functions").select("name").limit(10000),
          supabase.from("teams").select("name").limit(10000),
        ]);

      const industries =
        industriesRes.error || !industriesRes.data
          ? []
          : industriesRes.data.map((i: any) => i.name).sort();

      const audience =
        audienceRes.error || !audienceRes.data
          ? []
          : audienceRes.data.map((a: any) => a.name).sort();

      const businessFunctions =
        functionsRes.error || !functionsRes.data
          ? []
          : functionsRes.data.map((f: any) => f.name).sort();

      const teams =
        teamsRes.error || !teamsRes.data
          ? []
          : teamsRes.data.map((t: any) => t.name).sort();

      const result = {
        industries,
        audience,
        businessFunctions,
        teams,
      };

      // Cache the fallback result too
      filtersCache.data = result;
      filtersCache.timestamp = Date.now();

      return result;
    }
  },
};
