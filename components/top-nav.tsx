"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Lightbulb, Menu, X, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBadge } from "@/components/notification-badge"

export function TopNav() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Main navigation items
  const navItems = [
    { href: "/", label: "Smartjects", isMain: true },
    { href: "/hub", label: "Smartjects Hub", isMain: true },
  ]

  // Items only for authenticated users
  const authenticatedItems = [
    { href: "/dashboard", label: "Dashboard", isMain: true },
    { href: "/proposals", label: "Proposals", isMain: false },
    { href: "/matches", label: "Matches", isMain: false },
    { href: "/negotiations", label: "Negotiations", isMain: false },
    { href: "/contracts", label: "Contracts", isMain: false },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">Smartjects</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Main nav items (always visible) */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
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
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
        </nav>

        {/* User Menu, Theme Toggle, and Auth Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications (for authenticated users) */}
          {isAuthenticated && <NotificationBadge />}

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user?.name || "User"}</span>
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
                      <Link href="/matches">My Matches</Link>
                    </DropdownMenuItem> */}
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
                    logout()
                  }}
                  className="cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </Button>
              <Button size="sm" asChild>
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-primary text-primary-foreground p-1 rounded">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl">Smartjects</span>
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
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                          pathname === item.href ? "text-primary" : "text-muted-foreground"
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
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === item.href ? "text-primary" : "text-muted-foreground"
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
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" asChild>
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
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
    </header>
  )
}
