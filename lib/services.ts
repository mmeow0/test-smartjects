import { getSupabaseBrowserClient } from "./supabase";
import type {
  SmartjectType,
  ProposalType,
  CommentType,
  VoteType,
  UserType,
  MilestoneType,
  DeliverableType,
  ContractListType,
} from "./types";

// Smartject services
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

    const result: Record<string, string[]> = {};
    data.forEach((vote: any) => {
      if (!result[vote.smartject_id]) result[vote.smartject_id] = [];
      result[vote.smartject_id].push(vote.vote_type);
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
        voteCount[vote.vote_type]++;
      });

      const userVotes = {
        believe: false,
        need: false,
        provide: false,
      };

      if (userId && userVotesMap[item.id]) {
        for (const voteType of userVotesMap[item.id]) {
          userVotes[voteType] = true;
        }
      }

      const industries = item.smartject_industries.map(
        (i: any) => i.industries.name
      );
      const businessFunctions = item.smartject_business_functions.map(
        (f: any) => f.business_functions.name
      );
      const technologies = item.smartject_technologies.map(
        (t: any) => t.technologies.name
      );

      return {
        id: item.id,
        title: item.title,
        votes: voteCount,
        userVotes,
        comments: 0, // можно реализовать отдельно
        createdAt: item.created_at,
        mission: item.mission || "",
        problematics: item.problematics || "",
        scope: item.scope || "",
        audience: item.audience || "",
        howItWorks: item.how_it_works || "",
        architecture: item.architecture || "",
        innovation: item.innovation || "",
        useCase: item.use_case || "",
        industries,
        businessFunctions,
        technologies,
        relevantLinks: [],
        image: item.image_url,
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
        userVotes[voteType] = true;
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
    const industries = data.smartject_industries.map(
      (industry: any) => industry.industries.name
    );

    // Extract business functions
    const businessFunctions = data.smartject_business_functions.map(
      (func: any) => func.business_functions.name
    );

    // Extract technologies
    const technologies = data.smartject_technologies.map(
      (tech: any) => tech.technologies.name
    );

    return {
      id: data.id,
      title: data.title,
      votes: voteCount,
      userVotes,
      comments: count || 0,
      createdAt: data.created_at,
      mission: data.mission || "",
      problematics: data.problematics || "",
      scope: data.scope || "",
      audience: data.audience || "",
      howItWorks: data.how_it_works || "",
      architecture: data.architecture || "",
      innovation: data.innovation || "",
      useCase: data.use_case || "",
      industries,
      businessFunctions,
      technologies,
      researchPapers: data.research_papers || [],
      image: data.image_url,
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
      smartjectIds.add(vote.smartject_id);
      if (!userVotesMap[vote.smartject_id]) {
        userVotesMap[vote.smartject_id] = [];
      }
      userVotesMap[vote.smartject_id].push(vote.vote_type);
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
        voteCount[vote.vote_type]++;
      });

      const userVotes = {
        believe: false,
        need: false,
        provide: false,
      };

      if (userVotesMap[item.id]) {
        for (const voteType of userVotesMap[item.id]) {
          userVotes[voteType] = true;
        }
      }

      const industries = item.smartject_industries.map(
        (i: any) => i.industries.name
      );
      const businessFunctions = item.smartject_business_functions.map(
        (f: any) => f.business_functions.name
      );
      const technologies = item.smartject_technologies.map(
        (t: any) => t.technologies.name
      );

      return {
        id: item.id,
        title: item.title,
        votes: voteCount,
        userVotes,
        comments: 0,
        createdAt: item.created_at,
        mission: item.mission || "",
        problematics: item.problematics || "",
        scope: item.scope || "",
        audience: item.audience || "",
        howItWorks: item.how_it_works || "",
        architecture: item.architecture || "",
        innovation: item.innovation || "",
        useCase: item.use_case || "",
        industries,
        businessFunctions,
        technologies,
        relevantLinks: [],
        image: item.image_url,
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

// Comment services
export const commentService = {
  // Get comments for a smartject
  async getCommentsBySmartjectId(smartjectId: string): Promise<CommentType[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users (
          name,
          avatar_url
        )
      `
      )
      .eq("smartject_id", smartjectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Error fetching comments for smartject ${smartjectId}:`,
        error
      );
      return [];
    }

    return data.map((comment: any) => ({
      id: comment.id,
      userId: comment.user_id,
      smartjectId: comment.smartject_id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        name: comment.users.name,
        avatar: comment.users.avatar_url,
      },
    }));
  },

  // Add a comment to a smartject
  async addComment(comment: Partial<CommentType>): Promise<CommentType | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id: comment.userId,
        smartject_id: comment.smartjectId,
        content: comment.content,
      })
      .select(
        `
        *,
        users (
          name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      smartjectId: data.smartject_id,
      content: data.content,
      createdAt: data.created_at,
      user: {
        name: data.users.name,
        avatar: data.users.avatar_url,
      },
    };
  },
};

// Vote services
export const voteService = {
  // Add or update a vote
  async vote(vote: Partial<VoteType>): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // Check if the user has already voted for this smartject with this vote type
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("user_id", vote.userId)
      .eq("smartject_id", vote.smartjectId)
      .eq("vote_type", vote.voteType)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing vote:", checkError);
      return false;
    }

    if (existingVote) {
      // User has already voted, so remove the vote
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("Error removing vote:", deleteError);
        return false;
      }

      return true;
    } else {
      // User hasn't voted yet, so add the vote
      const { error: insertError } = await supabase.from("votes").insert({
        user_id: vote.userId,
        smartject_id: vote.smartjectId,
        vote_type: vote.voteType,
      });

      if (insertError) {
        console.error("Error adding vote:", insertError);
        return false;
      }

      return true;
    }
  },

  // Get vote counts for a smartject
  async getVoteCounts(
    smartjectId: string
  ): Promise<{ believe: number; need: number; provide: number }> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("smartject_id", smartjectId);

    if (error) {
      console.error(
        `Error fetching votes for smartject ${smartjectId}:`,
        error
      );
      return { believe: 0, need: 0, provide: 0 };
    }

    const counts = {
      believe: 0,
      need: 0,
      provide: 0,
    };

    data.forEach((vote: any) => {
      if (vote.vote_type === "believe") counts.believe++;
      if (vote.vote_type === "need") counts.need++;
      if (vote.vote_type === "provide") counts.provide++;
    });

    return counts;
  },

  // Check if a user has voted for a smartject
  async hasUserVoted(
    userId: string,
    smartjectId: string,
    voteType: "believe" | "need" | "provide"
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("user_id", userId)
      .eq("smartject_id", smartjectId)
      .eq("vote_type", voteType)
      .maybeSingle();

    if (error) {
      console.error("Error checking if user has voted:", error);
      return false;
    }

    return !!data;
  },
};

// Proposal services
export const proposalService = {
  // Get proposals by user ID
  async getProposalsByUserId(userId: string): Promise<ProposalType[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        smartjects (
          title
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching proposals for user ${userId}:`, error);
      return [];
    }

    return data.map((proposal: any) => ({
      id: proposal.id,
      smartjectId: proposal.smartject_id,
      userId: proposal.user_id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description || "",
      budget: proposal.budget,
      timeline: proposal.timeline,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      requirements: proposal.requirements,
      expertise: proposal.expertise,
      approach: proposal.approach,
      team: proposal.team,
      additionalInfo: proposal.additional_info,
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
    }));
  },

  // Get proposals by smartject ID
  async getProposalsBySmartjectId(
    smartjectId: string
  ): Promise<ProposalType[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        users (
          name,
          avatar_url
        )
      `
      )
      .eq("smartject_id", smartjectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Error fetching proposals for smartject ${smartjectId}:`,
        error
      );
      return [];
    }

    return data.map((proposal: any) => ({
      id: proposal.id,
      smartjectId: proposal.smartject_id,
      userId: proposal.user_id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description || "",
      budget: proposal.budget,
      timeline: proposal.timeline,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      requirements: proposal.requirements,
      expertise: proposal.expertise,
      approach: proposal.approach,
      team: proposal.team,
      additionalInfo: proposal.additional_info,
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      user: {
        name: proposal.users.name,
        avatar: proposal.users.avatar_url,
      },
    }));
  },

  // Get a proposal by ID
  async getProposalById(id: string): Promise<ProposalType | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(`
        *,
        smartjects (
          title
        ),
        proposal_files!proposal_files_proposal_id_fkey (
          id,
          name,
          size,
          type,
          path
        ),
        proposal_comments (
          id,
          content,
          created_at,
          users (
            id,
            name,
            avatar_url
          )
        ),
        proposal_milestones (
          id,
          name,
          description,
          percentage,
          amount,
          proposal_deliverables (
            id,
            description,
            completed
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching proposal with ID ${id}:`, error);
      return null;
    }

    return {
      id: data.id,
      smartjectId: data.smartject_id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      description: data.description || "",
      budget: data.budget,
      timeline: data.timeline,
      scope: data.scope,
      deliverables: data.deliverables,
      requirements: data.requirements,
      expertise: data.expertise,
      approach: data.approach,
      team: data.team,
      additionalInfo: data.additional_info,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      milestones:
        data.proposal_milestones?.map((milestone: any) => ({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          percentage: milestone.percentage,
          amount: milestone.amount,
          deliverables:
            milestone.proposal_deliverables?.map((deliverable: any) => ({
              id: deliverable.id,
              description: deliverable.description,
              completed: deliverable.completed,
            })) ?? [],
        })) ?? [],

      // Новые поля:
      smartjectTitle: data.smartjects?.title ?? null,

      files:
        data.proposal_files?.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          path: file.path
        })) ?? [],

      comments:
        data.proposal_comments?.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          user: {
            id: comment.users?.id,
            name: comment.users?.name,
            avatar: comment.users?.avatar_url,
          },
        })) ?? [],
    };
  },

  // Create a new proposal
  async createProposal(
    proposal: Partial<ProposalType>
  ): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .insert({
        user_id: proposal.userId,
        smartject_id: proposal.smartjectId,
        type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        budget: proposal.budget,
        timeline: proposal.timeline,
        scope: proposal.scope,
        deliverables: proposal.deliverables,
        requirements: proposal.requirements,
        expertise: proposal.expertise,
        approach: proposal.approach,
        team: proposal.team,
        additional_info: proposal.additionalInfo,
        status: proposal.status || "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating proposal:", error);
      return null;
    }

    return data.id;
  },

  // Update a proposal
  async updateProposal(
    id: string,
    proposal: Partial<ProposalType>
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Начинаем транзакцию
      const { error: proposalError } = await supabase
        .from("proposals")
        .update({
          title: proposal.title || "",
          description: proposal.description || "",
          budget: proposal.budget || "",
          timeline: proposal.timeline || "",
          scope: proposal.scope || "",
          deliverables: proposal.deliverables || "",
          requirements: proposal.requirements || "",
          expertise: proposal.expertise || "",
          approach: proposal.approach || "",
          team: proposal.team || "",
          additional_info: proposal.additionalInfo || "",
          status: proposal.status || "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (proposalError) {
        console.error("Error updating proposal:", proposalError);
        return false;
      }

      // Если есть вехи, обновляем их
      if (proposal.milestones && proposal.milestones.length > 0) {
        // Получаем существующие вехи
        const { data: existingMilestones, error: fetchError } = await supabase
          .from("proposal_milestones")
          .select("id")
          .eq("proposal_id", id);

        if (fetchError) {
          console.error("Error fetching existing milestones:", fetchError);
          return false;
        }

        // Удаляем старые deliverables
        if (existingMilestones && existingMilestones.length > 0) {
          const { error: deliverablesError } = await supabase
            .from("proposal_deliverables")
            .delete()
            .in(
              "milestone_id",
              existingMilestones.map((m) => m.id)
            );

          if (deliverablesError) {
            console.error("Error deleting old deliverables:", deliverablesError);
            return false;
          }
        }

        // Удаляем старые milestones
        const { error: milestonesError } = await supabase
          .from("proposal_milestones")
          .delete()
          .eq("proposal_id", id);

        if (milestonesError) {
          console.error("Error deleting old milestones:", milestonesError);
          return false;
        }

        // Создаем новые milestones
        const { data: newMilestones, error: createMilestonesError } = await supabase
          .from("proposal_milestones")
          .insert(
            proposal.milestones.map((milestone) => ({
              proposal_id: id,
              name: milestone.name,
              description: milestone.description,
              percentage: milestone.percentage,
              amount: milestone.amount,
            }))
          )
          .select("id, name");

        if (createMilestonesError) {
          console.error("Error creating milestones:", createMilestonesError);
          return false;
        }

        // Создаем deliverables для каждого milestone
        for (let i = 0; i < proposal.milestones.length; i++) {
          const milestone = proposal.milestones[i];
          const newMilestoneId = newMilestones?.[i]?.id;

          if (newMilestoneId && milestone.deliverables && milestone.deliverables.length > 0) {
            const { error: deliverablesError } = await supabase
              .from("proposal_deliverables")
              .insert(
                milestone.deliverables.map((deliverable) => ({
                  milestone_id: newMilestoneId,
                  description: deliverable.description,
                  completed: deliverable.completed,
                }))
              );

            if (deliverablesError) {
              console.error("Error creating deliverables:", deliverablesError);
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateProposal:", error);
      return false;
    }
  },

  async addCommentToProposal(
    proposalId: string,
    userId: string,
    content: string
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("proposal_comments").insert({
      proposal_id: proposalId,
      user_id: userId,
      content: content,
    });

    if (error) {
      console.error("Error adding comment to proposal:", error);
      return false;
    }

    return true;
  },

  async createMilestones(
    proposalId: string,
    milestones: Partial<MilestoneType>[]
  ): Promise<{ id: string; name: string }[] | null> {
    const supabase = getSupabaseBrowserClient();

    const milestonesData = milestones.map((milestone) => ({
      proposal_id: proposalId,
      name: milestone.name,
      description: milestone.description,
      percentage: milestone.percentage,
      amount: milestone.amount,
    }));

    const { data, error } = await supabase
      .from("proposal_milestones")
      .insert(milestonesData)
      .select("id, name");

    if (error || !data) {
      console.error("Error creating milestones:", error);
      return null;
    }

    return data; // [{id, name}, ...]
  },

  // Create deliverables for a milestone
  async createDeliverables(
    milestoneId: string,
    deliverables: Partial<DeliverableType>[]
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // Prepare deliverable data for insertion
    const deliverablesData = deliverables.map((deliverable) => ({
      milestone_id: milestoneId,
      description: deliverable.description,
      completed: deliverable.completed || false,
    }));

    const { error } = await supabase
      .from("proposal_deliverables")
      .insert(deliverablesData);

    if (error) {
      console.error("Error creating deliverables:", error);
      return false;
    }

    return true;
  },

  // Upload file to Supabase storage
  async uploadFile(proposalId: string, file: File): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `proposals/${proposalId}/${fileName}`;

    const { error } = await supabase.storage
      .from("proposal-uploads")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from("proposal-uploads")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Save file reference to database
  async saveFileReference(
    proposalId: string,
    file: File,
    filePath: string
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("proposal_files").insert({
      proposal_id: proposalId,
      name: file.name,
      path: filePath,
      type: file.type,
      size: file.size,
      user_id: user?.id,
    });

    if (error) {
      console.error("Error saving file reference:", error);
      return false;
    }

    return true;
  },

  // Get all negotiations for a user (simplified version)
  async getUserNegotiations(userId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get all proposals created by the user that have messages
      const { data: userProposals, error: userProposalsError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, title, budget, timeline")
        .eq("user_id", userId);

      if (userProposalsError) {
        console.error("Error fetching user proposals:", userProposalsError);
        return [];
      }

      // Get all messages involving the user
      const { data: allMessages, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select("proposal_id, sender_id, created_at");

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return [];
      }

      const negotiations: any[] = [];

      // Process user's own proposals
      if (userProposals) {
        for (const proposal of userProposals) {
          const proposalMessages = allMessages?.filter(msg => msg.proposal_id === proposal.id) || [];
          
          if (proposalMessages.length === 0) continue;

          // Find other party (someone who messaged about this proposal)
          const otherMessage = proposalMessages.find(msg => msg.sender_id !== userId);
          const otherPartyId = otherMessage?.sender_id;

          let otherPartyName = "Unknown User";
          if (otherPartyId) {
            const { data: userData } = await supabase
              .from("users")
              .select("name, avatar_url")
              .eq("id", otherPartyId)
              .single();
            
            if (userData) {
              otherPartyName = userData.name || "Unknown User";
            }
          }

          // Get smartject title
          let smartjectTitle = proposal.title;
          const { data: smartjectData } = await supabase
            .from("smartjects")
            .select("title")
            .eq("id", proposal.smartject_id)
            .single();
          
          if (smartjectData) {
            smartjectTitle = smartjectData.title;
          }

          const lastActivity = proposalMessages.length > 0 
            ? proposalMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : new Date().toISOString();

          negotiations.push({
            id: `match-${proposal.smartject_id}-${proposal.id}`,
            proposalId: proposal.id,
            smartjectId: proposal.smartject_id,
            smartjectTitle,
            otherParty: {
              id: otherPartyId || "",
              name: otherPartyName,
              avatar: "",
            },
            budget: proposal.budget || "",
            timeline: proposal.timeline || "",
            messageCount: proposalMessages.length,
            lastActivity,
            isProposalOwner: true,
            status: 'active' as const
          });
        }
      }

      // Sort by last activity
      return negotiations.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    } catch (error) {
      console.error("Error in getUserNegotiations:", error);
      // Return empty array instead of mock data for real implementation
      return [];
    }
  },
};

// Contract services
export const contractService = {
  // Get contract data by match ID and proposal ID
  async getContractData(matchId: string, proposalId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔍 getContractData called with:", { matchId, proposalId });
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // First, try to get real contract data by match_id
      console.log("📋 Searching for existing contract with match_id:", matchId);
      const { data: realContractData, error: contractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `)
        .eq("match_id", matchId)
        .single();

      // If we found a real contract, use it
      if (realContractData && !contractError) {
        console.log("✅ Found existing contract:", realContractData.id);
        // Get smartject title
        const { data: proposalData } = await supabase
          .from("proposals")
          .select("smartject_id, title")
          .eq("id", proposalId)
          .single();

        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposalData?.smartject_id)
          .single();

        const smartjectTitle = smartjectData?.title || proposalData?.title || "Unknown Project";

        // Transform real contract data
        const contract = {
          id: realContractData.id,
          matchId: realContractData.match_id,
          proposalId: proposalId,
          smartjectTitle: smartjectTitle,
          provider: {
            id: realContractData.provider.id,
            name: realContractData.provider.name,
            email: realContractData.provider.email,
          },
          needer: {
            id: realContractData.needer.id,
            name: realContractData.needer.name,
            email: realContractData.needer.email,
          },
          terms: {
            budget: realContractData.budget,
            timeline: contractService.calculateTimeline(realContractData.start_date, realContractData.end_date),
            startDate: realContractData.start_date,
            endDate: realContractData.end_date,
            paymentSchedule: realContractData.contract_milestones?.length > 0 
              ? realContractData.contract_milestones.map((m: any) => ({
                  milestone: m.name,
                  percentage: m.percentage,
                  amount: m.amount,
                }))
              : [
                  {
                    milestone: "Project Start",
                    percentage: 50,
                    amount: "50% of total budget",
                  },
                  {
                    milestone: "Project Completion",
                    percentage: 50,
                    amount: "50% of total budget",
                  },
                ],
            scope: realContractData.scope,
            deliverables: realContractData.contract_deliverables?.map((d: any) => d.description) || [],
          },
          status: {
            providerSigned: realContractData.provider_signed || false,
            neederSigned: realContractData.needer_signed || false,
            contractActive: realContractData.status === "active",
          },
          exclusivity: {
            clause: "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
            duration: `Contract period + 30 days (until ${new Date(realContractData.exclusivity_ends).toLocaleDateString()})`,
          },
        };

        return contract;
      }

      console.log("❌ No existing contract found, creating new one");
      console.log("Contract error:", contractError);
      
      // No real contract exists, create one from the proposal data
      // First, get the match to determine provider and needer
      const { data: matchInfo, error: matchInfoError } = await supabase
        .from("matches")
        .select("provider_id, needer_id, smartject_id")
        .eq("id", matchId)
        .single();

      if (matchInfoError || !matchInfo) {
        console.error("Error fetching match info:", matchInfoError);
        return null;
      }

      // Get the proposal data
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposalData) {
        console.error("Error fetching proposal:", proposalError);
        return null;
      }

      // Create contract terms from proposal data
      const contractTerms = {
        budget: proposalData.budget || "$0",
        timeline: proposalData.timeline || "3 months",
        scope: proposalData.scope || proposalData.description || "",
        deliverables: (proposalData.deliverables as string)?.split('\n').filter(d => d.trim()) || ["Project completion"],
        milestones: [
          {
            name: "Project Start",
            description: "Initial setup and project kickoff",
            percentage: 50,
            amount: "50% of total budget",
          },
          {
            name: "Project Completion",
            description: "Final delivery and project completion",
            percentage: 50,
            amount: "50% of total budget",
          },
        ]
      };

      // Create the real contract
      console.log("🏗️ Creating new contract with terms:", contractTerms);
      const newContractId = await contractService.createContractFromNegotiation(
        matchId,
        proposalId,
        matchInfo.provider_id,
        matchInfo.needer_id,
        contractTerms
      );

      if (!newContractId) {
        console.error("❌ Failed to create contract");
        return null;
      }
      
      console.log("✅ Created new contract with ID:", newContractId);

      // Now fetch the newly created contract data
      const { data: newContractData, error: newContractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `)
        .eq("id", newContractId)
        .single();

      if (newContractError || !newContractData) {
        console.error("Error fetching newly created contract:", newContractError);
        return null;
      }

      // Get smartject title
      const { data: smartjectData } = await supabase
        .from("smartjects")
        .select("title")
        .eq("id", matchInfo.smartject_id)
        .single();

      const smartjectTitle = smartjectData?.title || proposalData.title || "Unknown Project";

      // Transform the newly created contract data
      const contract = {
        id: newContractData.id,
        matchId: newContractData.match_id,
        proposalId: proposalId,
        smartjectTitle: smartjectTitle,
        provider: {
          id: newContractData.provider.id,
          name: newContractData.provider.name,
          email: newContractData.provider.email,
        },
        needer: {
          id: newContractData.needer.id,
          name: newContractData.needer.name,
          email: newContractData.needer.email,
        },
        terms: {
          budget: newContractData.budget,
          timeline: contractService.calculateTimeline(newContractData.start_date, newContractData.end_date),
          startDate: newContractData.start_date,
          endDate: newContractData.end_date,
          paymentSchedule: newContractData.contract_milestones?.length > 0 
            ? newContractData.contract_milestones.map((m: any) => ({
                milestone: m.name,
                percentage: m.percentage,
                amount: m.amount,
              }))
            : contractTerms.milestones.map(m => ({
                milestone: m.name,
                percentage: m.percentage,
                amount: m.amount,
              })),
          scope: newContractData.scope,
          deliverables: newContractData.contract_deliverables?.map((d: any) => d.description) || contractTerms.deliverables,
        },
        status: {
          providerSigned: newContractData.provider_signed || false,
          neederSigned: newContractData.needer_signed || false,
          contractActive: newContractData.status === "active",
        },
        exclusivity: {
          clause: "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
          duration: `Contract period + 30 days (until ${new Date(newContractData.exclusivity_ends).toLocaleDateString()})`,
        },
      };

      console.log("🎉 Returning contract data:", contract);
      return contract;
    } catch (error) {
      console.error("❌ Error in getContractData:", error);
      return null;
    }
  },

  // Helper function to calculate timeline
  calculateTimeline(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths >= 1) {
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
      } else {
        return `${diffMonths}.${Math.floor((remainingDays / 30) * 10)} months`;
      }
    } else if (diffWeeks >= 1) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  },

  // Sign contract by updating the appropriate signing status in the database
  async signContract(contractId: string, userId: string, isProvider: boolean): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Determine which column to update based on user role
      const updateColumn = isProvider ? 'provider_signed' : 'needer_signed';
      const updateData = { [updateColumn]: true };

      // Update the contract signing status
      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contractId)
        .select()
        .single();

      if (error) {
        console.error("Error signing contract:", error);
        return false;
      }

      if (!data) {
        console.error("Contract not found:", contractId);
        return false;
      }

      console.log(`Contract ${contractId} signed by user ${userId} as ${isProvider ? 'provider' : 'needer'}`);
      return true;
    } catch (error) {
      console.error("Error in signContract:", error);
      return false;
    }
  },


