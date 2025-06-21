import Link from "next/link";
import React from "react";

export function HeroSection() {
  return (
    <div className="relative w-full h-[822px] bg-[#060000] rounded-[0px_0px_50px_50px] overflow-hidden pt-20">
      <div className="w-[2421px] top-[-150px] left-[-490px] relative h-[1298px]">
        <div className="absolute w-[2421px] h-[1298px] top-0 left-0">
          <div className="relative h-[1298px]">
            {/* Background Image */}
            <img
              className="absolute w-[2421px] h-[1005px] -top-16 left-0 object-cover"
              alt="Background"
              src="/images/landing-background.png"
            />

            {/* Color Overlay */}
            <div className="bg-[#ffa357] mix-blend-color absolute w-[1932px] h-[1298px] top-0 left-[388px]" />

            {/* Soft Light Overlay */}
            <div className="bg-black mix-blend-soft-light absolute w-[1932px] h-[1298px] top-0 left-[388px]" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-[600px] items-start gap-[60px] absolute top-[520px] left-[556px]">
          <p className="relative self-stretch mt-[-1.00px] font-normal text-white text-6xl tracking-[0] leading-[65px]">
            <span className="font-archivo font-normal text-white text-6xl tracking-[0] leading-[65px]">
              Innovations direct <br />
              delivery&nbsp;&nbsp;
            </span>

            <span className="font-dynalight text-[90px]">
              from research
            </span>

            <span className="text-[90px]">
              {" "}
              <br />
            </span>

            <span className="font-archivo font-normal text-white text-6xl tracking-[0] leading-[65px]">
              to business
            </span>
          </p>

          {/* Action Buttons */}
          <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
            <Link href="/discover" className="all-[unset] box-border flex w-[200px] h-[52px] items-center justify-center gap-1.5 p-1.5 relative bg-[#FFD900] rounded-xl hover:bg-[#e6c300] transition-colors cursor-pointer">
              <div className="inline-flex items-center relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-sans font-medium text-black text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
                  Explore Smartjects
                </div>
              </div>
            </Link>

            <Link href="/auth/register" className="all-[unset] box-border flex w-[200px] items-center justify-center gap-3 p-1.5 relative self-stretch bg-[#1b1b1b] rounded-xl hover:bg-[#2a2a2a] transition-colors cursor-pointer">
              <div className="inline-flex items-center relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-sans font-medium text-[#f6f6f6] text-sm text-center tracking-[0] leading-4 whitespace-nowrap">
                  Join the Platform
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Side Description */}
        <p className="absolute w-[525px] h-[175px] top-[320px] left-[1355px] font-archivo font-normal text-white text-[25px] text-right tracking-[0] leading-[35px]">
          smartjects platform transforms research insights into defined
          potential implementation projects and provides interactive environment
          where users can vote, comment, and enter into smart contracts for
          projects execution
        </p>
      </div>
    </div>
  );
}