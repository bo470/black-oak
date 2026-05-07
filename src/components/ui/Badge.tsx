import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "danger" | "warning";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-600/20",
    secondary: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    outline: "border-slate-200 text-slate-500 dark:border-gray-700 dark:text-gray-400",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-600/10 dark:text-emerald-400 dark:border-emerald-600/20",
    danger: "bg-red-50 text-red-600 border-red-200 dark:bg-red-600/10 dark:text-red-400 dark:border-red-600/20",
    warning: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-600/10 dark:text-amber-400 dark:border-amber-600/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
