import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { 
  TrendingUp, TrendingDown, Target, Activity, 
  Zap, Award, AlertCircle, Clock, Smile, Tag,
  Lightbulb, ArrowRight, Loader2
} from "lucide-react";
import { useTrades } from "../trades/TradeContext";

import { Trade } from "@/src/types";

export function SmartInsights({ trades: providedTrades, loading: providedLoading }: { trades?: Trade[], loading?: boolean }) {
  const { trades: contextTrades, loading: contextLoading } = useTrades();
  
  const trades = providedTrades || contextTrades;
  const loading = providedLoading !== undefined ? providedLoading : contextLoading;

  const insights = React.useMemo(() => {
    if (trades.length < 5) return [
      { 
        id: '0', 
        title: 'Need More Data', 
        description: 'Log at least 5 trades to unlock AI-powered smart insights and behavioral analysis.',
        icon: Lightbulb,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      }
    ];

    const wins = trades.filter(t => t.status === 'Win');
    const losses = trades.filter(t => t.status === 'Loss');
    
    // Simple setup analysis
    const setups = trades.reduce((acc: any, t) => {
      if (!t.setupType) return acc;
      if (!acc[t.setupType]) acc[t.setupType] = { wins: 0, total: 0 };
      acc[t.setupType].total++;
      if (t.status === 'Win') acc[t.setupType].wins++;
      return acc;
    }, {});

    const bestSetup = Object.entries(setups).sort((a: any, b: any) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];

    const dynamicInsights = [];

    if (bestSetup) {
      dynamicInsights.push({
        id: 'setup',
        title: 'Setup Identification',
        description: `The "${bestSetup[0]}" setup is your most profitable strategy, with a ${((bestSetup[1] as any).wins / (bestSetup[1] as any).total * 100).toFixed(0)}% win rate.`,
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
      });
    }

    // Confidence analysis
    const highConf = trades.filter(t => t.confidence >= 8);
    if (highConf.length > 0) {
      const highConfWinRate = (highConf.filter(t => t.status === 'Win').length / highConf.length) * 100;
      dynamicInsights.push({
        id: 'psych',
        title: 'Psychology Insight',
        description: `Trades entered with "High Confidence" have a ${highConfWinRate.toFixed(0)}% win rate. Trust your intuition more.`,
        icon: Smile,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
      });
    }

    // Risk analysis
    const stopLossViolations = trades.filter(t => t.notes?.toLowerCase().includes('stop loss') || t.notes?.toLowerCase().includes('ignored'));
    if (stopLossViolations.length > 0) {
      dynamicInsights.push({
        id: 'risk',
        title: 'Discipline Alert',
        description: `You've mentioned stop-loss issues in ${stopLossViolations.length} trades. Stick to your exit plan to preserve capital.`,
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10'
      });
    }

    return dynamicInsights;
  }, [trades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center dark:bg-blue-600/20">
          <Lightbulb className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Insights</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold dark:text-gray-500">AI-Powered Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="group hover:border-blue-500 transition-all cursor-pointer dark:hover:border-blue-500/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", insight.bg, "bg-opacity-20 dark:bg-opacity-10")}>
                  <insight.icon className={cn("h-5 w-5", insight.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{insight.title}</h3>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors dark:text-gray-700" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed dark:text-gray-400">
                    {insight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
