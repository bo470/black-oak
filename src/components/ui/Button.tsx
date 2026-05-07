import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:active:bg-gray-600",
      outline: "border border-slate-200 text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700",
      ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:active:bg-gray-700",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
