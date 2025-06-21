export function CompanyLogos() {
  return (
    <div className="flex flex-col items-start gap-[50px] px-0 py-[100px] relative border-t [border-top-style:solid] border-slate-200 bg-white">
      <div className="flex-col items-center flex relative self-stretch w-full flex-[0_0_auto]">
        <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#A0A0A0] text-base text-center tracking-[0] leading-5">
          Trusted by innovative companies and research institutions
        </p>
      </div>

      <div className="flex-wrap items-center justify-center gap-[0px_80px] flex relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative w-[171px] h-[60px] flex items-center justify-center">
          <img
            className="max-h-[60px] max-w-[171px] object-contain brightness-0 opacity-60"
            alt="Amway"
            src="/images/Amway.png"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
            }}
          />
        </div>

        <div className="relative w-[171px] h-[60px] flex items-center justify-center">
          <img
            className="max-h-[60px] max-w-[171px] object-contain"
            alt="Saint-Gobain"
            src="/images/sgobain.png"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
            }}
          />
        </div>

        <div className="relative w-[171px] h-[60px] flex items-center justify-center">
          <img
            className="max-h-[60px] max-w-[171px] object-contain"
            alt="Kimberly"
            src="/images/Kimberly.png"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(63%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(96%) contrast(89%)",
            }}
          />
        </div>

        <div className="relative w-[171px] h-[60px] flex items-center justify-center">
          <img
            className="max-h-[60px] max-w-[171px] object-contain"
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
  );
}
