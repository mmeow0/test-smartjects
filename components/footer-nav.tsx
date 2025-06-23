"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
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
          <div className="flex items-center gap-1 sm:gap-2">
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
                      {/* <DropdownMenuItem asChild>
                        <Link href="/negotiations">My Negotiations</Link>
                      </DropdownMenuItem> */}
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
              <div className="flex items-center gap-1 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-[#FFD900] hover:bg-transparent text-black px-2 sm:px-3"
                >
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Log in</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-[#FFD900] text-black hover:bg-[#e6c300] px-2 sm:px-3"
                >
                  <Link href="/auth/register">
                    <UserPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              {/* Main nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-[#FFD900] hover:bg-gray-50 rounded-md ${
                    pathname === item.href
                      ? "text-black bg-gray-50"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Authenticated user items */}
              {isAuthenticated &&
                authenticatedItems
                  .filter((item) => item.isMain)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium transition-colors hover:text-[#FFD900] hover:bg-gray-50 rounded-md ${
                        pathname === item.href
                          ? "text-black bg-gray-50"
                          : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

              {/* User menu items for mobile */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="px-3 py-2 text-sm font-medium text-gray-500">
                      Account
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                    >
                      Settings
                    </Link>
                    {user?.accountType === "paid" && (
                      <>
                        <Link
                          href="/proposals"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                        >
                          My Proposals
                        </Link>
                        <Link
                          href="/negotiations"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                        >
                          My Negotiations
                        </Link>
                        <Link
                          href="/contracts"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                        >
                          My Contracts
                        </Link>
                      </>
                    )}
                    {user?.accountType === "free" && (
                      <Link
                        href="/upgrade"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                      >
                        Upgrade to Paid
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-[#FFD900] hover:bg-gray-50 rounded-md"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
