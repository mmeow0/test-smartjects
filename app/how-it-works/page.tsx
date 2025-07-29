"use client";

import Link from "next/link";
import { Discover } from "@/components/icons/Discover";
import { Connect } from "@/components/icons/Connect";
import { Execute } from "@/components/icons/Execute";
import { ArrowRight, CheckCircle, Users, Lightbulb, FileText, Handshake } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-normal text-[#020817] text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            How Smartjects Work
          </h1>
          <p className="font-normal text-slate-600 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            Smartjects transform innovative research and ideas into actionable business implementation projects.
            Our platform connects innovators, businesses, and implementers through a structured three-step process.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Research-backed innovations
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Community-driven validation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Smart contract execution
            </div>
          </div>
        </div>
      </div>

      {/* Main Steps Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">

          {/* Step 1: Discover */}
          <div className="mb-20 sm:mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold text-lg">1</span>
                  </div>
                  <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl lg:text-5xl">
                    Discover
                  </h2>
                </div>
                <p className="font-normal text-slate-600 text-lg sm:text-xl leading-relaxed mb-8">
                  Browse scientific data transformed into potential implementation projects for business called smartjects
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Lightbulb className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Research-Backed Projects</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Every smartject originates from peer-reviewed research, patents, or proven innovations.
                        We transform complex academic work into practical business opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <FileText className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Implementation Roadmaps</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Each project comes with detailed implementation plans, resource requirements,
                        timeline estimates, and expected outcomes tailored for business contexts.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Users className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Curated Categories</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Projects are organized by industry, technology domain, implementation complexity,
                        and investment requirements to help you find the perfect match.
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/discover" className="inline-block mt-8">
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Start Discovering
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="order-1 lg:order-2 flex justify-center">
                <Discover className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
              </div>
            </div>
          </div>

          {/* Step 2: Connect */}
          <div className="mb-20 sm:mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="flex justify-center">
                <Connect className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <span className="text-green-600 font-semibold text-lg">2</span>
                  </div>
                  <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl lg:text-5xl">
                    Connect
                  </h2>
                </div>
                <p className="font-normal text-slate-600 text-lg sm:text-xl leading-relaxed mb-8">
                  Participate in discussions, vote on smartjects, find partners and drive innovations into business
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Users className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Community Discussions</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Engage with innovators, entrepreneurs, and industry experts. Share insights,
                        ask questions, and contribute to project development discussions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Democratic Voting</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Vote on project feasibility, implementation approaches, and resource allocation.
                        Help prioritize the most promising innovations for development.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Handshake className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Partner Matching</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Find complementary partners based on skills, resources, and interests.
                        Build teams that combine technical expertise with business acumen.
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard" className="inline-block mt-8">
                  <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Join Community
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Step 3: Execute */}
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                    <span className="text-yellow-600 font-semibold text-lg">3</span>
                  </div>
                  <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl lg:text-5xl">
                    Execute
                  </h2>
                </div>
                <p className="font-normal text-slate-600 text-lg sm:text-xl leading-relaxed mb-8">
                  Create proposals, negotiate and secure with smart contracts
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <FileText className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Structured Proposals</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Create detailed project proposals with milestones, deliverables, timelines,
                        and resource requirements. Use our templates to ensure comprehensive planning.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Handshake className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Transparent Negotiations</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Negotiate terms, budgets, and responsibilities through our platform.
                        All discussions are recorded and accessible to relevant parties.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#020817] text-lg mb-2">Smart Contract Automation</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Agreements are automatically converted into smart contracts with milestone-based
                        payments, dispute resolution, and performance tracking built-in.
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/proposals" className="inline-block mt-8">
                  <button className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Create Proposal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="order-1 lg:order-2 flex justify-center">
                <Execute className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl lg:text-5xl mb-8">
            Why Choose Smartjects?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-[#020817] text-lg mb-3">Science-Backed</h3>
              <p className="text-slate-600">
                Every project is grounded in peer-reviewed research and validated innovations
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-[#020817] text-lg mb-3">Community-Driven</h3>
              <p className="text-slate-600">
                Collaborative platform where expertise and resources are shared openly
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-[#020817] text-lg mb-3">Secure Execution</h3>
              <p className="text-slate-600">
                Smart contracts ensure transparent, automated, and trustworthy project execution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 text-lg mb-8">
            Join thousands of innovators, businesses, and implementers transforming ideas into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover">
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-yellow-300 text-black rounded-xl hover:bg-yellow-400 transition-colors font-medium">
                Explore Projects
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition-colors font-medium">
                Join Platform
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
