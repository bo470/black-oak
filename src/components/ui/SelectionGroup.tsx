import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectionGroupProps {
  options: SelectionOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SelectionGroup({ 
  options, 
  value, 
  onChange, 
  disabled = false, 
  columns = 2,
  className 
}: SelectionGroupProps) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-3",
      columns === 4 && "grid-cols-2 sm:grid-cols-4",
      className
    )}>
      {options.map((option) => {
        const selected = value === option.id;
        
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left group outline-none overflow-hidden",
              selected 
                ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center space-x-3 relative z-10">
              {option.icon && (
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-colors shrink-0",
                  selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {option.icon}
                </div>
              )}
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-bold transition-colors truncate",
                  selected ? "text-white" : "text-slate-900 dark:text-white"
                )}>
                  {option.label}
                </p>
                {option.description && (
                  <p className={cn(
                    "text-[10px] mt-0.5 truncate",
                    selected ? "text-blue-100" : "text-slate-500 dark:text-gray-500"
                  )}>
                    {option.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 relative z-10",
              selected 
                ? "border-white bg-white text-blue-600 scale-110" 
                : "border-slate-200 dark:border-gray-700"
            )}>
              {selected && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            {selected && (
              <motion.div 
                layoutId={`selection-bg-${option.id}`}
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
