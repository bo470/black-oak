import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { createPortal } from "react-dom";
import { Modal } from "./Modal";

interface Option {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  label?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className,
  triggerClassName,
  label,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  const toggleOpen = () => {
    if (disabled) return;
    
    if (triggerRef.current && !isMobile) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const [showLockedHint, setShowLockedHint] = React.useState(false);
  const handleDisabledClick = () => {
    if (disabled) {
      setShowLockedHint(true);
      setTimeout(() => setShowLockedHint(false), 2000);
    }
  };

  const renderOptions = () => (
    <div className="space-y-1">
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              onChange(option.id);
              setIsOpen(false);
            }}
            className={cn(
              "group relative flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all md:py-2.5 md:px-3",
              isSelected 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            )}
          >
            <div className="flex items-center space-x-3">
              {option.icon && (
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg md:h-5 md:w-5",
                  isSelected ? "text-blue-600" : "text-slate-400 dark:text-gray-500"
                )}>
                  {option.icon}
                </span>
              )}
              <span className="text-base md:text-sm">{option.label}</span>
            </div>
            {isSelected && (
              <motion.div
                layoutId="active-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white md:h-5 md:w-5"
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-gray-500">
            {label}
          </label>
          <AnimatePresence>
            {showLockedHint && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-500"
              >
                Tap Edit to change
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
      <div className="relative">
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          onClick={toggleOpen}
          onPointerDown={handleDisabledClick}
          disabled={disabled}
          className={cn(
            "flex h-12 md:h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800/50",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-gray-800/30",
            triggerClassName
          )}
        >
          <div className="flex items-center space-x-2 truncate">
            {selectedOption?.icon}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          {!disabled && (
            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
          )}
        </Button>

        {isMobile ? (
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={label || placeholder}
            type="bottom-sheet"
          >
            {renderOptions()}
          </Modal>
        ) : (
          typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 9999,
                  }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {renderOptions()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        )}
      </div>
    </div>
  );
}
