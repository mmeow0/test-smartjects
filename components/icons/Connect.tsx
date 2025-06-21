import clsx from "clsx";
import React from "react";

export function Connect(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;

  return (
    <svg
      viewBox="0 0 125 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-auto h-8 logo-svg", className)}
      {...rest}
    >
      <path
        d="M71.4489 125C41.8662 125 17.8974 101.012 17.8974 71.449C17.8974 41.8662 41.8861 17.8975 71.4489 17.8975C101.032 17.8975 125 41.8861 125 71.449C125 101.032 101.012 125 71.4489 125Z"
        fill="#FC4B36"
      />
      <path d="M71.4485 0H0V71.4485H71.4485V0Z" fill="#FFD900" />
      <path
        d="M71.4489 17.8779C41.8662 17.8779 17.8974 41.8666 17.8974 71.4294H71.4489V17.8779Z"
        fill="#F6F6F6"
      />
    </svg>
  );
}
