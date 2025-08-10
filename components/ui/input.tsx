import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode; // добавили проп
}

const Input = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, type = "text", placeholder, id, icon, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="relative w-full">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          {icon}
        </span>
      )}

        <input
          id={inputId}
          type={type}
          placeholder=" "
          className={cn(
            "peer block w-full appearance-none rounded-md border border-yellow-400 bg-background pt-3 pb-2 text-base text-foreground",
            icon ? "pl-10 pr-3" : "px-3", // если есть иконка — добавляем отступ слева
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
        className={cn(
          "absolute top-0 -translate-y-1/2 bg-background px-1 text-sm text-muted-foreground transition-all",
          icon ? "left-10" : "left-2.5", // если есть иконка — двигаем текст
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground",
          "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-yellow-500"
        )}
      >
        {placeholder}
      </label>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
