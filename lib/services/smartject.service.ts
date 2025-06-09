import { getSupabaseBrowserClient } from "../supabase";
import type { SmartjectType } from "../types";

export const smartjectService = {
  // Get all smartjects

  async getUserVotes(
    userId: string
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

    const result: { [smartjectId: string]: ("believe" | "need" | "provide")[] } = {};
    data.forEach((vote: any) => {
      if (!result[vote.smartject_id]) result[vote.smartject_id] = [];
      result[vote.smartject_id].push(vote.vote_type as "believe" | "need" | "provide");
    });

    return result;
  },

  async getSmartjects(userId?: string): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    const { data, error } = await supabase
      .from("smartjects")
      .select(
        `
      *,
      smartject_industries!inner (
        industries (name)
      ),
      smartject_business_functions!inner (
        business_functions (name)
      ),
      smartject_technologies!inner (
        technologies (name)
      ),
      votes (vote_type)
    `
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching smartjects:", error);
      return [];
    }

    return data.map((item) => {
      const voteCount = {
        believe: 0,
        need: 0,
        provide: 0,
      };

      item.votes?.forEach((vote: any) => {
        voteCount[vote.vote_type as keyof typeof voteCount]++;
      });

      const userVotes = {
        believe: false,
        need: false,
        provide: false,
      };

      if (userId && userVotesMap[item.id]) {
        for (const voteType of userVotesMap[item.id]) {
          userVotes[voteType as keyof typeof userVotes] = true;
        }
      }

      const industries = item.smartject_industries?.map(
        (i: any) => i.industries.name
      ) || [];
      const businessFunctions = item.smartject_business_functions?.map(
        (f: any) => f.business_functions.name
      ) || [];
      const technologies = item.smartject_technologies?.map(
        (t: any) => t.technologies.name
      ) || [];

      return {
        id: item.id as string,
        title: item.title as string,
        votes: voteCount,
        userVotes,
        comments: 0, // можно реализовать отдельно
        createdAt: item.created_at as string,
        mission: (item.mission || "") as string,
        problematics: (item.problematics || "") as string,
        scope: (item.scope || "") as string,
        audience: (item.audience || "") as string,
        howItWorks: (item.how_it_works || "") as string,
        architecture: (item.architecture || "") as string,
        innovation: (item.innovation || "") as string,
        useCase: (item.use_case || "") as string,
        industries,
        businessFunctions,
        technologies,
        relevantLinks: [] as { title: string; url: string; }[],
        researchPapers: [] as string[],
        image: item.image_url as string | undefined,
      };
    });
  },

  // Get a single smartject by ID
  async getSmartjectById(
    id: string,
    userId?: string
  ): Promise<SmartjectType | null> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {};

    const { data, error } = await supabase
      .from("smartjects")
      .select(
        `
        *,
        smartject_industries!inner (
          industries (name)
        ),
        smartject_business_functions!inner (
          business_functions (name)
        ),
        smartject_technologies!inner (
          technologies (name)
        )
      `
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

    if (userId && userVotesMap[data.id]) {
      for (const voteType of userVotesMap[data.id]) {
        userVotes[voteType as keyof typeof userVotes] = true;
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
        commentError
      );
    }
    // Extract industries
    const industries = data.smartject_industries?.map(
      (industry: any) => industry.industries.name
    ) || [];

    // Extract business functions
    const businessFunctions = data.smartject_business_functions?.map(
      (func: any) => func.business_functions.name
    ) || [];

    // Extract technologies
    const technologies = data.smartject_technologies?.map(
      (tech: any) => tech.technologies.name
    ) || [];

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
      audience: (data.audience || "") as string,
      howItWorks: (data.how_it_works || "") as string,
      architecture: (data.architecture || "") as string,
      innovation: (data.innovation || "") as string,
      useCase: (data.use_case || "") as string,
      industries,
      businessFunctions,
      technologies,
      researchPapers: (data.research_papers || []) as string[],
      relevantLinks: [] as { title: string; url: string; }[],
      image: data.image_url as string | undefined,
    };
  },

  async getUserSmartjects(userId: string): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    // Получаем все голоса пользователя с привязкой к smartject_id и типу голоса
    const { data: userVotes, error: voteError } = await supabase
      .from("votes")
      .select("smartject_id, vote_type")
      .eq("user_id", userId);

    if (voteError || !userVotes) {
      console.error("Error fetching user votes:", voteError);
      return [];
    }

    // Строим мапу голосов по smartject_id
    const userVotesMap: Record<string, string[]> = {};
    const smartjectIds = new Set<string>();

    for (const vote of userVotes) {
      smartjectIds.add(vote.smartject_id as string);
      if (!userVotesMap[vote.smartject_id]) {
        userVotesMap[vote.smartject_id] = [];
      }
      userVotesMap[vote.smartject_id].push(vote.vote_type as "believe" | "need" | "provide");
    }

    // Получаем smartjects, по которым были голоса
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
      smartject_technologies (
        technologies (name)
      ),
      votes (vote_type)
    `
      )
      .in("id", Array.from(smartjectIds));

    if (error || !data) {
      console.error("Error fetching voted smartjects:", error);
      return [];
    }

    return data.map((item) => {
      const voteCount = {
        believe: 0,
        need: 0,
        provide: 0,
      };

      item.votes?.forEach((vote: any) => {
        voteCount[vote.vote_type as keyof typeof voteCount]++;
      });

      const userVotes = {
        believe: false,
        need: false,
        provide: false,
      };

      if (userVotesMap[item.id]) {
        for (const voteType of userVotesMap[item.id]) {
          userVotes[voteType as keyof typeof userVotes] = true;
        }
      }

      const industries = item.smartject_industries?.map(
        (i: any) => i.industries.name
      ) || [];
      const businessFunctions = item.smartject_business_functions?.map(
        (f: any) => f.business_functions.name
      ) || [];
      const technologies = item.smartject_technologies?.map(
        (t: any) => t.technologies.name
      ) || [];

      return {
        id: item.id as string,
        title: item.title as string,
        votes: voteCount,
        userVotes,
        comments: 0,
        createdAt: item.created_at as string,
        mission: (item.mission || "") as string,
        problematics: (item.problematics || "") as string,
        scope: (item.scope || "") as string,
        audience: (item.audience || "") as string,
        howItWorks: (item.how_it_works || "") as string,
        architecture: (item.architecture || "") as string,
        innovation: (item.innovation || "") as string,
        useCase: (item.use_case || "") as string,
        industries,
        businessFunctions,
        technologies,
        relevantLinks: [] as { title: string; url: string; }[],
        researchPapers: [] as string[],
        image: item.image_url as string | undefined,
      };
    });
  },

  async getAvailableFilters(): Promise<{
    industries: string[];
    technologies: string[];
    businessFunctions: string[];
  }> {
    const supabase = getSupabaseBrowserClient();

    const [industriesRes, technologiesRes, functionsRes] = await Promise.all([
      supabase.from("industries").select("name"),
      supabase.from("technologies").select("name"),
      supabase.from("business_functions").select("name"),
    ]);

    const industries =
      industriesRes.error || !industriesRes.data
        ? []
        : industriesRes.data.map((i: any) => i.name);

    const technologies =
      technologiesRes.error || !technologiesRes.data
        ? []
        : technologiesRes.data.map((t: any) => t.name);

    const businessFunctions =
      functionsRes.error || !functionsRes.data
        ? []
        : functionsRes.data.map((f: any) => f.name);

    return {
      industries,
      technologies,
      businessFunctions,
    };
  },
};