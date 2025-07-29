export type SmartjectType = {
  id: string;
  title: string;
  votes: {
    believe: number;
    need: number;
    provide: number;
  };
  userVotes: {
    believe: boolean;
    need: boolean;
    provide: boolean;
  };
  comments: number;
  createdAt: string;
  mission: string;
  problematics: string;
  scope: string;
  howItWorks: string;
  architecture: string;
  innovation: string;
  useCase: string;
  industries: string[];
  businessFunctions: string[];
  audience?: string[];
  teams: string[];
  researchPapers: { title: string; url: string }[];
  relevantLinks: { title: string; url: string }[];
  image?: string;
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  accountType: "free" | "paid";
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  joinDate?: string;
  // Stripe fields
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionPlan?: "monthly" | "annual";
  subscriptionStatus?:
    | "active"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete";
  subscriptionCurrentPeriodStart?: string;
  subscriptionCurrentPeriodEnd?: string;
  subscriptionCreatedAt?: string;
  subscriptionCanceledAt?: string;
  lastPaymentDate?: string;
};

export type UserSettingsType = {
  id: string;
  userId: string;
  // Notification settings
  emailNotifications: boolean;
  smartjectUpdates: boolean;
  proposalMatches: boolean;
  contractUpdates: boolean;
  marketingEmails: boolean;
  // Privacy settings
  profileVisibility: "public" | "registered" | "private";
  dataSharing: boolean;
  // Appearance settings
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
};

// NDA Signature type
export type NDASignature = {
  id: string;
  proposalId: string;
  signerUserId: string;
  signedAt: string;
  createdAt: string;
};

export type NDARequestFile = {
  id: string;
  ndaSignatureId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: string;
};

export type NDATemplate = {
  id: string;
  proposalId: string;
  templateName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
};

export type NDARequest = {
  id: string;
  proposalId: string;
  signerUserId: string;
  status: "pending" | "approved" | "rejected";
  requestMessage?: string;
  pendingAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedByUserId?: string;
  signerName?: string;
  signerEmail?: string;
  signerAvatar?: string;
  attachedFiles?: NDARequestFile[];
};

// Private fields structure for confidential information
export type ProposalPrivateFields = {
  scope?: string;
  timeline?: string;
  budget?: number;
  deliverables?: string;
  requirements?: string;
  expertise?: string;
  approach?: string;
  team?: string;
  additionalInfo?: string;
};

export type ProposalType = {
  id: string;
  smartjectId: string;
  userId: string;
  type: "need" | "provide";
  title: string;
  description: string;
  isCooperationProposal?: boolean;
  budget?: number;
  timeline?: string;
  scope?: string;
  deliverables?: string;
  requirements?: string;
  expertise?: string;
  approach?: string;
  team?: string;
  smartjectTitle: string;
  files: {
    id: string;
    name: string;
    size: number;
    type: string;
    path: string;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  }[];
  additionalInfo?: string;
  status: "draft" | "submitted" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  milestones?: {
    id: string;
    name: string;
    description: string;
    percentage: number;
    amount: string;
    deliverables: {
      id: string;
      description: string;
      completed: boolean;
    }[];
  }[];
  // Private fields that require NDA to view
  privateFields?: ProposalPrivateFields;
  // NDA signatures for this proposal
  ndaSignatures?: NDASignature[];
};

export type MilestoneType = {
  id: string;
  proposalId: string;
  name: string;
  description: string;
  percentage: number;
  amount: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "overdue"
    | "pending_review";
};

export type DeliverableType = {
  id: string;
  milestoneId: string;
  description: string;
  completed: boolean;
};

export type CommentType = {
  id: string;
  userId: string;
  smartjectId: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
};

export type VoteType = {
  id: string;
  userId: string;
  smartjectId: string;
  voteType: "believe" | "need" | "provide";
  createdAt: string;
};

export type MatchType = {
  id: string;
  smartjectId: string;
  status: "new" | "in_negotiation" | "contract_ready" | "contract_signed";
  matchedDate: string;
  proposals: ProposalType[];
};

export type MessageType = {
  id: string;
  matchId: string;
  userId: string;
  content: string;
  isCounterOffer: boolean;
  counterOfferBudget?: string;
  counterOfferTimeline?: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
};

export type ContractType = {
  id: string;
  matchId: string;
  providerId: string;
  neederId: string;
  title: string;
  status: "pending_start" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  exclusivityEnds: string;
  budget: number;
  scope: string;
  createdAt: string;
  updatedAt: string;
  milestones: ContractMilestoneType[];
  deliverables: string[];
};

