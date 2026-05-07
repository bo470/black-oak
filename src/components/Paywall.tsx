import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Check, Zap, Crown, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: 'PRO' | 'ELITE';
}

export function Paywall({ isOpen, onClose, featureName, requiredPlan }: PaywallProps) {
  const navigate = useNavigate();

  const benefits = requiredPlan === 'PRO' 
    ? [
        "Unlimited trade logging",
        "Advanced performance analytics",
        "Export data to CSV",
        "Share trades with professional cards",
        "Advanced market & strategy filters"
      ]
    : [
        "Everything in PRO",
        "AI-powered trade insights",
        "Broker integration (Coming Soon)",
        "Auto-trade import",
        "Premium UI & featured posts"
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-gray-950"
          >
            <div className="relative p-8">
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className={cn(
                  "h-20 w-20 rounded-3xl flex items-center justify-center rotate-12 shadow-xl",
                  requiredPlan === 'PRO' ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                )}>
                  {requiredPlan === 'PRO' ? <Zap className="h-10 w-10" /> : <Crown className="h-10 w-10" />}
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Unlock {featureName}
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400">
                    Upgrade to <span className={cn("font-bold", requiredPlan === 'PRO' ? "text-blue-600" : "text-amber-500")}>{requiredPlan}</span> to access this feature and more.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-3 text-sm text-slate-600 dark:text-gray-300">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col w-full space-y-3 pt-6">
                  <Button 
                    className={cn(
                      "h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20",
                      requiredPlan === 'PRO' ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-500 hover:bg-amber-600"
                    )}
                    onClick={() => {
                      onClose();
                      navigate('/settings?tab=pricing');
                    }}
                  >
                    Upgrade Now
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
