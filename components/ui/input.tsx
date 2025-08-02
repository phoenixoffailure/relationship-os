import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with brand colors (no CSS variables)
          "flex h-10 w-full rounded-md border border-brand-light-gray bg-brand-cool-gray px-3 py-2 text-base text-brand-charcoal",
          // Focus states with brand colors
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/20 focus-visible:border-brand-teal",
          // Placeholder and disabled states
          "placeholder:text-brand-slate disabled:cursor-not-allowed disabled:opacity-50",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-brand-charcoal",
          // Responsive text sizing
          "md:text-sm",
          // Override any autofill yellow with !important equivalent
          "autofill:!bg-brand-cool-gray autofill:!text-brand-charcoal autofill:!border-brand-light-gray",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }