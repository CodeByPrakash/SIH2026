import * as React from "react"
import { cn } from "cn"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { Progress }
