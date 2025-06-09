import { getSupabaseBrowserClient } from "../supabase";
import type { VoteType } from "../types";

export const voteService = {
  // Add or update a vote
  async vote(vote: Partial<VoteType>): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    if (!vote.userId || !vote.smartjectId || !vote.voteType) {
      console.error("Missing required vote parameters");
      return false;
    }

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
        .eq("id", existingVote.id as string);

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