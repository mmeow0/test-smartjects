"use client";

import Link from "next/link";

export function PolicyLinks() {
  return (
    <div className="flex items-center justify-center gap-8 px-4 py-5 bg-white mt-8">
      <Link
        href="/privacy-policy"
        className="text-sm text-[#FF7100] hover:text-opacity-80 transition-colors"
      >
        Privacy Policy
      </Link>

      <Link
        href="/cookie-policy"
        className="text-sm text-[#FF7100] hover:text-opacity-80 transition-colors"
      >
        Cookie Policy
      </Link>
    </div>
  );
}
