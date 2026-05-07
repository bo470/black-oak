import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { TRADER_TYPES, MARKET_TYPES, EXPERIENCE_LEVELS, USER_GOALS } from "@/src/constants";
import { cn } from "@/src/lib/utils";
import { Check, ChevronRight, ChevronLeft, Rocket, Target, Zap, Shield } from "lucide-react";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "../auth/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export function Onboarding() {
  const [step, setStep] = React.useState(0);
  const [traderTypes, setTraderTypes] = React.useState<string[]>([]);
  const [marketPreferences, setMarketPreferences] = React.useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = React.useState("");
  const [goals, setGoals] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const path = `users/${user.uid}`;
    try {
      // Use setDoc with merge: true to handle the case where the document might not exist
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email || "",
        firstName: user.displayName?.split(' ')[0] || "",
        lastName: user.displayName?.split(' ').slice(1).join(' ') || "",
        fullName: user.displayName || "",
        photoURL: user.photoURL || "",
        traderTypes,
        marketPreferences,
        experienceLevel,
        goals,
        onboardingCompleted: true,
        // Ensure defaults if creation happens here
        plan: "FREE",
        subscriptionStatus: "active",
        createdAt: Date.now(),
      }, { merge: true });
      navigate("/");
    } catch (err) {
      console.error("Onboarding failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch (formattedErr: any) {
        setError(formattedErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Welcome to Black Oak",
      description: "Let's personalize your trading journal experience.",
      icon: <Rocket className="h-12 w-12 text-blue-500" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-slate-500 dark:text-gray-400">
            Black Oak is designed for serious traders who want to achieve consistency through data-driven insights.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left mt-8">
            <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <Target className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-gray-300">Track every detail of your trades</span>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <Zap className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-slate-600 dark:text-gray-300">Identify profitable patterns automatically</span>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-slate-600 dark:text-gray-300">Master your trading psychology</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What type of trader are you?",
      description: "Select all that apply to you.",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {TRADER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleItem(traderTypes, setTraderTypes, type)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                traderTypes.includes(type)
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-700"
              )}
            >
              <span className="font-medium">{type}</span>
              {traderTypes.includes(type) && <Check className="h-5 w-5 text-blue-500" />}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Which markets do you trade?",
      description: "Select your preferences.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {MARKET_TYPES.map((market) => (
            <button
              key={market}
              onClick={() => toggleItem(marketPreferences, setMarketPreferences, market)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-6 text-center transition-all",
                marketPreferences.includes(market)
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-700"
              )}
            >
              <span className="font-medium">{market}</span>
              {marketPreferences.includes(market) && (
                <div className="mt-2 rounded-full bg-blue-500 p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Experience Level",
      description: "How long have you been trading?",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                experienceLevel === level
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-700"
              )}
            >
              <span className="font-medium">{level}</span>
              {experienceLevel === level && <Check className="h-5 w-5 text-blue-500" />}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What are your goals?",
      description: "Select all that apply to you.",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {USER_GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleItem(goals, setGoals, goal)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                goals.includes(goal)
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-700"
              )}
            >
              <span className="font-medium">{goal}</span>
              {goals.includes(goal) && <Check className="h-5 w-5 text-blue-500" />}
            </button>
          ))}
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-black">
      <div className="w-full max-w-lg space-y-8">
        {step > 0 && (
          <div className="flex gap-2">
            {steps.slice(1).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  i + 1 <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-800"
                )}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-slate-200 bg-white/50 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  {currentStep.icon && <div className="flex justify-center mb-6">{currentStep.icon}</div>}
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">{currentStep.title}</h2>
                  <p className="text-slate-500 dark:text-gray-400">{currentStep.description}</p>
                </div>

                {currentStep.content}

                {error && (
                  <div className="mt-4 rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                    <p className="text-sm font-medium text-red-500">{error}</p>
                    <p className="text-xs text-red-400 mt-1">This error has been logged for diagnosis.</p>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 0 || loading}
                    className={cn(step === 0 && "invisible")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  {step === steps.length - 1 ? (
                    <Button 
                      onClick={handleComplete} 
                      disabled={goals.length === 0 || loading}
                      className="px-8"
                    >
                      {loading ? "Setting up..." : "Get Started"}
                      {!loading && <Rocket className="ml-2 h-4 w-4" />}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setStep(step + 1)} 
                      disabled={
                        (step === 1 && traderTypes.length === 0) ||
                        (step === 2 && marketPreferences.length === 0) ||
                        (step === 3 && !experienceLevel)
                      }
                      className="px-8"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
