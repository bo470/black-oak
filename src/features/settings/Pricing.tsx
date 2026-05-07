import * as React from "react";
import { motion } from "motion/react";
import { Check, Zap, Crown, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../auth/AuthContext";
import { UserPlan } from "@/src/types";

const PLANS = [
  {
    id: 'FREE' as UserPlan,
    name: 'Free',
    tagline: 'Perfect for getting started',
    price: '₹0',
    period: 'forever',
    features: [
      'Basic trade logging',
      'Max 50 trades per month',
      'Basic analytics (P/L, Win Rate)',
      'Simple equity curve',
      'Manual journal entry',
      '1 screenshot per trade',
      'Limited filters'
    ],
    buttonText: 'Current Plan',
    color: 'slate'
  },
  {
    id: 'PRO' as UserPlan,
    name: 'Pro',
    tagline: 'Advanced tools for serious traders',
    price: '₹199',
    period: 'per month',
    yearlyPrice: '₹999',
    popular: true,
    features: [
      'Everything in FREE',
      'Unlimited trades',
      'Advanced analytics (Expectancy, Drawdown)',
      'Advanced equity curve',
      'All filters (Market, Strategy)',
      'Unlimited trade screenshots',
      'Export data to CSV',
      'Professional trade sharing',
      'Custom R:R tracking',
      'No ads'
    ],
    buttonText: 'Upgrade to Pro',
    color: 'blue'
  },
  {
    id: 'ELITE' as UserPlan,
    name: 'Elite',
    tagline: 'The ultimate trading edge',
    price: '₹399',
    period: 'per month',
    yearlyPrice: '₹1499',
    features: [
      'Everything in PRO',
      'Broker integration (Coming Soon)',
      'Auto trade import',
      'AI-powered performance insights',
      'Mistake & strategy analysis',
      'Community boost (Featured posts)',
      'Priority multi-device sync',
      'Premium UI features'
    ],
    buttonText: 'Go Elite',
    color: 'amber'
  }
];

export function Pricing() {
  const { profile, updateProfile } = useAuth();
  const [isYearly, setIsYearly] = React.useState(false);
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [showPaymentSim, setShowPaymentSim] = React.useState<UserPlan | null>(null);

  const handleUpgrade = async (plan: UserPlan) => {
    if (plan === profile?.plan) return;
    
    setShowPaymentSim(plan);
  };

  const confirmPayment = async (plan: UserPlan) => {
    setLoadingPlan(plan);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await updateProfile({
        plan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiry: Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000
      });
      setShowPaymentSim(null);
    } catch (err) {
      console.error("Failed to upgrade plan:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-12 py-8">
      {/* Billing Toggle */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-full dark:bg-gray-800">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              !isYearly ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-white" : "text-slate-500"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center",
              isYearly ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-white" : "text-slate-500"
            )}
          >
            Yearly
            <span className="ml-2 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">Save 25%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = profile?.plan === plan.id;
          const displayPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;

          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 rounded-[32px] transition-all duration-300 border-2",
                plan.popular 
                  ? "border-blue-600 shadow-2xl shadow-blue-500/10 scale-105 z-10" 
                  : "border-slate-100 dark:border-gray-800",
                isCurrent && "ring-2 ring-emerald-500 ring-offset-4 dark:ring-offset-black"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">{displayPrice}</span>
                  <span className="ml-2 text-slate-500 dark:text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                </div>

                <Button
                  className={cn(
                    "w-full h-12 rounded-2xl font-bold text-base transition-all",
                    isCurrent 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : plan.popular 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200"
                  )}
                  disabled={isCurrent || loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isCurrent ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Current Plan
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>

                <div className="space-y-4 pt-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3 text-sm">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.color === 'blue' ? "bg-blue-500/10 text-blue-500" : 
                        plan.color === 'amber' ? "bg-amber-500/10 text-amber-500" : 
                        "bg-slate-500/10 text-slate-500"
                      )}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-slate-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentSim && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl dark:bg-gray-950"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Secure Checkout</h3>
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">Selected Plan</span>
                  <Badge variant="secondary">{showPaymentSim}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {isYearly && PLANS.find(p => p.id === showPaymentSim)?.yearlyPrice 
                      ? PLANS.find(p => p.id === showPaymentSim)?.yearlyPrice 
                      : PLANS.find(p => p.id === showPaymentSim)?.price}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-4">
                  {['UPI', 'Card', 'Net Banking', 'Wallet'].map(method => (
                    <button 
                      key={method}
                      className="p-4 border border-slate-200 rounded-2xl text-sm font-bold hover:border-blue-500 hover:bg-blue-50 transition-all dark:border-gray-800 dark:hover:bg-blue-900/10 dark:text-gray-300"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setShowPaymentSim(null)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-bold"
                  onClick={() => confirmPayment(showPaymentSim)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay Now"}
                </Button>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                This is a simulated payment flow for preview purposes. No real money will be charged.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
