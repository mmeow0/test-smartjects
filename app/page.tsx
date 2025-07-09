"use client";

import { HeroSection } from "@/components/hero-section";
import { StayUpdatedSection } from "@/components/stay-updated-section";
import { FooterNav } from "@/components/footer-nav";
import { PolicyLinks } from "@/components/policy-links";
import { Copyright } from "@/components/copyright";
import {
  HowItWorksSection,
  ComparisonSection,
  DiscoverSection,
} from "@/components/home";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Area */}
      <div className="bg-white">
        {/* How It Works Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <HowItWorksSection />
        </section>

        {/* Comparison Section */}
        <section className="">
          <ComparisonSection />
        </section>

        {/* Discover Section */}
        <section className="py-8">
          <DiscoverSection />
        </section>

        {/* Stay Updated Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <StayUpdatedSection />
        </section>

        {/* Footer Navigation */}
        <FooterNav />

        {/* Policy Links */}
        <PolicyLinks />

        {/* Copyright */}
        <Copyright />
      </div>
    </>
  );
}
