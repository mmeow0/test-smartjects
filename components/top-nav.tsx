"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
// import { ThemeToggle } from "@/components/theme-toggle"; // временно скрыто
import { NotificationBadge } from "@/components/notification-badge";
import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { Logo } from "./icons/Logo";
import { LogoWhite } from "./icons/LogoWhite";

interface TopNavProps {
  isDarkNav?: boolean;
}

export function TopNav({ isDarkNav: isHomePage = false }: TopNavProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header
      className={`${
        isHomePage
          ? "absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
          : "sticky top-0 z-50 bg-gray-50 border-b border-gray-200"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              {isHomePage ? (
                <LogoWhite className="h-8 w-auto" />
              ) : (
                <Logo className="h-8 w-auto" />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Main nav items (always visible) */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  isHomePage
                    ? `hover:text-[#FFD900] ${
                        pathname === item.href ? "text-white" : "text-gray-500"
                      }`
                    : `hover:text-[#FFD900] ${
                        pathname === item.href ? "text-black" : "text-gray-500"
                      }`
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
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      isHomePage
                        ? `hover:text-[#FFD900] ${
                            pathname === item.href
                              ? "text-white"
                              : "text-gray-500"
                          }`
                        : `hover:text-[#FFD900] ${
                            pathname === item.href
                              ? "text-black"
                              : "text-gray-500"
                          }`
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
          </nav>

          {/* User Menu, Theme Toggle, and Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {/* <div
              className={`${
                isHomePage
                  ? "[&_button]:text-white [&_button:hover]:text-[#FFD900] [&_svg]:text-white"
                  : "[&_button]:text-black [&_button:hover]:text-[#FFD900] [&_svg]:text-black"
              }`}
            >
              <ThemeToggle />
            </div> */}

            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <div
                className={`${
                  isHomePage
                    ? "[&_button]:text-white [&_button:hover]:text-[#FFD900] [&_svg]:text-white"
                    : "[&_button]:text-black [&_button:hover]:text-[#FFD900] [&_svg]:text-black"
                }`}
              >
                <NotificationBadge />
              </div>
            )}

            {/* Wallet Connect (for authenticated users) */}
            {isAuthenticated && !isHomePage && (
              <div className="ml-2">
                <WalletConnect compact />
              </div>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 hover:text-[#FFD900] hover:bg-transparent ${
                      isHomePage ? "text-white" : "text-black"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || ""} />
                      <AvatarFallback
                        className={`${
                          isHomePage
                            ? "bg-white text-black"
                            : "bg-gray-200 text-black"
                        }`}
                      >
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
                  <DropdownMenuSeparator />
                  {user?.accountType === "paid" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/proposals">My Proposals</Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem asChild>
                        <Link href="/matches">My Matches</Link>
                      </DropdownMenuItem> */}
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
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  asChild
                  className={`hover:text-[#FFD900] hover:bg-transparent ${
                    isHomePage ? "text-white" : "text-black"
                  }`}
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

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`md:hidden hover:text-[#FFD900] hover:bg-transparent ${
                    isHomePage ? "text-white" : "text-black"
                  }`}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Logo className="h-8" />
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-4">
                    {/* Main nav items (always visible) */}
                    {navItems.map((item) => (
                      <SheetClose key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                            pathname === item.href
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}

                    {/* Items only for authenticated users */}
                    {isAuthenticated && (
                      <>
                        <div className="h-px bg-border my-2" />
                        {authenticatedItems.map((item) => (
                          <SheetClose key={item.href} asChild>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                                pathname === item.href
                                  ? "text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </>
                    )}
                  </nav>

                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href="/auth/login"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Log in
                        </Link>
                      </Button>
                      <Button
                        className="w-full justify-start bg-[#FFD900] text-black hover:bg-[#e6c300]"
                        asChild
                      >
                        <Link
                          href="/auth/register"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
