import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles with proper colors
        "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base text-brand-charcoal",
        // Focus states with brand colors
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/20 focus-visible:border-brand-teal",
        // Placeholder and disabled states
        "placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
        // Responsive text sizing
        "md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }