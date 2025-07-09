"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requirePaidAccount?: boolean;
  redirectTo?: string;
  onUnauthorized?: () => void;
}

interface UseAuthGuardReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  canAccess: boolean;
}

export function useAuthGuard(
  options: UseAuthGuardOptions = {},
): UseAuthGuardReturn {
  const {
    requireAuth = true,
    requirePaidAccount = false,
    redirectTo,
    onUnauthorized,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return;
    }

    // Mark that we've checked auth at least once
    setHasCheckedAuth(true);

    // Check authentication requirements
    if (requireAuth && !isAuthenticated) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      }
      return;
    }

    // Check paid account requirement
    if (requirePaidAccount && user?.accountType !== "paid") {
      // Don't redirect if user is already on the upgrade page to avoid infinite loop
      if (pathname === "/upgrade") {
        return;
      }

      if (onUnauthorized) {
        onUnauthorized();
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        const redirectUrl = `/upgrade?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      }
      return;
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    requireAuth,
    requirePaidAccount,
    redirectTo,
    onUnauthorized,
    router,
    pathname,
  ]);

  const canAccess =
    (!requireAuth || isAuthenticated) &&
    (!requirePaidAccount || user?.accountType === "paid");

  const isLoading = authLoading || !hasCheckedAuth;

  return {
    isLoading,
    isAuthenticated,
    user,
    canAccess: canAccess && !isLoading,
  };
}

// Convenience hooks for common use cases
export function useRequireAuth() {
  return useAuthGuard({ requireAuth: true });
}

export function useRequirePaidAccount() {
  return useAuthGuard({ requireAuth: true, requirePaidAccount: true });
}
