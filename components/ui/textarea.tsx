import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles with brand colors (no CSS variables)
        "flex min-h-[80px] w-full rounded-md border border-brand-light-gray bg-brand-cool-gray px-3 py-2 text-base text-brand-charcoal",
        // Focus states with brand colors
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/20 focus-visible:border-brand-teal",
        // Placeholder and disabled states
        "placeholder:text-brand-slate disabled:cursor-not-allowed disabled:opacity-50",
        // Responsive text sizing
        "md:text-sm",
        // Override any autofill yellow
        "autofill:!bg-brand-cool-gray autofill:!text-brand-charcoal autofill:!border-brand-light-gray",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }