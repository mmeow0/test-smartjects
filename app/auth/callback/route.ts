import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(
        errorDescription || error,
      )}`,
    );
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient();

    try {
      // Exchange the code for a session
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(
            exchangeError.message,
          )}`,
        );
      }

      console.log("OAuth login successful");

      // Redirect to dashboard on successful OAuth login
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (error) {
      console.error("Unexpected error during OAuth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(
          "An unexpected error occurred during login",
        )}`,
      );
    }
  }

  // If no code and no error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}
