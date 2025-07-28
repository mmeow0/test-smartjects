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
      bio: data.bio as string | undefined,
      location: data.location as string | undefined,
      company: data.company as string | undefined,
      website: data.website as string | undefined,
      joinDate: data.created_at as string | undefined,
      stripeCustomerId: data.stripe_customer_id as string | undefined,
      stripeSubscriptionId: data.stripe_subscription_id as string | undefined,
      subscriptionPlan: data.subscription_plan as
        | "monthly"
        | "annual"
        | undefined,
      subscriptionStatus: data.subscription_status as
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid"
        | "incomplete"
        | undefined,
      subscriptionCurrentPeriodStart: data.subscription_current_period_start as
        | string
        | undefined,
      subscriptionCurrentPeriodEnd: data.subscription_current_period_end as
        | string
        | undefined,
      subscriptionCreatedAt: data.subscription_created_at as string | undefined,
      subscriptionCanceledAt: data.subscription_canceled_at as
        | string
        | undefined,
      lastPaymentDate: data.last_payment_date as string | undefined,
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
        bio: user.bio,
        location: user.location,
        company: user.company,
        website: user.website,
        stripe_customer_id: user.stripeCustomerId,
        stripe_subscription_id: user.stripeSubscriptionId,
        subscription_plan: user.subscriptionPlan,
        subscription_status: user.subscriptionStatus,
        subscription_current_period_start: user.subscriptionCurrentPeriodStart,
        subscription_current_period_end: user.subscriptionCurrentPeriodEnd,
        subscription_created_at: user.subscriptionCreatedAt,
        subscription_canceled_at: user.subscriptionCanceledAt,
        last_payment_date: user.lastPaymentDate,
      })
      .eq("id", id);

    if (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      return false;
    }

    return true;
  },

  // Alias for getUserById
  async getUser(id: string): Promise<UserType | null> {
    return this.getUserById(id);
  },
};
