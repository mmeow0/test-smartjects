import { getSupabaseBrowserClient } from "../supabase";
import type { SmartjectType } from "../types";
import { BatchProcessor } from "../utils/batch-processor";

// Cache for available filters to improve performance
const filtersCache: {
  data: {
    industries: { id: string; name: string }[];
    audience: { id: string; name: string }[];
    businessFunctions: { id: string; name: string }[];
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

// Оптимизированная загрузка смартджектов с фильтрацией в SQL
async getSmartjectsPaginated(
  userId?: string,
  page: number = 0,
  pageSize: number = 12,
  filters?: {
    query?: string;
    industries?: string[];         // industry_id[]
    audience?: string[];           // audience_id[]
    businessFunctions?: string[];  // function_id[]
    teams?: string[];              // text[]
    startDate?: string;
    endDate?: string;
  },
  sortBy: "recent" | "most-needed" | "most-provided" | "most-believed" = "recent",
): Promise<SmartjectType[]> {
  const supabase = getSupabaseBrowserClient();
  const userVotesMap = userId ? await this.getUserVotes(userId) : {};

  let query = supabase.from("smartjects").select(
    `
      *,
      smartject_business_functions!inner (
        function_id,
        business_functions (id, name)
      ),
      smartject_industries!inner (
        industry_id,
        industries (id, name)
      ),
      smartject_audience!inner (
        audience_id,
        audience (id, name)
      ),
      votes (vote_type),
      comments(count)
    `,
    { count: "exact" }
  );

  // 🔍 Поиск по тексту
  if (filters?.query?.trim()) {
    const searchTerm = `%${filters.query.toLowerCase()}%`;
    query = query.or(
      `title.ilike.${searchTerm},mission.ilike.${searchTerm},problematics.ilike.${searchTerm},scope.ilike.${searchTerm}`
    );
  }

  // 📅 Фильтры по дате
  if (filters?.startDate) query = query.gte("created_at", filters.startDate);
  if (filters?.endDate) query = query.lte("created_at", filters.endDate);

  // 🏭 Фильтры по индустриям
  if (filters?.industries?.length) {
    query = query.in("smartject_industries.industry_id", filters.industries);
  }

  // 👥 Фильтры по аудитории
  if (filters?.audience?.length) {
    query = query.in("smartject_audience.audience_id", filters.audience);
  }

  // ⚙️ Фильтры по бизнес-функциям
  if (filters?.businessFunctions?.length) {
    query = query.in("smartject_business_functions.function_id", filters.businessFunctions);
  }

  // 👨‍👩‍👧‍👦 Фильтр по командам (team text[])
  if (filters?.teams?.length) {
    query = query.contains("team", filters.teams);
    // или query = query.filter("team", "cs", `{team1,team2}`) в raw SQL
    // работает благодаря GIN индексу
  }

  // 📌 Сортировка
  if (sortBy === "recent") {
    query = query.order("created_at", { ascending: false });
  } else {
    // для сортировок по голосам тащим чуть больше данных
    const multiplier = 3;
    const batchSize = pageSize * multiplier;
    const from = page * batchSize;
    const to = from + batchSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);
  }

  // 📄 Пагинация (для recent)
  if (sortBy === "recent") {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching smartjects:", error);
    return [];
  }

  // 🗳️ Подсчёт голосов (для сортировок кроме recent)
  const withVoteCounts = data.map((item: any) => {
    const voteCount = { believe: 0, need: 0, provide: 0 };
    if (Array.isArray(item.votes)) {
      item.votes.forEach((vote: any) => {
        if (vote.vote_type && voteCount.hasOwnProperty(vote.vote_type)) {
          voteCount[vote.vote_type as keyof typeof voteCount]++;
        }
      });
    }
    return { ...item, voteCount };
  });

  // ⚡ Сортировка по голосам
  let sortedData = withVoteCounts;
  if (sortBy === "most-needed") {
    sortedData = withVoteCounts.sort((a, b) => b.voteCount.need - a.voteCount.need);
  } else if (sortBy === "most-provided") {
    sortedData = withVoteCounts.sort((a, b) => b.voteCount.provide - a.voteCount.provide);
  } else if (sortBy === "most-believed") {
    sortedData = withVoteCounts.sort((a, b) => b.voteCount.believe - a.voteCount.believe);
  }

  // ✂️ Обрезаем до pageSize после сортировки
  if (sortBy !== "recent") {
    sortedData = sortedData.slice(0, pageSize);
  }

  return this.formatSmartjects(sortedData, userVotesMap, userId);
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

// Get available filter options from related tables (uuid + name)
async getAvailableFilters(forceRefresh: boolean = false): Promise<{
  industries: { id: string; name: string }[];
  audience: { id: string; name: string }[];
  businessFunctions: { id: string; name: string }[];
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
    // ⚡ Вместо обхода всех smartjects сразу берём справочники
    const [industriesRes, audienceRes, functionsRes] = await Promise.all([
      supabase.from("industries").select("id, name").order("name"),
      supabase.from("audience").select("id, name").order("name"),
      supabase.from("business_functions").select("id, name").order("name"),
    ]);

    // ⚠️ Для команд у тебя нет отдельной таблицы — это text[] внутри smartjects
    // значит надо собрать все уникальные значения из smartjects.team
    const { data: teamData, error: teamError } = await supabase
      .from("smartjects")
      .select("team")
      .not("team", "is", null);

    if (teamError) {
      console.error("Error fetching teams:", teamError);
    }

    const teamsSet = new Set<string>();
    teamData?.forEach((row: any) => {
      if (Array.isArray(row.team)) {
        row.team.forEach((t: string) => teamsSet.add(t));
      }
    });

    const result = {
      industries:
        industriesRes.error || !industriesRes.data ? [] : industriesRes.data,
      audience: audienceRes.error || !audienceRes.data ? [] : audienceRes.data,
      businessFunctions:
        functionsRes.error || !functionsRes.data ? [] : functionsRes.data,
      teams: Array.from(teamsSet).sort(),
    };

    // Cache result
    filtersCache.data = result;
    filtersCache.timestamp = Date.now();

    return result;
  } catch (error) {
    console.error("Error in getAvailableFilters:", error);

    // Fallback — вернём пустые списки, чтобы UI не упал
    return {
      industries: [],
      audience: [],
      businessFunctions: [],
      teams: [],
    };
  }
},
};
