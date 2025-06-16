import { getSupabaseBrowserClient } from "../supabase";
import type { UserSettingsType } from "../types";

export const userSettingsService = {
  // Get user settings by user ID
  async getUserSettings(userId: string): Promise<UserSettingsType | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching user settings for user ${userId}:`, error);
      return null;
    }

    if (!data) {
      // Create default settings if they don't exist
      return await this.createDefaultSettings(userId);
    }

    return {
      id: data.id,
      userId: data.user_id,
      emailNotifications: data.email_notifications,
      smartjectUpdates: data.smartject_updates,
      proposalMatches: data.proposal_matches,
      contractUpdates: data.contract_updates,
      marketingEmails: data.marketing_emails,
      profileVisibility: data.profile_visibility as "public" | "registered" | "private",
      dataSharing: data.data_sharing,
      theme: data.theme as "light" | "dark" | "system",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Create default settings for a new user
  async createDefaultSettings(userId: string): Promise<UserSettingsType | null> {
    const supabase = getSupabaseBrowserClient();

    const defaultSettings = {
      user_id: userId,
      email_notifications: true,
      smartject_updates: true,
      proposal_matches: true,
      contract_updates: true,
      marketing_emails: false,
      profile_visibility: "public",
      data_sharing: false,
      theme: "system",
    };

    const { data, error } = await supabase
      .from("user_settings")
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error(`Error creating default settings for user ${userId}:`, error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      emailNotifications: data.email_notifications,
      smartjectUpdates: data.smartject_updates,
      proposalMatches: data.proposal_matches,
      contractUpdates: data.contract_updates,
      marketingEmails: data.marketing_emails,
      profileVisibility: data.profile_visibility as "public" | "registered" | "private",
      dataSharing: data.data_sharing,
      theme: data.theme as "light" | "dark" | "system",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Update user settings
  async updateUserSettings(userId: string, settings: Partial<Omit<UserSettingsType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // Convert camelCase to snake_case for database
    const updateData: any = {};
    
    if (settings.emailNotifications !== undefined) {
      updateData.email_notifications = settings.emailNotifications;
    }
    if (settings.smartjectUpdates !== undefined) {
      updateData.smartject_updates = settings.smartjectUpdates;
    }
    if (settings.proposalMatches !== undefined) {
      updateData.proposal_matches = settings.proposalMatches;
    }
    if (settings.contractUpdates !== undefined) {
      updateData.contract_updates = settings.contractUpdates;
    }
    if (settings.marketingEmails !== undefined) {
      updateData.marketing_emails = settings.marketingEmails;
    }
    if (settings.profileVisibility !== undefined) {
      updateData.profile_visibility = settings.profileVisibility;
    }
    if (settings.dataSharing !== undefined) {
      updateData.data_sharing = settings.dataSharing;
    }
    if (settings.theme !== undefined) {
      updateData.theme = settings.theme;
    }

    const { error } = await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      console.error(`Error updating user settings for user ${userId}:`, error);
      return false;
    }

    return true;
  },

  // Update email (this updates the auth.users table)
  async updateUserEmail(newEmail: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      console.error("Error updating user email:", error);
      return false;
    }

    return true;
  },

  // Update password (this updates the auth.users table)
  async updateUserPassword(newPassword: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating user password:", error);
      return false;
    }

    return true;
  },

  // Delete user account (this will cascade delete settings due to foreign key)
  async deleteUserAccount(userId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // First delete from our custom users table
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (userError) {
      console.error(`Error deleting user ${userId}:`, userError);
      return false;
    }

    // Then delete from auth.users (this requires admin privileges, so it might fail)
    // In a real app, you might want to mark the user as deleted instead
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn("Could not delete auth user (requires admin privileges):", authError);
      }
    } catch (error) {
      console.warn("Could not delete auth user:", error);
    }

    return true;
  },
};