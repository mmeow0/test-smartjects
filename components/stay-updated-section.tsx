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
        <div className="z-10 flex flex-col gap-4 sm:gap-6 lg:gap-[30px] flex-1 text-center lg:text-left">
          <h2 className="font-normal text-slate-50 text-2xl sm:text-3xl md:text-4xl lg:text-[50px] tracking-tight lg:tracking-[-0.90px] leading-tight lg:leading-normal max-w-2xl lg:max-w-none">
            Stay updated
          </h2>
          <p className="font-normal text-white text-sm sm:text-base md:text-lg leading-6 md:leading-7 max-w-lg lg:max-w-xl">
            Subscribe to our newsletter for the latest AI research and smartject
            updates
          </p>
        </div>

        <div className="z-10 flex flex-col items-center lg:items-end gap-4 sm:gap-6 flex-1 w-full lg:w-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row lg:flex-col xl:flex-row w-full max-w-md lg:max-w-lg items-stretch sm:items-center gap-3 sm:gap-4"
          >
            {/* Email Input */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 pl-4 pr-3 py-3 sm:py-2 bg-white rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all h-12 sm:h-[52px]">
                <input
                  className="flex-1 border-none bg-transparent font-normal text-gray-600 text-sm sm:text-base leading-6 outline-none placeholder:text-gray-400"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex w-full sm:w-auto sm:flex-shrink-0 h-12 sm:h-[52px] items-center justify-center gap-1.5 px-6 sm:px-8 bg-yellow-400 rounded-xl hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-black text-sm sm:text-base font-medium leading-5 text-center whitespace-nowrap">
                Subscribe
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
