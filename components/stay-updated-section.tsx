"use client";

import React, { useState } from "react";

export function StayUpdatedSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <div className="flex flex-col items-start gap-2.5 px-4 md:px-[50px] py-0 relative">
      <div className="flex flex-col lg:flex-row min-h-[347px] lg:h-[347px] items-center gap-8 lg:gap-[70px] p-8 md:p-16 lg:p-[100px] relative self-stretch w-full rounded-[25px] lg:rounded-[50px] overflow-hidden">
        {/* Custom Background Image and Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[25px] lg:rounded-[50px]">
          <div className="relative w-full h-full">
            {/* Background Image */}
            <img
              className="absolute inset-0 w-full h-full object-cover object-top"
              alt="Background"
              src="/images/landing-background.png"
            />

            {/* Color Overlay */}
            <div className="absolute inset-0 bg-[#ffa357] mix-blend-color" />

            {/* Soft Light Overlay */}
            <div className="absolute inset-0 bg-black mix-blend-soft-light" />
          </div>
        </div>

        {/* Content */}
        <div className="z-10 items-start gap-6 lg:gap-[30px] flex flex-col relative flex-1 grow text-center lg:text-left">
          <div className="relative w-full lg:w-[660px] font-normal text-slate-50 text-3xl md:text-4xl lg:text-[50px] tracking-[-0.90px] leading-tight lg:leading-normal">
            Stay updated
          </div>
          <p className="relative w-full lg:w-[593px] font-normal text-white text-base md:text-lg leading-6 md:leading-7">
            Subscribe to our newsletter for the latest AI research and smartject
            updates
          </p>
        </div>

        <div className="z-10 items-center lg:items-end gap-3 flex flex-col relative flex-1 grow w-full lg:w-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-[454px] items-start gap-3"
          >
            <div className="flex flex-col w-full h-[52px] items-start justify-center gap-1 relative">
              <div className="items-center w-full flex gap-2 relative self-stretch">
                <div className="flex-col items-start flex-1 grow flex gap-2 relative self-stretch">
                  <div className="flex h-[52px] items-start gap-2 relative self-stretch w-full">
                    <div className="flex items-center gap-2.5 pl-4 pr-2 py-2 relative flex-1 self-stretch grow bg-white rounded-xl border border-solid border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all">
                      <div className="flex flex-col items-start justify-center relative flex-1 grow">
                        <input
                          className="inline-flex h-5 items-center border-none bg-transparent font-normal text-gray-600 text-base leading-6 p-0 w-full outline-none placeholder:text-gray-400"
                          placeholder="Enter your email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full sm:w-[200px] h-[52px] items-center justify-center gap-1.5 p-1.5 bg-yellow-400 rounded-xl hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="inline-flex items-center">
                <div className="text-black text-sm font-medium leading-5 text-center">
                  Subscribe
                </div>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
