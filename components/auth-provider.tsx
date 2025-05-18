"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type UserType = {
  id: string
  name: string
  email: string
  accountType: "free" | "paid"
  avatar?: string
}

type AuthContextType = {
  user: UserType | null
  isAuthenticated: boolean
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  upgradeAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Check for existing session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          return
        }

        if (session) {
          setSession(session)
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error in session check:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)

      if (event === "SIGNED_IN" && newSession) {
        await fetchUserProfile(newSession.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch user profile from the database
  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (error) {
        console.error("Error fetching user profile:", error)

        // If user doesn't exist in our database yet, create a profile
        if (error.code === "PGRST116") {
          await createUserProfile(authUser)
          return
        }

        return
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          accountType: data.account_type,
          avatar: data.avatar_url,
        })
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
    }
  }

  // Create a new user profile in our database
  const createUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata.full_name || authUser.email?.split("@")[0] || "User",
          account_type: "free",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user profile:", error)
        return
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: authUser.email || "",
          accountType: data.account_type,
          avatar: data.avatar_url,
        })
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        throw error
      }

      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const upgradeAccount = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("users").update({ account_type: "paid" }).eq("id", user.id)

      if (error) {
        throw error
      }

      setUser({
        ...user,
        accountType: "paid",
      })

      // Simulate API delay
      return new Promise<void>((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Upgrade account error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

      // Force a page reload to ensure all components re-render
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

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
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
