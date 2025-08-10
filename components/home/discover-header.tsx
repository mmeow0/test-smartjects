import { memo } from "react";

export const DiscoverHeader = memo(() => (
  <div className="flex flex-col items-start text-start space-y-4 sm:space-y-6 lg:space-y-8 w-full">
    {/* Main Title */}
    <div className="flex flex-col items-start gap-2 relative flex-1 grow">
      <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
        <div className="relative w-fit mt-[-1.00px] text-4xl font-semibold text-gray-900 whitespace-nowrap">
          Discover smartjects
        </div>
      </div>
      <div className="inline-flex items-center justify-center gap-2.5 pl-0.5 pr-0 py-0 relative flex-[0_0_auto]">
        <p className="relative max-w-7xl mt-[-1.00px] text-base font-normal text-gray-600">
          Explore innovations marketplace
        </p>
      </div>
    </div>
  </div>
));

DiscoverHeader.displayName = "DiscoverHeader";
