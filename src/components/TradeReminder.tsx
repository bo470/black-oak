import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, PlusCircle, Bell } from "lucide-react";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function TradeReminder() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("trade-reminder-dismissed");
    if (!isDismissed) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("trade-reminder-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden w-full mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg shadow-blue-500/20">
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Session Finished?</h4>
                  <p className="text-xs text-blue-100">Don't forget to log your trades while they're fresh!</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link to="/add-trade">
                  <Button 
                    size="sm" 
                    className="h-8 bg-white text-blue-600 hover:bg-blue-50 text-[10px] font-bold px-3 rounded-full"
                    onClick={handleDismiss}
                  >
                    Log Now
                  </Button>
                </Link>
                <button 
                  onClick={handleDismiss}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
