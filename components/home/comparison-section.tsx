import { memo } from "react";

export const ComparisonSection = memo(() => (
  <div className="relative bg-black rounded-[25px] sm:rounded-[35px] lg:rounded-[50px] overflow-hidden py-8 sm:py-12 lg:py-16">
    {/* Background Image and Overlays */}
    <div className="absolute inset-0 z-0 overflow-hidden rounded-[25px] sm:rounded-[35px] lg:rounded-[50px]">
      <div className="relative w-full h-full">
        <img
          className="absolute inset-0 w-full h-full object-cover object-center"
          alt="Background"
          src="/images/landing-background.png"
        />
        <div className="absolute inset-0 bg-[#ffa357] mix-blend-color opacity-80" />
        <div className="absolute inset-0 bg-black mix-blend-soft-light opacity-60" />
      </div>
    </div>

    {/* Content Container */}
    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-12 sm:space-y-16 lg:space-y-20">
        {/* First Comparison: Why smartjects are better for innovations */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-20">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
            <div className="text-center lg:text-left">
              <h2 className="font-normal text-2xl sm:text-3xl md:text-4xl lg:text-[50px] leading-tight lg:leading-normal tracking-tight">
                <span className="text-slate-50">Why </span>
                <span className="font-dynalight text-slate-50 text-3xl sm:text-4xl md:text-5xl lg:text-[80px]">
                  smartjects
                </span>
                <span className="text-slate-50"> are</span>
                <br className="hidden sm:block" />
                <span className="text-slate-50"> better for innovations</span>
              </h2>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-white text-sm sm:text-base lg:text-lg leading-6 lg:leading-7 max-w-2xl mx-auto lg:mx-0">
                Traditional implementation projects are not focused on
                innovation. Long processes like gathering requirements, writing
                specs, and running tenders can’t keep up with fast-moving
                technologies - so results often end up outdated, average, and
                uncompetitive.
              </p>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Traditional implementation projects */}
            <div className="bg-[#ffffff0d] rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] flex items-center justify-center bg-[#ff6b00] rounded-xl lg:rounded-2xl flex-shrink-0">
                  <span className="text-black font-thin text-3xl sm:text-4xl lg:text-6xl  pb-1">
                    -
                  </span>
                </div>
                <h3 className="font-semibold text-slate-50 text-base sm:text-lg leading-5 sm:leading-6">
                  Traditional implementation projects
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Two cards in a row on larger screens, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-[#ffffff0d] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      Not Built for Innovation
                    </h4>
                    <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                      Often start from internal assumptions or top-down
                      mandates, leading to weak competitive market position.
                    </p>
                  </div>

                  <div className="bg-[#ffffff0d] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      Weak Business Cases
                    </h4>
                    <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                      Market validation comes too late - only after pilots or
                      expensive market research.
                    </p>
                  </div>
                </div>

                <div className="bg-[#ffffff0d] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                  <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                    Always late
                  </h4>
                  <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                    Require long lead times, RFP processes, and vendor
                    evaluations.
                  </p>
                </div>
              </div>
            </div>

            {/* Smartjects approach */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] flex items-center justify-center bg-[#ffd800] rounded-xl lg:rounded-2xl flex-shrink-0">
                  <span className="text-black font-thin text-2xl sm:text-3xl lg:text-4xl pb-1">
                    +
                  </span>
                </div>
                <h3 className="font-semibold text-black text-base sm:text-lg leading-5 sm:leading-6">
                  Smartjects approach
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      Immediate relevance through research-driven origin
                    </h4>
                    <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                      Begin with scientific research, ensuring ideas are
                      grounded in recent innovations and cutting-edge findings.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      Market validation is built-In
                    </h4>
                    <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                      Use live voting mechanisms to community-validate
                      relevance, demand, and supply before implementation.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                  <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                    Shorter time to value
                  </h4>
                  <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                    Allow fast, peer-to-peer matching of needs and providers,
                    leading directly to automated smart contract creation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Comparison: Why smartjects are better than startups */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-20">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-end">
            <div className="text-center lg:text-left">
              <h2 className="font-normal text-2xl sm:text-3xl md:text-4xl lg:text-[50px] leading-tight lg:leading-normal tracking-tight">
                <span className="text-slate-50">Why </span>
                <span className="font-dynalight text-slate-50 text-3xl sm:text-4xl md:text-5xl lg:text-[80px]">
                  smartjects
                </span>
                <span className="text-slate-50"> are</span>
                <br className="hidden sm:block" />
                <span className="text-slate-50"> better than startups</span>
              </h2>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-white text-sm sm:text-base lg:text-lg leading-6 lg:leading-7 max-w-2xl mx-auto lg:mx-0">
                Startups cannot keep up with the pace of innovation.
                Technologies quickly become obsolete, and most startups lose
                their reason for existence.
              </p>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Startups */}
            <div className="bg-[#ffffff0d] rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] flex items-center justify-center bg-[#ff6b00] rounded-xl lg:rounded-2xl flex-shrink-0">
                  <span className="text-black font-thin text-3xl sm:text-4xl lg:text-6xl pb-1">
                    -
                  </span>
                </div>
                <h3 className="font-semibold text-slate-50 text-base sm:text-lg leading-5 sm:leading-6">
                  Startups
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#ffffff0d] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                        Fundraising bottlenecks
                      </h4>
                      <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                        Require initial capital, pitching, and often months of
                        pre-revenue development.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                        Legal & bureaucratic overhead
                      </h4>
                      <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                        Need incorporation, legal setup, bank accounts, and tax
                        compliance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#ffffff0d] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                  <h4 className="font-semibold text-slate-50 text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                    High-risk, monolithic efforts
                  </h4>
                  <p className="text-white text-xs sm:text-sm leading-4 sm:leading-5">
                    Require full-time dedication, co-founder alignment, and
                    investor trust.
                  </p>
                </div>
              </div>
            </div>

            {/* Smartjects Model */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] flex items-center justify-center bg-[#ffd800] rounded-xl lg:rounded-2xl flex-shrink-0">
                  <span className="text-black font-thin text-2xl sm:text-3xl lg:text-4xl pb-1">
                    +
                  </span>
                </div>
                <h3 className="font-semibold text-black text-base sm:text-lg leading-5 sm:leading-6">
                  Smartjects Model
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      No need for fundraising
                    </h4>
                    <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                      Enable individuals and teams to monetize implementation
                      expertise immediately by responding to existing demand.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                    <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                      No legal entity required
                    </h4>
                    <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                      Use smart contracts to formalize collaboration, making it
                      possible for any expert to work project-by-project without
                      overhead.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-[#eaeaea] p-4 sm:p-6 space-y-3 sm:space-y-4 lg:space-y-[25px]">
                  <h4 className="font-semibold text-black text-sm sm:text-base lg:text-lg leading-5 sm:leading-6">
                    Distributed collaboration over monolithic venture
                  </h4>
                  <p className="text-slate-900 text-xs sm:text-sm leading-4 sm:leading-5">
                    Allow modular contributions from individuals, small teams,
                    or companies who want to build without quitting their jobs
                    or taking massive risks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ComparisonSection.displayName = "ComparisonSection";
