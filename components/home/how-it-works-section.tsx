import { memo } from "react";
import Link from "next/link";
import { Discover } from "@/components/icons/Discover";
import { Connect } from "@/components/icons/Connect";
import { Execute } from "@/components/icons/Execute";

export const HowItWorksSection = memo(() => (
  <div className="flex flex-col items-center gap-12 sm:gap-16 lg:gap-20 pt-9 sm:pb-12 px-0">
    {/* Header Section */}
    <div className="flex flex-col items-center gap-4 sm:gap-5 text-center max-w-2xl mx-auto px-4">
      <h2 className="font-normal text-[#020817] text-3xl sm:text-4xl lg:text-[50px] leading-tight lg:leading-normal">
        How it works
      </h2>
      <p className="font-normal text-slate-500 text-sm sm:text-base leading-5 sm:leading-6 max-w-md">
        From research to implementation in three simple steps
      </p>
    </div>

    {/* Steps Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-[50px] w-full max-w-7xl mx-auto px-4">
      {/* Step 1: Discover */}
      <div className="flex flex-col items-center gap-4 sm:gap-5 text-center">
        <Discover className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[125px] lg:h-[125px]" />
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-[50px]">
          <h3 className="font-normal text-[#020817] text-2xl sm:text-3xl lg:text-[35px] leading-tight lg:leading-normal">
            Discover
          </h3>
          <p className="font-normal text-[#020817] text-sm sm:text-base leading-normal max-w-xs sm:max-w-sm lg:max-w-[309px]">
            Browse innovations transformed into potential implementation
            projects for business
          </p>
        </div>
      </div>

      {/* Step 2: Connect */}
      <div className="flex flex-col items-center gap-4 sm:gap-5 text-center">
        <Connect className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[125px] lg:h-[125px]" />
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-[50px]">
          <h3 className="font-normal text-[#020817] text-2xl sm:text-3xl lg:text-[35px] leading-tight lg:leading-normal">
            Connect
          </h3>
          <p className="font-normal text-[#020817] text-sm sm:text-base leading-normal max-w-xs sm:max-w-sm lg:max-w-[371px]">
            Participate in discussions, vote on smartjects, find partners, and
            help shape the future of innovations in business
          </p>
        </div>
      </div>

      {/* Step 3: Execute */}
      <div className="flex flex-col items-center gap-4 sm:gap-5 text-center">
        <Execute className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[125px] lg:h-[125px]" />
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-[50px]">
          <h3 className="font-normal text-[#020817] text-2xl sm:text-3xl lg:text-[35px] leading-tight lg:leading-normal">
            Execute
          </h3>
          <p className="font-normal text-[#020817] text-sm sm:text-base leading-normal max-w-xs sm:max-w-sm lg:max-w-[277px]">
            Create proposals, negotiate and agree with smart contracts
          </p>
        </div>
      </div>
    </div>

    {/* CTA Button */}
    <Link href="/how-it-works">
      <button className="flex w-full sm:w-[200px] h-[52px] items-center justify-center gap-1.5 p-1.5 bg-yellow-300 rounded-xl hover:bg-yellow-400 transition-colors max-w-xs mx-auto">
        <div className="inline-flex items-center">
          <div className="font-medium text-black text-sm text-center leading-5 whitespace-nowrap">
            Learn more
          </div>
        </div>
      </button>
    </Link>
  </div>
));

HowItWorksSection.displayName = "HowItWorksSection";
