import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { formatCurrency, cn, formatDuration } from "@/src/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, TrendingDown, Target, Activity, 
  Zap, Award, AlertCircle, Clock, Smile, Tag, Loader2,
  Share2, Filter, Globe, Cpu, ChevronDown, X, Lock as LockIcon
} from "lucide-react";
import { useTrades } from "../trades/TradeContext";
import { useAuth } from "../auth/AuthContext";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { SelectionGroup } from "@/src/components/ui/SelectionGroup";
import { toPng } from "html-to-image";
import { AnimatePresence, motion } from "motion/react";
import { Paywall } from "@/src/components/Paywall";
import { MetricInfo } from "@/src/components/ui/MetricInfo";
import { PerformanceCharts } from "@/src/components/ui/PerformanceCharts";

export function Analytics() {
  const { allTrades, loading } = useTrades();
  const { profile } = useAuth();
  const [marketFilter, setMarketFilter] = React.useState("All");
  const [isSharing, setIsSharing] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [paywall, setPaywall] = React.useState<{ isOpen: boolean; feature: string; plan: 'PRO' | 'ELITE' }>({
    isOpen: false,
    feature: "",
    plan: 'PRO'
  });
  const shareCardRef = React.useRef<HTMLDivElement>(null);

  const isPro = profile?.plan === 'PRO' || profile?.plan === 'ELITE';
  const isElite = profile?.plan === 'ELITE';

  const checkAccess = (feature: string, plan: 'PRO' | 'ELITE' = 'PRO') => {
    if (plan === 'PRO' && !isPro) {
      setPaywall({ isOpen: true, feature, plan });
      return false;
    }
    if (plan === 'ELITE' && !isElite) {
      setPaywall({ isOpen: true, feature, plan });
      return false;
    }
    return true;
  };

  const stats = React.useMemo(() => {
    const trades = allTrades;
    if (!trades || trades.length === 0) {
      return {
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        maxDrawdown: 0,
        expectancy: 0,
        tradesPerDay: 0,
        winLossData: [],
        setupData: [],
        monthlyData: [],
        emotionData: []
      };
    }

    const filteredTrades = trades.filter(t => marketFilter === "All" || t.marketType === marketFilter);

    if (filteredTrades.length === 0) {
      return {
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        maxDrawdown: 0,
        expectancy: 0,
        tradesPerDay: 0,
        winLossData: [],
        setupData: [],
        monthlyData: [],
        emotionData: []
      };
    }

    const wins = filteredTrades.filter(t => t.status === 'Win');
    const losses = filteredTrades.filter(t => t.status === 'Loss');
    const totalTradesCount = filteredTrades.length;
    
    const totalGrossProfit = wins.reduce((sum, t) => sum + (t.netPL || 0), 0);
    const totalGrossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.netPL || 0), 0));
    const totalFees = filteredTrades.reduce((sum, t) => sum + (t.fees || 0), 0);
    const totalGainLoss = filteredTrades.reduce((sum, t) => sum + (t.netPL || 0), 0);
    
    const profitFactor = totalGrossLoss === 0 ? totalGrossProfit : totalGrossProfit / totalGrossLoss;
    const avgWin = wins.length === 0 ? 0 : totalGrossProfit / wins.length;
    const avgLoss = losses.length === 0 ? 0 : totalGrossLoss / losses.length;
    
    const winRate = totalTradesCount === 0 ? 0 : wins.length / totalTradesCount;
    const lossRate = 1 - winRate;
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);

    // Max Profit
    const maxProfit = totalTradesCount === 0 ? 0 : Math.max(...filteredTrades.map(t => t.netPL || 0));

    // Average Per Share Gain/Loss
    const avgPerSharePL = totalTradesCount === 0 ? 0 : filteredTrades.reduce((sum, t) => sum + ((t.netPL || 0) / (t.quantity || 1)), 0) / totalTradesCount;

    // Streaks
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;

    sortedTrades.forEach(t => {
      if (t.status === 'Win') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (t.status === 'Loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    // Hold Times
    const calculateHoldTime = (trade: typeof filteredTrades[0]) => {
      if (!trade.date || !trade.exitDate) return 0;
      const entryPath = trade.date.includes('T') ? trade.date : `${trade.date}T${trade.time || '00:00'}`;
      const exitPath = trade.exitDate.includes('T') ? trade.exitDate : `${trade.exitDate}T${trade.exitTime || '00:00'}`;
      const entryTs = new Date(entryPath).getTime();
      const exitTs = new Date(exitPath).getTime();
      return Math.max(0, exitTs - entryTs);
    };

    const totalHoldTime = filteredTrades.reduce((sum, t) => sum + calculateHoldTime(t), 0);
    const avgHoldTime = totalTradesCount === 0 ? 0 : totalHoldTime / totalTradesCount;

    const totalHoldTimeWins = wins.reduce((sum, t) => sum + calculateHoldTime(t), 0);
    const avgHoldTimeWins = wins.length === 0 ? 0 : totalHoldTimeWins / wins.length;

    const totalHoldTimeLosses = losses.reduce((sum, t) => sum + calculateHoldTime(t), 0);
    const avgHoldTimeLosses = losses.length === 0 ? 0 : totalHoldTimeLosses / losses.length;

    // Trades per day and Avg Daily P/L
    const datesSet = new Set(filteredTrades.map(t => t.date.split('T')[0]));
    const numTradingDays = Math.max(1, datesSet.size);
    const tradesPerDay = totalTradesCount / numTradingDays;
    const avgDailyPL = totalGainLoss / numTradingDays;

    // Win/Loss Distribution
    const winLossData = [
      { name: 'Wins', value: Math.round(winRate * 100), color: '#10b981' },
      { name: 'Losses', value: Math.round(lossRate * 100), color: '#ef4444' },
    ];

    // ... (keep setupData, monthlyData, emotionData unchanged)
    
    // Emotion Impact
    const emotionGroups = [
      { name: 'Calm / Confident', emotions: ['Calm', 'Confident'], color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: Smile },
      { name: 'Anxious / Fearful', emotions: ['Anxious', 'Fearful'], color: 'text-red-500', bg: 'bg-red-500/5', icon: AlertCircle },
      { name: 'Greedy / FOMO', emotions: ['Greedy'], color: 'text-amber-500', bg: 'bg-amber-500/5', icon: Zap },
    ];

    const emotionData = emotionGroups.map(group => {
      const groupTrades = filteredTrades.filter(t => group.emotions.includes(t.emotionAfter));
      const groupWins = groupTrades.filter(t => t.status === 'Win').length;
      const groupWinRate = groupTrades.length === 0 ? 0 : Math.round((groupWins / groupTrades.length) * 100);
      return { ...group, winRate: groupWinRate, count: groupTrades.length };
    });

    // Setup Performance
    const setupMap = filteredTrades.reduce((acc: any, t) => {
      if (!t.setupType) return acc;
      if (!acc[t.setupType]) acc[t.setupType] = { name: t.setupType, wins: 0, total: 0 };
      acc[t.setupType].total++;
      if (t.status === 'Win') acc[t.setupType].wins++;
      return acc;
    }, {});

    const setupData = Object.values(setupMap).map((s: any) => ({
      name: s.name,
      winRate: Math.round((s.wins / s.total) * 100),
      count: s.total
    })).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

    // Monthly Performance
    const monthlyMap = filteredTrades.reduce((acc: any, t) => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!acc[month]) acc[month] = { month, profit: 0 };
      acc[month].profit += (t.netPL || 0);
      return acc;
    }, {});

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months
      .filter(m => monthlyMap[m])
      .map(m => monthlyMap[m]);

    // Max Drawdown (simplified)
    let peak = 0;
    let maxDD = 0;
    let currentEquity = 0;
    
    sortedTrades.forEach(t => {
      currentEquity += (t.netPL || 0);
      if (currentEquity > peak) peak = currentEquity;
      const dd = peak === 0 ? 0 : (peak - currentEquity) / peak;
      if (dd > maxDD) maxDD = dd;
    });

    return {
      profitFactor,
      avgWin,
      avgLoss,
      maxDrawdown: maxDD * 100,
      expectancy,
      tradesPerDay,
      winLossData,
      setupData,
      monthlyData,
      emotionData,
      winRate: Math.round(winRate * 100),
      totalProfit: totalGainLoss,
      maxProfit,
      totalGainLoss,
      avgDailyPL,
      avgPerSharePL,
      totalTrades: totalTradesCount,
      numWins: wins.length,
      numLosses: losses.length,
      avgHoldTime,
      avgHoldTimeWins,
      avgHoldTimeLosses,
      maxWinStreak,
      maxLossStreak,
      totalFees
    };
  }, [allTrades, marketFilter]);

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);
    try {
      // Temporarily show the card for capture if needed, 
      // but html-to-image can capture hidden elements if they are in the DOM
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1080,
        backgroundColor: '#020617',
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'trading-analytics.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'My Trading Analytics',
          text: `Check out my trading performance! Win Rate: ${stats.winRate}%, Total Profit: ${formatCurrency(stats.totalProfit, currencyCode, true)}`,
          files: [file],
        });
      } else {
        // Fallback: download image
        const link = document.createElement('a');
        link.download = 'trading-analytics.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing analytics:', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const currencyCode = profile?.currency || 'USD';

  const renderMetricCard = (
    label: string, 
    value: string | number, 
    metricName?: string, 
    className: string = "", 
    accessFeature: string = ""
  ) => {
    const hasAccess = accessFeature ? checkAccess(accessFeature) : true;
    
    return (
      <Card className="p-5 border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[110px]">
        {!hasAccess && (
          <div 
            className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center cursor-pointer dark:bg-black/40"
            onClick={() => checkAccess(accessFeature)}
          >
            <LockIcon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest dark:text-gray-500">{label}</p>
          {metricName && <MetricInfo metricName={metricName} />}
        </div>
        <p className={cn("mt-2 text-xl font-black text-slate-900 dark:text-white truncate", className)}>
          {hasAccess ? value : "—"}
        </p>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      <div className="flex flex-col space-y-6 md:flex-row md:items-end md:justify-between md:space-y-0">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white uppercase">Analytics</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Deep dive into your trading performance and behavior.</p>
        </div>
        {/* ... (keep filter and share buttons) */}
        <div className="flex items-center space-x-3">
          {marketFilter !== "All" && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-4 py-1.5 rounded-full font-bold text-[10px] flex items-center uppercase tracking-wider">
              {marketFilter}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer hover:text-blue-800" 
                onClick={() => setMarketFilter("All")}
              />
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full h-11 w-11 border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all relative"
            onClick={() => checkAccess("Market Filters") && setIsFilterOpen(true)}
            title="Filter by Market"
          >
            <Filter className="h-4 w-4 text-slate-600 dark:text-gray-400" />
            {!isPro && <LockIcon className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full p-0.5 text-slate-400 border border-slate-100 shadow-sm" />}
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full px-6 h-11 font-bold border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all relative"
            onClick={() => checkAccess("Share Report") && handleShare()}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            Share Report
            {!isPro && <LockIcon className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full p-0.5 text-slate-400 border border-slate-100 shadow-sm" />}
          </Button>
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-slate-200 dark:border-gray-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Filter by Market</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)} className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <CustomSelect
                  label="Market Type"
                  options={[
                    { id: 'All', label: 'All Markets', icon: <Filter className="h-4 w-4" /> },
                    { id: 'Stocks', label: 'Stocks', icon: <TrendingUp className="h-4 w-4" /> },
                    { id: 'Options', label: 'Options', icon: <Zap className="h-4 w-4" /> },
                    { id: 'Futures', label: 'Futures', icon: <Activity className="h-4 w-4" /> },
                    { id: 'Forex', label: 'Forex', icon: <Globe className="h-4 w-4" /> },
                    { id: 'Crypto', label: 'Crypto', icon: <Cpu className="h-4 w-4" /> },
                  ]}
                  value={marketFilter}
                  onChange={(val: string) => {
                    setMarketFilter(val);
                    setIsFilterOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Share Card (Square 1080x1080) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '0', 
          zIndex: -100,
          pointerEvents: 'none'
        }}
      >
        <div 
          ref={shareCardRef}
          className="w-[1080px] h-[1080px] bg-slate-950 p-20 flex flex-col justify-between overflow-hidden relative"
        >
          {/* Background Accents */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-6xl font-black text-white tracking-tighter uppercase">Black Oak</h2>
                </div>
                <p className="text-2xl font-bold text-blue-400 uppercase tracking-[0.2em] ml-1">Performance Report</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3 rounded-full">
                <span className="text-xl font-black text-white uppercase tracking-widest">
                  {marketFilter === "All" ? "All Markets" : marketFilter}
                </span>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-2 gap-16">
              <div className="space-y-4">
                <p className="text-lg font-black text-slate-500 uppercase tracking-[0.4em]">Net Profit/Loss</p>
                <p className={cn("text-8xl font-black tracking-tighter", stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {formatCurrency(stats.totalProfit, currencyCode, true)}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-lg font-black text-slate-500 uppercase tracking-[0.4em]">Win Rate</p>
                <p className="text-8xl font-black text-white tracking-tighter">
                  {stats.winRate}%
                </p>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-3 gap-10">
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Profit Factor</p>
                <p className="mt-4 text-5xl font-black text-white">{stats.profitFactor.toFixed(2)}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Avg Win</p>
                <p className="mt-4 text-5xl font-black text-emerald-400">{formatCurrency(stats.avgWin, currencyCode, true)}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Avg Loss</p>
                <p className="mt-4 text-5xl font-black text-red-400">{formatCurrency(-stats.avgLoss, currencyCode, true)}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Expectancy</p>
                <p className="mt-4 text-5xl font-black text-blue-400">{formatCurrency(stats.expectancy, currencyCode, true)}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Trades/Day</p>
                <p className="mt-4 text-5xl font-black text-white">{stats.tradesPerDay.toFixed(1)}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Max Drawdown</p>
                <p className="mt-4 text-5xl font-black text-red-400">-{stats.maxDrawdown.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center pt-12 border-t border-white/10">
            <div>
              <p className="text-xl font-black text-white uppercase tracking-tight">Black Oak Journal</p>
              <p className="text-base text-slate-500">Professional Trading Analytics System</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generated on</p>
              <p className="text-lg font-black text-white">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Core Performance Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Profitability & Growth</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {renderMetricCard("Net P/L", formatCurrency(stats.totalGainLoss, currencyCode, true), "Realized PNL", stats.totalGainLoss >= 0 ? "text-emerald-500" : "text-red-500")}
            {renderMetricCard("Win Rate", `${stats.winRate}%`, "Winrate", "text-blue-500")}
            {renderMetricCard("Profit Factor", stats.profitFactor.toFixed(2), "Profit Factor", "", "Profit Factor")}
            {renderMetricCard("Max Profit", formatCurrency(stats.maxProfit, currencyCode, true), "Maximum Profit", "text-emerald-600 dark:text-emerald-400", "Profit Factor")}
            {renderMetricCard("Avg Win", formatCurrency(stats.avgWin, currencyCode, true), "Average Win", "text-emerald-500", "Average Win")}
            {renderMetricCard("Avg Loss", formatCurrency(-stats.avgLoss, currencyCode, true), "Average Loss", "text-red-500", "Average Loss")}
          </div>
        </div>

        {/* Efficiency Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Efficiency & Ratios</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {renderMetricCard("Expectancy", formatCurrency(stats.expectancy, currencyCode, true), "Expected Value", "text-blue-500", "Expectancy")}
            {renderMetricCard("Avg Daily P/L", formatCurrency(stats.avgDailyPL, currencyCode, true), "Daily PNL", stats.avgDailyPL >= 0 ? "text-emerald-500" : "text-red-500", "Expectancy")}
            {renderMetricCard("Avg Per Share", formatCurrency(stats.avgPerSharePL, currencyCode, true), "Average P/L per share", "", "Expectancy")}
            {renderMetricCard("Max Drawdown", `-${stats.maxDrawdown.toFixed(1)}%`, "Max Drawdown", "text-red-400", "Max Drawdown")}
            {renderMetricCard("Total Brokerage", formatCurrency(stats.totalFees, currencyCode, true), "Total Fees", "text-slate-500", "Profit Factor")}
            {renderMetricCard("Trades/Day", stats.tradesPerDay.toFixed(1), "Activity Level", "", "Trades Per Day")}
          </div>
        </div>

        {/* Activity & Streaks Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Activity & Streaks</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {renderMetricCard("Total Trades", stats.totalTrades, "Total Number of Trades")}
            {renderMetricCard("Winning Trades", stats.numWins, "Winning Count", "text-emerald-500")}
            {renderMetricCard("Losing Trades", stats.numLosses, "Losing Count", "text-red-500")}
            {renderMetricCard("Win Streak", stats.maxWinStreak, "Consecutive Wins", "text-emerald-500", "Expectancy")}
            {renderMetricCard("Loss Streak", stats.maxLossStreak, "Consecutive Losses", "text-red-500", "Expectancy")}
            {renderMetricCard("Avg Hold Time", formatDuration(stats.avgHoldTime), "Avg Hold Time", "", "Expectancy")}
          </div>
        </div>

        {/* Duration Deep Dive */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Hold Time Analysis</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-6 flex items-center justify-between border-slate-100 dark:border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Hold Time (Profitable)</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatDuration(stats.avgHoldTimeWins)}</p>
                </div>
              </div>
              <MetricInfo metricName="Hold Time Profit" />
            </Card>
            <Card className="p-6 flex items-center justify-between border-slate-100 dark:border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Hold Time (Losing)</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatDuration(stats.avgHoldTimeLosses)}</p>
                </div>
              </div>
              <MetricInfo metricName="Hold Time Loss" />
            </Card>
          </div>
        </div>

      {/* Performance Period Charts */}
      <Card className="p-6 border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        {!isPro && (
          <div 
            className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer dark:bg-black/40"
            onClick={() => checkAccess("Periodic Analysis")}
          >
            <LockIcon className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Upgrade to Pro</p>
          </div>
        )}
        <PerformanceCharts trades={allTrades} currencyCode={currencyCode} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {allTrades.length > 0 ? (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.winLossData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.winLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', 
                          border: `1px solid ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#e2e8f0'}`, 
                          borderRadius: '8px',
                          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex space-x-6">
                  {stats.winLossData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-500 dark:text-gray-400">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Setup Analysis */}
        <Card className="relative overflow-hidden">
          {!isPro && (
            <div 
              className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer dark:bg-black/40"
              onClick={() => checkAccess("Setup Performance")}
            >
              <LockIcon className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Upgrade to Pro</p>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-base">Setup Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.setupData.length > 0 ? stats.setupData.map((setup) => (
              <div key={setup.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{setup.name}</span>
                  <span className="text-slate-500 dark:text-gray-400">{setup.winRate}% Win Rate ({setup.count} trades)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-800">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      setup.winRate >= 60 ? "bg-emerald-500" : setup.winRate >= 50 ? "bg-blue-500" : "bg-red-500"
                    )} 
                    style={{ width: `${setup.winRate}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emotion Impact */}
        <Card className="relative overflow-hidden">
          {!isPro && (
            <div 
              className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer dark:bg-black/40"
              onClick={() => checkAccess("Emotion Analysis")}
            >
              <LockIcon className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Upgrade to Pro</p>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-base">Emotion Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allTrades.length > 0 ? stats.emotionData.map((item) => (
                <div key={item.name} className={cn("flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-gray-800", item.bg)}>
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn("h-5 w-5", item.color)} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className={cn("text-sm font-bold", item.color)}>{item.winRate}% Win Rate</span>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-500 text-sm">
                  No data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Paywall 
        isOpen={paywall.isOpen} 
        onClose={() => setPaywall({ ...paywall, isOpen: false })} 
        featureName={paywall.feature} 
        requiredPlan={paywall.plan} 
      />
    </div>
    </div>
  );
}