export type ContractMilestoneType = {
  id: string;
  contractId: string;
  name: string;
  description: string;
  percentage: number;
  amount: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "overdue"
    | "pending_review";
  completedDate?: string;
  deliverables: DeliverableType[];
};

export type ContractListType = {
  id: string;
  matchId: string;
  smartjectId: string;
  smartjectTitle: string;
  otherParty: string;
  role: "provider" | "needer";
  startDate: string;
  endDate: string;
  status: "pending_start" | "active" | "completed" | "cancelled";
  budget: number;
  nextMilestone?: string;
  nextMilestoneId?: string;
  nextMilestoneDate?: string;
  finalMilestone?: string;
  completionDate?: string;
  exclusivityEnds: string;
};

export type DocumentVersionType = {
  id: string;
  documentId: string;
  versionNumber: number;
  author: string;
  changes: string[];
  createdAt: string;
};

// Update the Database type with tables for proposals and milestones
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          account_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          account_type?: string;
          created_at?: string;
          bio?: string | null;
          location?: string | null;
          company?: string | null;
          website?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          subscription_current_period_start?: string | null;
          subscription_current_period_end?: string | null;
          subscription_created_at?: string | null;
          subscription_canceled_at?: string | null;
          last_payment_date?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          account_type?: string;
          created_at?: string;
          bio?: string | null;
          location?: string | null;
          company?: string | null;
          website?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          subscription_current_period_start?: string | null;
          subscription_current_period_end?: string | null;
          subscription_created_at?: string | null;
          subscription_canceled_at?: string | null;
          last_payment_date?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          smartject_updates: boolean;
          proposal_matches: boolean;
          contract_updates: boolean;
          marketing_emails: boolean;
          profile_visibility: string;
          data_sharing: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          smartject_updates?: boolean;
          proposal_matches?: boolean;
          contract_updates?: boolean;
          marketing_emails?: boolean;
          profile_visibility?: string;
          data_sharing?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_notifications?: boolean;
          smartject_updates?: boolean;
          proposal_matches?: boolean;
          contract_updates?: boolean;
          marketing_emails?: boolean;
          profile_visibility?: string;
          data_sharing?: boolean;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      smartjects: {
        Row: {
          id: string;
          title: string;
          mission: string | null;
          problematics: string | null;
          scope: string | null;
          audience: string | null;
          how_it_works: string | null;
          architecture: string | null;
          innovation: string | null;
          use_case: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          mission?: string | null;
          problematics?: string | null;
          scope?: string | null;
          audience?: string | null;
          how_it_works?: string | null;
          architecture?: string | null;
          innovation?: string | null;
          use_case?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          mission?: string | null;
          problematics?: string | null;
          scope?: string | null;
          audience?: string | null;
          how_it_works?: string | null;
          architecture?: string | null;
          innovation?: string | null;
          use_case?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          smartject_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          budget: number | null;
          timeline: string | null;
          scope: string | null;
          deliverables: string | null;
          requirements: string | null;
          expertise: string | null;
          approach: string | null;
          team: string | null;
          additional_info: string | null;
          status: string;
          is_cooperation_proposal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          smartject_id: string;
          user_id: string;
          type: string;
          title: string;
          description?: string | null;
          budget?: number | null;
          timeline?: string | null;
          scope?: string | null;
          deliverables?: string | null;
          requirements?: string | null;
          expertise?: string | null;
          approach?: string | null;
          team?: string | null;
          additional_info?: string | null;
          status?: string;
          is_cooperation_proposal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          smartject_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          budget?: number | null;
          timeline?: string | null;
          scope?: string | null;
          deliverables?: string | null;
          requirements?: string | null;
          expertise?: string | null;
          approach?: string | null;
          team?: string | null;
          additional_info?: string | null;
          status?: string;
          is_cooperation_proposal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_milestones: {
        Row: {
          id: string;
          proposal_id: string;
          name: string;
          description: string | null;
          percentage: number;
          amount: string | null;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          name: string;
          description?: string | null;
          percentage: number;
          amount?: string | null;
          due_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          name?: string;
          description?: string | null;
          percentage?: number;
          amount?: string | null;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_deliverables: {
        Row: {
          id: string;
          milestone_id: string;
          description: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          description: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          description?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposal_documents: {
        Row: {
          id: string;
          proposal_id: string;
          name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      // Add other tables as needed
    };
  };
};
