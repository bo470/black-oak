import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  showClose?: boolean;
  type?: "default" | "bottom-sheet";
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  showClose = true,
  type = "default"
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={type === "bottom-sheet" ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={type === "bottom-sheet" ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={type === "bottom-sheet" ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "pointer-events-auto bg-white dark:bg-gray-900 shadow-2xl relative flex flex-col w-full",
                type === "bottom-sheet" 
                  ? "mt-auto rounded-t-[2.5rem] max-h-[90vh]" 
                  : "rounded-[2.5rem] max-w-lg",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle for bottom sheet */}
              {type === "bottom-sheet" && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-gray-800" />
                </div>
              )}

              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-gray-800">
                {title && (
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {title}
                  </h3>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500 dark:text-gray-400" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
