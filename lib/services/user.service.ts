import { getSupabaseBrowserClient } from "../supabase";
import type { UserType } from "../types";

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
      id: data.id as string,
      name: data.name as string,
      email: data.email as string,
      accountType: data.account_type as "free" | "paid",
      avatar: data.avatar_url as string | undefined,
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