import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Background
        "bg-dark-purple/50 file:bg-dark-purple/50",

        // Layout & Sizing
        "flex h-9 w-full min-w-0 rounded-md",

        // Border & Shadow
        "border border-english-violet/50 shadow-xs",

        // Spacing
        "px-3 py-1",

        // Typography
        "text-base text-white placeholder:text-white/40 md:text-sm",
        "file:inline-flex file:h-7 file:text-sm file:font-medium file:text-foreground",

        // File input specifics
        "file:border-0",

        // Transitions & Outline
        "transition-[color,box-shadow] outline-none",

        // Selection styles
        "selection:bg-primary selection:text-primary-foreground",

        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // Focus state
        "focus-visible:border-vibrant-purple focus-visible:ring-[3px] focus-visible:ring-vibrant-purple/20",
        "focus:border-vibrant-purple focus:ring-vibrant-purple/20",

        // ARIA invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        className
      )}
      {...props}
    />
  )
}

export { Input }
