import clsx from "clsx";
import React from "react";

export function Audience(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;

  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-auto h-8 logo-svg", className)}
      {...rest}
    >
      <g clipPath="url(#clip0_775_2092)">
        <path
          d="M18.0004 7.1468V16.3277C18.0004 16.6705 17.9022 16.9799 17.7386 17.2392C17.444 17.699 16.945 18 16.3641 18H1.63684C1.06412 18 0.548689 17.6907 0.27052 17.2308C0.0986916 16.9716 0.000488281 16.6622 0.000488281 16.3277V7.14686C0.000488281 7.01318 0.0168752 6.87933 0.0413989 6.74553C0.139656 6.36933 0.35234 6.02644 0.671418 5.79234L8.1496 0.315677C8.72232 -0.110765 9.49959 -0.102394 10.0723 0.324048L17.3214 5.79234C17.6405 6.02649 17.8614 6.36933 17.9514 6.74553C17.9841 6.87927 18.0004 7.01306 18.0004 7.1468Z"
          fill="#FFB48C"
        />
        <path
          d="M17.7381 17.239C17.4435 17.6988 16.9445 17.9999 16.3636 17.9999H1.63634C1.06362 17.9999 0.548189 17.6906 0.27002 17.2307L7.20819 12.0716L7.98546 11.4947C8.5909 11.0516 9.40089 11.0516 10.0064 11.4947L10.7836 12.0716L17.7381 17.239Z"
          fill="#FFFCCC"
        />
        <path
          d="M7.2082 12.0718L0.270031 17.2309C0.0982033 16.9716 0 16.6623 0 16.3278V7.14693C0 7.01325 0.0163836 6.8794 0.0409073 6.74561L7.2082 12.0718Z"
          fill="#FEF1AB"
        />
        <path
          d="M18.0001 7.14693V16.3278C18.0001 16.6706 17.9019 16.98 17.7383 17.2393L10.7837 12.0718L17.951 6.74561C17.9838 6.8794 18.0001 7.01319 18.0001 7.14693Z"
          fill="#FEF1AB"
        />
      </g>
      <defs>
        <clipPath id="clip0_775_2092">
          <rect width="18.0004" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