async isContractFullySigned(contractId: string): Promise<{
  isSigned: boolean;
  matchId?: string;
  proposalId?: string;
}> {
  const supabase = getSupabaseBrowserClient();

  try {
    // Получить данные контракта, включая matchId и proposalId
    const { data: contractData, error } = await supabase
      .from("contracts")
      .select("provider_signed, needer_signed, match_id, proposal_id")
      .eq("id", contractId)
      .single();

    if (error || !contractData) {
      console.error("Error checking contract signing status:", error);
      return { isSigned: false };
    }

    const isSigned = contractData.provider_signed && contractData.needer_signed;

    return {
      isSigned,
      matchId: contractData.match_id,
      proposalId: contractData.proposal_id,
    };
  } catch (error) {
    console.error("Error in isContractFullySigned:", error);
    return { isSigned: false };
  }
},

  getContractNavigationUrl(matchId: string, proposalId: string, contractId: string, isSigned: boolean): string {
    if (isSigned) {
      // Contract is fully signed - go to final contract page
      return `/contracts/${contractId}`;
    } else {
      // Contract is still in signing phase - go to contract signing page
      return `/matches/${matchId}/contract/${proposalId}`;
    }
  },

  // Get contract by ID with full details
  async getContractById(contractId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // Get contract data with related information
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email),
          contract_deliverables(id, description),
          contract_milestones(id, name, description, percentage, amount, status, completed_date)
        `)
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.error("Error fetching contract:", contractError);
        return null;
      }

      // Check if user has access to this contract
      if (contractData.provider_id !== currentUser.id && contractData.needer_id !== currentUser.id) {
        console.error("User does not have access to this contract");
        return null;
      }

      // Get smartject title from match
      const { data: matchData } = await supabase
        .from("matches")
        .select("smartject_id")
        .eq("id", contractData.match_id)
        .single();

      let smartjectTitle = "Unknown Project";
      if (matchData) {
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", matchData.smartject_id)
          .single();
        
        if (smartjectData) {
          smartjectTitle = smartjectData.title;
        }
      }

      // Get milestone comments
      const { data: milestoneComments } = await supabase
        .from("contract_milestone_comments")
        .select(`
          *,
          user:users(name)
        `)
        .in("milestone_id", contractData.contract_milestones?.map((m: any) => m.id) || []);

      // Transform milestones data
      const paymentSchedule = contractData.contract_milestones?.map((milestone: any) => ({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        percentage: milestone.percentage,
        amount: milestone.amount,
        status: milestone.status,
        completedDate: milestone.completed_date,
        deliverables: [`${milestone.name} deliverables`], // Mock deliverables for now
        comments: milestoneComments?.filter(c => c.milestone_id === milestone.id).map(c => ({
          user: c.user?.name || "Unknown User",
          date: c.created_at,
          content: c.content
        })) || []
      })) || [
        {
          id: "milestone-1",
          name: "Project Kickoff",
          description: "Initial setup, requirements gathering, and project planning",
          percentage: 30,
          amount: "30% of total budget",
          status: "pending",
          deliverables: ["Project plan", "Requirements document"],
          comments: []
        },
        {
          id: "milestone-2", 
          name: "Midpoint Delivery",
          description: "Core development and implementation",
          percentage: 40,
          amount: "40% of total budget", 
          status: "pending",
          deliverables: ["Core functionality", "Testing results"],
          comments: []
        },
        {
          id: "milestone-3",
          name: "Final Delivery", 
          description: "Complete system with documentation and training",
          percentage: 30,
          amount: "30% of total budget",
          status: "pending", 
          deliverables: ["Complete system", "Documentation", "Training materials"],
          comments: []
        }
      ];

      // Determine user role
      const isProvider = currentUser.id === contractData.provider_id;
      const role = isProvider ? "provider" : "needer";

      // Calculate status
      let status = contractData.status;
      if (contractData.provider_signed && contractData.needer_signed && status === "pending_start") {
        status = "active";
      }

      // Transform contract data
      const contract = {
        id: contractData.id,
        title: contractData.title || smartjectTitle,
        smartjectId: contractData.match_id,
        smartjectTitle: smartjectTitle,
        status: status,
        role: role,
        createdAt: contractData.created_at,
        startDate: contractData.start_date,
        endDate: contractData.end_date,
        exclusivityEnds: contractData.exclusivity_ends,
        budget: contractData.budget,
        provider: {
          id: contractData.provider.id,
          name: contractData.provider.name,
          email: contractData.provider.email,
          avatar: "",
        },
        needer: {
          id: contractData.needer.id,
          name: contractData.needer.name,
          email: contractData.needer.email,
          avatar: "",
        },
        scope: contractData.scope,
        deliverables: contractData.contract_deliverables?.map((d: any) => d.description) || [
          "Project implementation",
          "Documentation and training",
          "Testing and quality assurance"
        ],
        paymentSchedule: paymentSchedule,
        documents: await (async () => {
          const { data: contractDocuments } = await supabase
            .from("contract_documents")
            .select("*")
            .eq("contract_id", contractData.id);
          
          return contractDocuments?.map(doc => ({
            name: doc.name,
            type: doc.type || "pdf",
            size: doc.size || "Unknown",
            uploadedAt: doc.created_at,
          })) || [
            {
              name: "Contract Agreement.pdf",
              type: "pdf", 
              size: "1.2 MB",
              uploadedAt: contractData.created_at,
            }
          ];
        })(),
        activity: await (async () => {
          const { data: contractActivity } = await supabase
            .from("contract_activities")
            .select(`
              *,
              user:users(name)
            `)
            .eq("contract_id", contractData.id)
            .order("created_at", { ascending: false });
          
          return contractActivity?.map(activity => ({
            id: activity.id,
            type: activity.type,
            date: activity.created_at,
            description: activity.description,
            user: activity.user?.name || "System",
          })) || [
            {
              id: "activity-1",
              type: "contract_created",
              date: contractData.created_at,
              description: "Contract created",
              user: "System",
            }
          ];
        })(),
        messages: await (async () => {
          const { data: contractMessages } = await supabase
            .from("contract_messages")
            .select(`
              *,
              user:users(name)
            `)
            .eq("contract_id", contractData.id)
            .order("created_at", { ascending: true });
          
          return contractMessages?.map(message => ({
            id: message.id,
            sender: message.user?.name || "Unknown User",
            content: message.content,
            timestamp: message.created_at,
          })) || [
            {
              id: "msg-1",
              sender: isProvider ? contractData.needer.name : contractData.provider.name,
              content: "Looking forward to working together on this project!",
              timestamp: contractData.created_at,
            }
          ];
        })(),
        documentVersions: await (async () => {
          const { data: docVersions } = await supabase
            .from("document_versions")
            .select(`
              *,
              author:users(name),
              document:contract_documents!inner(contract_id)
            `)
            .eq("document.contract_id", contractData.id)
            .order("version_number", { ascending: false });
          
          return docVersions?.map(version => ({
            id: version.id,
            versionNumber: version.version_number,
            date: version.created_at,
            author: version.author?.name || "System",
            changes: Array.isArray(version.changes) ? version.changes : ["Version created"],
          })) || [
            {
              id: "version-1",
              versionNumber: 1,
              date: contractData.created_at,
              author: "System",
              changes: ["Initial contract creation"],
            }
          ];
        })(),
      };

      return contract;
    } catch (error) {
      console.error("Error in getContractById:", error);
      return null;
    }
  },

  // Create contract from negotiation
  async createContractFromNegotiation(
    matchId: string,
    proposalId: string,
    providerId: string,
    neederId: string,
    terms: {
      budget: string;
      timeline: string;
      scope: string;
      deliverables: string[];
      milestones: Array<{
        name: string;
        description: string;
        percentage: number;
        amount: string;
      }>;
    }
  ): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🏗️ createContractFromNegotiation called with:", { matchId, proposalId, providerId, neederId, terms });
      // Verify match exists and get provider/needer IDs from it
      console.log("📋 Fetching match data for matchId:", matchId);
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("provider_id, needer_id")
        .eq("id", matchId)
        .single();

      if (matchError || !matchData) {
        console.error("❌ Error fetching match data:", matchError);
        return null;
      }
      
      console.log("✅ Match data found:", matchData);

      // Use provider and needer IDs from the match table
      const finalProviderId = matchData.provider_id || providerId;
      const finalNeederId = matchData.needer_id || neederId;
      // Calculate dates
      const startDate = new Date();
      const timelineMatch = terms.timeline.match(/(\d+(\.\d+)?)/);
      const timelineMonths = timelineMatch ? parseFloat(timelineMatch[1]) : 3;
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Math.floor(timelineMonths));
      const remainingDays = Math.round((timelineMonths % 1) * 30);
      endDate.setDate(endDate.getDate() + remainingDays);

      const exclusivityEndDate = new Date(endDate);
      exclusivityEndDate.setDate(exclusivityEndDate.getDate() + 30);

      // Create contract
      console.log("💾 Creating contract with data:", {
        match_id: matchId,
        provider_id: finalProviderId,
        needer_id: finalNeederId,
        proposal_id: proposalId,
        title: `Contract for Proposal ${proposalId}`,
        budget: terms.budget,
        scope: terms.scope,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        exclusivity_ends: exclusivityEndDate.toISOString(),
        status: 'pending_start'
      });
      
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert({
          match_id: matchId,
          provider_id: finalProviderId,
          needer_id: finalNeederId,
          proposal_id: proposalId,
          title: `Contract for Proposal ${proposalId}`,
          budget: terms.budget,
          scope: terms.scope,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          exclusivity_ends: exclusivityEndDate.toISOString(),
          status: 'pending_start'
        })
        .select()
        .single();

      if (contractError || !contractData) {
        console.error("❌ Error creating contract:", contractError);
        return null;
      }
      
      console.log("✅ Contract created successfully:", contractData.id);

      const contractId = contractData.id;

      // Create contract deliverables
      if (terms.deliverables.length > 0) {
        console.log("📦 Creating deliverables:", terms.deliverables);
        const deliverableInserts = terms.deliverables.map(deliverable => ({
          contract_id: contractId,
          description: deliverable
        }));

        const { error: deliverablesError } = await supabase
          .from("contract_deliverables")
          .insert(deliverableInserts);

        if (deliverablesError) {
          console.error("❌ Error creating deliverables:", deliverablesError);
        } else {
          console.log("✅ Deliverables created successfully");
        }
      }

      // Create contract milestones
      if (terms.milestones.length > 0) {
        console.log("🎯 Creating milestones:", terms.milestones);
        const milestoneInserts = terms.milestones.map((milestone, index) => {
          // Calculate due date for each milestone
          const totalMilestones = terms.milestones.length;
          const milestoneInterval = (endDate.getTime() - startDate.getTime()) / totalMilestones;
          const dueDate = new Date(startDate.getTime() + (milestoneInterval * (index + 1)));
          
          return {
            contract_id: contractId,
            name: milestone.name,
            description: milestone.description,
            percentage: milestone.percentage,
            amount: milestone.amount,
            due_date: dueDate.toISOString(),
            status: 'pending'
          };
        });

        console.log("💾 Milestone inserts:", milestoneInserts);
        const { error: milestonesError } = await supabase
          .from("contract_milestones")
          .insert(milestoneInserts);

        if (milestonesError) {
          console.error("❌ Error creating milestones:", milestonesError);
        } else {
          console.log("✅ Milestones created successfully");
        }
      }

      console.log("🎉 Contract creation completed, returning ID:", contractId);
      return contractId as string;
    } catch (error) {
      console.error("❌ Error in createContractFromNegotiation:", error);
      return null;
    }
  },

  // Get user's contracts
  async getUserContracts(userId: string): Promise<{
    activeContracts: ContractListType[];
    completedContracts: ContractListType[];
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get contracts where user is either provider or needer
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email)
        `)
        .or(`provider_id.eq.${userId},needer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error("Error fetching contracts:", contractsError);
        return { activeContracts: [], completedContracts: [] };
      }

      const contracts = contractsData || [];

      // Transform contracts to match the expected format
      const transformedContracts = contracts.map(contract => {
        const isProvider = contract.provider_id === userId;
        const otherParty = isProvider ? contract.needer?.name : contract.provider?.name;
        const role = isProvider ? "provider" : "needer";

        return {
          id: contract.id,
          smartjectId: contract.match_id,
          smartjectTitle: contract.title || "Unknown Project",
          otherParty: otherParty || "Unknown Party",
          role: role,
          startDate: contract.start_date,
          endDate: contract.end_date,
          status: contract.status,
          budget: contract.budget,
          nextMilestone: contract.status === "active" ? "In Progress" : contract.status === "pending_start" ? "Project Kickoff" : "N/A",
          nextMilestoneDate: contract.status === "pending_start" ? contract.start_date : contract.end_date,
          finalMilestone: contract.status === "completed" ? "Final Delivery" : undefined,
          completionDate: contract.status === "completed" ? contract.end_date : undefined,
          exclusivityEnds: contract.exclusivity_ends,
        };
      });

      // Separate active and completed contracts
      const activeContracts = transformedContracts.filter(contract => 
        contract.status === "active" || contract.status === "pending_start"
      );
      
      const completedContracts = transformedContracts.filter(contract => 
        contract.status === "completed"
      );

      return {
        activeContracts,
        completedContracts
      };
    } catch (error) {
      console.error("Error in getUserContracts:", error);
      return { activeContracts: [], completedContracts: [] };
    }
  },
};

// User services
export const userService = {
  // Get a user by ID
  async getUserById(id: string): Promise<UserType | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      accountType: data.account_type,
      avatar: data.avatar_url,
    };
  },

  // Update a user
  async updateUser(id: string, user: Partial<UserType>): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("users")
      .update({
        name: user.name,
        account_type: user.accountType,
        avatar_url: user.avatar,
      })
      .eq("id", id);

    if (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      return false;
    }

    return true;
  },
};

export const negotiationService = {
  // Get negotiation data for the negotiate page
  async getNegotiationData(matchId: string, proposalId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get the proposal with related data
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select(`
          *,
          smartjects (
            id,
            title
          ),
          users (
            id,
            name,
            avatar_url
          ),
          proposal_milestones (
            id,
            name,
            description,
            percentage,
            amount,
            proposal_deliverables (
              id,
              description,
              completed
            )
          )
        `)
        .eq("id", proposalId)
        .single();
        
      if (proposalError) {
        console.error("Error fetching proposal data:", proposalError);
        return null;
      }

      // Get smartject owner (needer) info
      const { data: neederData, error: neederError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", proposalData.user_id)
        .single();

      if (neederError) {
        console.error("Error fetching needer data:", neederError);
      }

      // Get negotiation messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select(`
          id,
          sender_id,
          content,
          is_counter_offer,
          counter_offer_budget,
          counter_offer_timeline,
          created_at,
          users (
            name
          )
        `)
        .eq("proposal_id", proposalId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
      }

      // Transform the data to match the expected format
      const negotiationData = {
        matchId: matchId as string,
        proposalId: proposalId as string,
        smartjectTitle: (proposalData.smartjects?.title as string) || "",
        provider: {
          id: (proposalData.users?.id as string) || "",
          name: (proposalData.users?.name as string) || "",
          avatar: (proposalData.users?.avatar_url as string) || "",
          rating: 4.8 as number, // Default rating - you may want to add this to users table
        },
        needer: {
          id: (neederData?.id as string) || "",
          name: (neederData?.name as string) || "",
          avatar: (neederData?.avatar_url as string) || "",
          rating: 4.6 as number, // Default rating - you may want to add this to users table
        },
        currentProposal: {
          budget: (proposalData.budget as string) || "",
          timeline: (proposalData.timeline as string) || "",
          scope: (proposalData.scope as string) || "",
          deliverables: proposalData.deliverables ? 
            (proposalData.deliverables as string).split('\n').filter((d: string) => d.trim()) : [] as string[],
        },
        milestones: proposalData.proposal_milestones?.map((milestone: any) => ({
          id: (milestone.id as string) || "",
          name: (milestone.name as string) || "",
          description: (milestone.description as string) || "",
          percentage: (milestone.percentage as number) || 0,
          amount: (milestone.amount as string) || "",
          deliverables: milestone.proposal_deliverables?.map((deliverable: any) => ({
            id: (deliverable.id as string) || "",
            description: (deliverable.description as string) || "",
            completed: (deliverable.completed as boolean) || false,
          })) || [],
        })) || [],
        messages: messagesData?.map((message: any) => ({
          id: (message.id as string) || "",
          sender: (message.sender_id === proposalData.user_id ? "provider" : "needer") as "provider" | "needer",
          senderName: (message.users?.name as string) || "",
          content: (message.content as string) || "",
          timestamp: (message.created_at as string) || "",
          isCounterOffer: (message.is_counter_offer as boolean) || false,
          counterOffer: message.is_counter_offer ? {
            budget: (message.counter_offer_budget as string) || "",
            timeline: (message.counter_offer_timeline as string) || "",
          } : undefined,
        })) || [],
      };

      return negotiationData;
    } catch (error) {
      console.error("Error in getNegotiationData:", error);
      return null;
    }
  },

  // Add a negotiation message
  async addNegotiationMessage(
    proposalId: string,
    senderId: string,
    content: string,
    isCounterOffer: boolean = false,
    counterOfferBudget?: string,
    counterOfferTimeline?: string
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if(!user){
       console.error("Error user:", userError);
      return false;
    }
    const { error } = await supabase
      .from("negotiation_messages")
      .insert({
        proposal_id: proposalId,
        sender_id: user.id,
        content,
        is_counter_offer: isCounterOffer,
        counter_offer_budget: counterOfferBudget,
        counter_offer_timeline: counterOfferTimeline,
      });

    if (error) {
      console.error("Error adding negotiation message:", error);
      return false;
    }

    return true;
  },

  async updateNegotiationStatus(matchId: string, status: 'new' | 'negotiating' | 'terms_agreed' | 'contract_created' | 'cancelled'): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("matches")
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq("id", matchId);

      if (error) {
        console.error("Error updating negotiation status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateNegotiationStatus:", error);
      return false;
    }
  },
};

export const fileService = {
  async deleteFile(fileId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Получаем информацию о файле
      const { data: fileData, error: fetchError } = await supabase
        .from("proposal_files")
        .select("path")
        .eq("id", fileId)
        .single();

      if (fetchError) {
        console.error("Error fetching file data:", fetchError);
        return false;
      }

      // Удаляем файл из хранилища
      if (fileData?.path) {
        const { error: storageError } = await supabase.storage
          .from("proposal-files")
          .remove([fileData.path]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          return false;
        }
      }

      // Удаляем запись о файле из базы данных
      const { error: deleteError } = await supabase
        .from("proposal_files")
        .delete()
        .eq("id", fileId);

      if (deleteError) {
        console.error("Error deleting file record:", deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return false;
    }
  },

async downloadFile(path: string, filename: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();

  try {
   const { data, error } = await supabase
    .storage
    .from("proposal-uploads")
    .createSignedUrl(path, 60); // ссылка активна 60 секунд

  if (error || !data?.signedUrl) {
    console.error("Ошибка при получении signed URL:", error);
    return null;
  }

  return data.signedUrl;
  } catch (error) {
    console.error("Ошибка при скачивании файла:", error);
    return null
  }
}

};
