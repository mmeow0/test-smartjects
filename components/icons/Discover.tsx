import clsx from "clsx";
import React from "react";

export function Discover(props: React.SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;

  return (
    <svg
      viewBox="0 0 126 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-auto h-8 logo-svg", className)}
      {...rest}
    >
      <path d="M62.5005 0H0V62.5005H62.5005V0Z" fill="#FC4B36" />
      <path
        d="M125.019 62.5005H62.5186V0C97.0325 0 125.019 27.9867 125.019 62.5005Z"
        fill="#FF7100"
      />
      <path
        d="M0 62.4995H62.5005V125C27.9867 125 0 97.0133 0 62.4995Z"
        fill="#FFD900"
      />
      <path
        d="M93.7684 110.396C102.962 110.396 110.415 102.943 110.415 93.7498C110.415 84.5564 102.962 77.1036 93.7684 77.1036C84.575 77.1036 77.1223 84.5564 77.1223 93.7498C77.1223 102.943 84.575 110.396 93.7684 110.396Z"
        fill="#FFBB85"
      />
    </svg>
  );
}
