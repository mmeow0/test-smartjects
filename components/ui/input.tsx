import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.ComponentProps<"input"> {}

const Input = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, type = "text", placeholder, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="relative w-full">
        <input
          id={inputId}
          type={type}
          placeholder=" "
          className={cn(
            "peer block w-full appearance-none rounded-md border border-yellow-400 bg-background px-3 pt-3 pb-2 text-base text-foreground",
            "ring-offset-background focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2",
            "placeholder-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute left-2.5 top-0 -translate-y-1/2 bg-background px-1 text-sm text-muted-foreground transition-all
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground
            peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-yellow-500"
        >
          {placeholder}
        </label>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
