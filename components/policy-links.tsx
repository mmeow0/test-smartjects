"use client";

import Link from "next/link";

export function PolicyLinks() {
  return (
    <div className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-6 sm:py-8">
          <Link
            href="/privacy-policy"
            className="text-sm sm:text-base text-[#FF7100] hover:text-opacity-80 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF7100] focus:ring-opacity-50 rounded px-2 py-1"
          >
            Privacy Policy
          </Link>

          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>

          <Link
            href="/cookie-policy"
            className="text-sm sm:text-base text-[#FF7100] hover:text-opacity-80 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF7100] focus:ring-opacity-50 rounded px-2 py-1"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
