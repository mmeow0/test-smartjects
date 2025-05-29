import { getSupabaseBrowserClient } from "./supabase";
import type {
  SmartjectType,
  ProposalType,
  CommentType,
  VoteType,
  UserType,
  MilestoneType,
  DeliverableType,
} from "./types";

// Smartject services
export const smartjectService = {
  // Get all smartjects

  async getUserVotes(userId: string): Promise<{ [smartjectId: string]: ("believe" | "need" | "provide")[] }> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("votes")
    .select("smartject_id, vote_type")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user votes:", error)
    return {}
  }

  const result: Record<string, string[]> = {}
  data.forEach((vote: any) => {
    if (!result[vote.smartject_id]) result[vote.smartject_id] = []
    result[vote.smartject_id].push(vote.vote_type)
  })

  return result
},

  async getSmartjects(userId?: string): Promise<SmartjectType[]> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {}

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
    }

    item.votes?.forEach((vote: any) => {
      voteCount[vote.vote_type]++
    })

    const userVotes = {
      believe: false,
      need: false,
      provide: false,
    }

    if (userId && userVotesMap[item.id]) {
      for (const voteType of userVotesMap[item.id]) {
        userVotes[voteType] = true
      }
    }

    const industries = item.smartject_industries.map((i: any) => i.industries.name)
    const businessFunctions = item.smartject_business_functions.map((f: any) => f.business_functions.name)
    const technologies = item.smartject_technologies.map((t: any) => t.technologies.name)

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
    }
  })
},

  // Get a single smartject by ID
  async getSmartjectById(id: string, userId?: string): Promise<SmartjectType | null> {
    const supabase = getSupabaseBrowserClient();

    const userVotesMap = userId ? await this.getUserVotes(userId) : {}

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
    }

    if (userId && userVotesMap[data.id]) {
      for (const voteType of userVotesMap[data.id]) {
        userVotes[voteType] = true
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

    const industries = item.smartject_industries.map((i: any) => i.industries.name);
    const businessFunctions = item.smartject_business_functions.map((f: any) => f.business_functions.name);
    const technologies = item.smartject_technologies.map((t: any) => t.technologies.name);

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
  .select(
    `
    *,
    smartjects (
      title
    ),
    proposal_files (
      id,
      name,
      size,
      type
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
    )
  `
  )
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

    // Новые поля:
    smartjectTitle: data.smartjects?.title ?? null,

    files: data.proposal_files?.map((file: any) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
    })) ?? [],

    comments: data.proposal_comments?.map((comment: any) => ({
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

    const { error } = await supabase
      .from("proposals")
      .update({
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
        status: proposal.status,
      })
      .eq("id", id);

    if (error) {
      console.error(`Error updating proposal with ID ${id}:`, error);
      return false;
    }

    return true;
  },

  async addCommentToProposal(proposalId: string, userId: string, content: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("proposal_comments")
    .insert({
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

  // Create milestones for a proposal
  async createMilestones(
    proposalId: string,
    milestones: Partial<MilestoneType>[]
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // Prepare milestone data for insertion
    const milestonesData = milestones.map((milestone) => ({
      proposal_id: proposalId,
      name: milestone.name,
      description: milestone.description,
      percentage: milestone.percentage,
      amount: milestone.amount,
      due_date: milestone.dueDate,
    }));

    const { error } = await supabase
      .from("proposal_milestones")
      .insert(milestonesData);

    if (error) {
      console.error("Error creating milestones:", error);
      return false;
    }

    return true;
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
      .from("proposal-documents")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from("proposal-documents")
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

    const { error } = await supabase.from("proposal_documents").insert({
      proposal_id: proposalId,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
    });

    if (error) {
      console.error("Error saving file reference:", error);
      return false;
    }

    return true;
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
