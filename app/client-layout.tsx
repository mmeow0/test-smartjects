"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/top-nav";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav isHomePage={isHomePage} />
      <main className={`${!isHomePage ? 'flex-1 px-4' : ''}`}>
        {children}
      </main>
    </div>
  );
}