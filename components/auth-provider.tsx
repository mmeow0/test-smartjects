"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = getSupabaseBrowserClient();

type UserType = {
  id: string;
  name: string;
  email: string;
  accountType: "free" | "paid";
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  createdAt?: string;
};

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile from the database
  const fetchUserProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, account_type, avatar_url, bio, location, company, website, created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        accountType: data.account_type,
        avatar: data.avatar_url ?? undefined,
        bio: data.bio ?? undefined,
        location: data.location ?? undefined,
        company: data.company ?? undefined,
        website: data.website ?? undefined,
        createdAt: data.created_at ?? undefined,
      });
      setIsAuthenticated(true);
    } else {
      // если пользователя нет в БД — создаём его
      await createUserProfile(authUser);
    }
  };

  // Create a new user profile in our database
  const createUserProfile = async (authUser: User) => {
    console.log("Creating new user profile for:", authUser.id);
    if (!supabase) {
      console.error("Supabase client not available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: authUser.id,
          email: authUser.email,
          name:
            authUser.user_metadata.full_name ||
            authUser.email?.split("@")[0] ||
            "User",
          account_type: "free",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        return;
      }

      if (data) {
        console.log("User profile created successfully:", data.id);
        setUser({
          id: data.id,
          name: data.name,
          email: authUser.email || "",
          accountType: data.account_type,
          avatar: data.avatar_url,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error);
      throw error;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    console.log("Auth provider mounted, checking session...");

    const initializeAuth = async () => {
      if (!supabase) {
        console.error("Supabase client not available");
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching session...");
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const currentSession = sessionData.session;
        console.log("Session fetched:", currentSession ? "yes" : "no");

        if (!isMounted) return;

        if (currentSession) {
          // 1) сохраняем саму сессию
          setSession(currentSession);
          // 2) показываем, что мы перезагружаем контекст
          setIsLoading(true);
          // 3) подгружаем профиль
          await fetchUserProfile(currentSession.user);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        if (isMounted) {
          // 4) как только профиль загружен (или не было сессии) — убираем загрузчик
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    let subscription:
      | ReturnType<
          typeof supabase.auth.onAuthStateChange
        >["data"]["subscription"]
      | undefined;

    if (supabase) {
      console.log("Setting up auth state change listener");

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        // ⏱ Обернули весь колбэк в setTimeout, чтобы избежать deadlock
        setTimeout(async () => {
          console.log(
            "Auth state changed:",
            event,
            newSession ? "Session exists" : "No session"
          );

          if (!newSession) {
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          setSession(newSession);

          if (event === "SIGNED_IN") {
            setIsLoading(true);
            try {
              await fetchUserProfile(newSession.user);
            } catch (error) {
              console.error("Error fetching profile after sign in:", error);
            } finally {
              setIsLoading(false);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
          } else if (event === "TOKEN_REFRESHED") {
            // Nothing special: session is already updated above
          }
        }, 0);
      });

      subscription = sub;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      console.log("Attempting login for:", email);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        throw error;
      }

      console.log("Login successful, session established");
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      console.log("Attempting registration for:", email);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        throw error;
      }

      console.log("Registration successful");

      // The auth state change listener should handle updating the user state
      // But we'll also manually fetch the profile to ensure it's loaded
      if (data.user) {
        try {
          await fetchUserProfile(data.user);
        } catch (profileError) {
          console.error(
            "Error fetching profile after registration:",
            profileError
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const upgradeAccount = async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      console.log("Upgrading account for:", user.id);
      const { error } = await supabase
        .from("users")
        .update({ account_type: "paid" })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setUser({
        ...user,
        accountType: "paid",
      });

      console.log("Account upgraded successfully");

      // Simulate API delay
      return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Upgrade account error:", error);
      throw error;
    }
  };

const logout = async () => {
  if (!supabase) {
    console.error("Supabase client not available");
    return;
  }

  console.log("Attempting logout");
  setIsLoading(true);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    setIsLoading(false);
    return;
  }

  console.log("Logout successful");

  setUser(null);
  setSession(null);
  setIsAuthenticated(false);
  setIsLoading(false);

  router.push("/");
};

const refreshUser = async () => {
  if (!session?.user) {
    throw new Error("No authenticated user to refresh");
  }

  try {
    await fetchUserProfile(session.user);
  } catch (error) {
    console.error("Error refreshing user profile:", error);
    throw error;
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        session,
        login,
        register,
        logout,
        upgradeAccount,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
