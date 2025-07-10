import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingLabelTextareaProps
  extends React.ComponentProps<"textarea"> {}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(({ className, placeholder, id, ...props }, ref) => {
  const textareaId = id || React.useId();

  return (
    <div className="relative w-full">
      <textarea
        id={textareaId}
        placeholder=" "
        className={cn(
          "peer block w-full min-h-[80px] appearance-none rounded-md border border-yellow-400 bg-background px-3 pt-6 pb-2 text-base text-foreground",
          "placeholder-transparent ring-offset-background focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
      <label
        htmlFor={textareaId}
        className="absolute left-2.5 top-0 -translate-y-1/2 bg-background px-1 text-sm text-muted-foreground transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground
          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-yellow-500"
      >
        {placeholder}
      </label>
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
