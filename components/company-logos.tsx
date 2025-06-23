export function CompanyLogos() {
  return (
    <div className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-[100px]">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-[50px]">
          <p className="font-normal text-[#A0A0A0] text-sm sm:text-base leading-5">
            Trusted by innovative companies and research institutions
          </p>
        </div>

        {/* Company Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 lg:gap-20 items-center justify-items-center">
          {/* Amway */}
          <div className="flex items-center justify-center w-full h-12 sm:h-14 lg:h-[60px]">
            <img
              className="max-h-full max-w-full object-contain"
              alt="Amway"
              src="/images/Amway.png"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
              }}
            />
          </div>

          {/* Saint-Gobain */}
          <div className="flex items-center justify-center w-full h-12 sm:h-14 lg:h-[60px]">
            <img
              className="max-h-full max-w-full object-contain"
              alt="Saint-Gobain"
              src="/images/sgobain.png"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
              }}
            />
          </div>

          {/* Kimberly */}
          <div className="flex items-center justify-center w-full h-12 sm:h-14 lg:h-[60px]">
            <img
              className="max-h-full max-w-full object-contain"
              alt="Kimberly"
              src="/images/Kimberly.png"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
              }}
            />
          </div>

          {/* Stada */}
          <div className="flex items-center justify-center w-full h-12 sm:h-14 lg:h-[60px]">
            <img
              className="max-h-full max-w-full object-contain"
              alt="Stada"
              src="/images/stada.png"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
