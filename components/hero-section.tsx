import Link from "next/link";
import React from "react";

export function HeroSection() {
  return (
    <div className="relative w-full min-h-[600px] md:min-h-[700px] lg:min-h-[822px] bg-[#060000] rounded-[0px_0px_25px_25px] md:rounded-[0px_0px_50px_50px] overflow-hidden">
      {/* Background Image and Overlays */}
      <div className="absolute inset-0 overflow-hidden -top-60">
        <div className="relative w-full h-full">
          {/* Background Image */}
          <img
            className="absolute inset-0 w-full h-full object-cover object-center"
            alt="Background"
            src="/images/landing-background.png"
          />

          {/* Color Overlay */}
          <div className="absolute inset-0 bg-[#ffa357] mix-blend-color" />

          {/* Soft Light Overlay */}
          <div className="absolute inset-0 bg-black mix-blend-soft-light" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-3 gap-8 lg:gap-12">
          {/* Mobile Layout - Stack vertically */}
          <div className="lg:hidden flex flex-col space-y-8 md:space-y-12 text-center justify-center min-h-full">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-white leading-tight">
                <span className="block font-archivo font-normal text-3xl sm:text-4xl md:text-5xl">
                  Innovations direct
                </span>

                <span className="inline-flex items-end gap-2">
                  <span className="font-archivo font-normal text-3xl sm:text-4xl md:text-5xl">
                    delivery:&nbsp;&nbsp;
                  </span>
                  <span className="font-dynalight text-4xl sm:text-5xl md:text-6xl text-white leading-none">
                    from research
                  </span>
                </span>

                <span className="block font-archivo font-normal text-3xl sm:text-4xl md:text-5xl mt-2">
                  to business
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="max-w-md mx-auto">
              <p className="font-archivo font-normal text-white text-lg sm:text-xl leading-relaxed text-center">
                smartjects platform transforms research insights into business
                projects and provides interactive environment where companies
                discover innovations and execute smart contracts
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link
                href="/discover"
                className="w-full sm:w-[200px] h-[52px] flex items-center justify-center gap-1.5 p-1.5 bg-[#FFD900] rounded-xl hover:bg-[#e6c300] transition-colors text-black font-medium text-sm whitespace-nowrap"
              >
                Explore Smartjects
              </Link>

              <Link
                href="/auth/register"
                className="w-full sm:w-[200px] h-[52px] flex items-center justify-center gap-1.5 p-1.5 bg-[#1b1b1b] rounded-xl hover:bg-[#2a2a2a] transition-colors text-[#f6f6f6] font-medium text-sm whitespace-nowrap"
              >
                Join the Platform
              </Link>
            </div>
          </div>

          {/* Desktop Layout - Grid positioning */}
          {/* Side Description - Top Right */}
          <div className="hidden lg:flex lg:col-span-8 lg:col-start-8 lg:row-span-2 lg:row-start-1 items-start justify-end pt-16">
            <div className="max-w-xl xl:max-w-2xl">
              <p className="font-archivo font-normal text-white text-xl lg:text-2xl xl:text-[25px] leading-relaxed xl:leading-[35px] text-right">
                smartjects platform transforms research insights into business
                projects and provides interactive environment where companies
                discover innovations and execute smart contracts
              </p>
            </div>
          </div>

          {/* Main Content - Bottom Left */}
          <div className="hidden lg:flex lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-2 flex-col justify-center space-y-12 pt-28">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-white leading-tight">
                <span className="block font-archivo font-normal text-5xl xl:text-6xl whitespace-nowrap">
                  Innovations direct delivery:&nbsp;&nbsp;
                </span>

                <div className=" pl-4">
                  <span className="whitespace-nowrap inline-flex items-end gap-4">
                    <span className="font-dynalight text-7xl xl:text-[90px] text-white leading-none whitespace-nowrap">
                      from research
                    </span>
                    <span className="font-archivo font-normal text-5xl xl:text-6xl text-white whitespace-nowrap pb-3">
                      to business
                    </span>
                  </span>
                </div>
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-5">
              <Link
                href="/discover"
                className="w-[200px] h-[52px] flex items-center justify-center gap-1.5 p-1.5 bg-[#FFD900] rounded-xl hover:bg-[#e6c300] transition-colors text-black font-medium text-sm whitespace-nowrap"
              >
                Explore Smartjects
              </Link>

              <Link
                href="/auth/register"
                className="w-[200px] h-[52px] flex items-center justify-center gap-1.5 p-1.5 bg-[#1b1b1b] rounded-xl hover:bg-[#2a2a2a] transition-colors text-[#f6f6f6] font-medium text-sm whitespace-nowrap"
              >
                Join the Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
