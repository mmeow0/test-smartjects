"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/top-nav";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDarkNav = pathname === '/' ||  pathname === '/auth/login' ||  pathname === '/auth/register';

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav isDarkNav={isDarkNav} />
      <main className={`${!isDarkNav ? 'flex-1 px-4' : ''}`}>
        {children}
      </main>
    </div>
  );
}