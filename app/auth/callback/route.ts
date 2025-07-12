import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get the correct base URL for redirects
function getBaseUrl(requestUrl: URL): string {
  // Use environment variable if set (for production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback to request origin, but ensure it's not localhost in production
  const origin = requestUrl.origin;

  // If we're in production and still getting localhost, use a default
  if (process.env.NODE_ENV === "production" && origin.includes("localhost")) {
    console.warn(
      "Production environment detected but got localhost origin, using fallback",
    );
    return "https://www.smartjects.com"; // Fallback for production
  }

  return origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const baseUrl = getBaseUrl(requestUrl);

  console.log(
    `OAuth callback - Base URL: ${baseUrl}, Code: ${code ? "present" : "missing"}, Error: ${error || "none"}`,
  );

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/auth/login?error=${encodeURIComponent(
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
          `${baseUrl}/auth/login?error=${encodeURIComponent(
            exchangeError.message,
          )}`,
        );
      }

      console.log("OAuth login successful - redirecting to dashboard");

      // Redirect to dashboard on successful OAuth login
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    } catch (error) {
      console.error("Unexpected error during OAuth callback:", error);
      return NextResponse.redirect(
        `${baseUrl}/auth/login?error=${encodeURIComponent(
          "An unexpected error occurred during login",
        )}`,
      );
    }
  }

  // If no code and no error, redirect to login
  console.log("No code provided - redirecting to login");
  return NextResponse.redirect(`${baseUrl}/auth/login`);
}
