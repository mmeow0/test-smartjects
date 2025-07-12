"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { LogoWhite } from "@/components/icons/LogoWhite";
import { Logo } from "@/components/icons/Logo";
import OAuthButtons from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const supabase = getSupabaseBrowserClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  // Handle OAuth errors from URL parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast({
        title: "Login failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });

      // Clean up the URL by removing error parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Smartjects!",
      });
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description:
          error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background Section - Only visible on large screens */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden -top-60">
        <div className="relative w-full h-full">
          {/* Background Image */}
          <img
            className="absolute inset-0 w-full h-full object-cover object-center"
            alt="Background"
            src="/images/landing-background.png"
          />

          {/* Color Overlay */}
          <div className="absolute inset-0 bg-[#ffa357] mix-blend-color" />

          {/* Soft Light Overlay */}
          <div className="absolute inset-0 bg-black mix-blend-soft-light" />
        </div>
      </div>

      {/* Mobile Background - White */}
      <div className="lg:hidden absolute inset-0 bg-white" />

      {/* Content Container */}
      <div className="relative z-10 w-full flex">
        {/* Left side - Logo (hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 items-end justify-start p-16">
          <LogoWhite className="h-[60px] w-auto" />
        </div>

        {/* Right side - Form Section */}
        <div className="w-full lg:flex-1 lg:max-w-xl xl:max-w-2xl flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-2xl space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Logo className="h-8 w-auto" />
            </div>

            {/* Form Card */}
            <div className="bg-white lg:rounded-xl lg:shadow-xl py-6 lg:py-28 lg:px-28 sm:px-24">
              {/* Header */}
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-bold text-black">Welcome back</h1>
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black text-lg rounded-lg"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or login with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <OAuthButtons
                onLoadingChange={setIsLoading}
                disabled={isLoading}
                mode="login"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
