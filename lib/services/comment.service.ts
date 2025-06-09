import { getSupabaseBrowserClient } from "../supabase";
import type { CommentType } from "../types";

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
      id: comment.id as string,
      userId: comment.user_id as string,
      smartjectId: comment.smartject_id as string,
      content: comment.content as string,
      createdAt: comment.created_at as string,
      user: {
        name: comment.users?.name as string,
        avatar: comment.users?.avatar_url as string,
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
      id: data.id as string,
      userId: data.user_id as string,
      smartjectId: data.smartject_id as string,
      content: data.content as string,
      createdAt: data.created_at as string,
      user: {
        name: (data.users as any)?.name || "Unknown User",
        avatar: (data.users as any)?.avatar_url || "",
      },
    };
  },
};