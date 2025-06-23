"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./icons/Logo";

export function FooterNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Main navigation items
  const navItems = [
    { href: "/", label: "Home", isMain: true },
    { href: "/discover", label: "Discover", isMain: true },
  ];

  // Items only for authenticated users
  const authenticatedItems = [
    { href: "/dashboard", label: "Dashboard", isMain: true },
    { href: "/proposals", label: "Proposals", isMain: false },
    { href: "/matches", label: "Matches", isMain: false },
    { href: "/negotiations", label: "Negotiations", isMain: false },
    { href: "/contracts", label: "Contracts", isMain: false },
  ];

  return (
    <footer className="bg-white">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Main nav items (always visible) */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#FFD900] ${
                  pathname === item.href ? "text-black" : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Items only for authenticated users */}
            {isAuthenticated &&
              authenticatedItems
                .filter((item) => item.isMain)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#FFD900] ${
                      pathname === item.href ? "text-black" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
          </nav>

          {/* User Menu and Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:text-[#FFD900] hover:bg-transparent text-black"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || ""} />
                      <AvatarFallback className="bg-gray-200 text-black">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user?.accountType === "paid" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/proposals">My Proposals</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/negotiations">My Negotiations</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/contracts">My Contracts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.accountType === "free" && (
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade">Upgrade to Paid</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                    }}
                    className="cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  asChild
                  className="hover:text-[#FFD900] hover:bg-transparent text-black"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#FFD900] text-black hover:bg-[#e6c300]"
                >
                  <Link href="/auth/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
