import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { formatCurrency, cn, getCurrencySymbol, formatRR } from "@/src/lib/utils";
import { MOTIVATIONAL_QUOTES } from "@/src/constants";
import { 
  TrendingUp, TrendingDown, Activity, Target, 
  Zap, Award, AlertCircle, Plus, ArrowUpRight, 
  ArrowDownRight, Calendar as CalendarIcon, Loader2,
  Filter as FilterIcon, X, Crown
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import { Link } from "react-router-dom";
import { TradingCalendar } from "./TradingCalendar";
import { SmartInsights } from "./SmartInsights";
import { MarketSentiment } from "./MarketSentiment";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { useTrades } from "../trades/TradeContext";
import { useAuth } from "../auth/AuthContext";
import { Trade } from "@/src/types";
import { MARKET_TYPES, CURRENCIES } from "@/src/constants";
import { Input } from "@/src/components/ui/Input";
import { TradeReminder } from "@/src/components/TradeReminder";
import { Paywall } from "@/src/components/Paywall";
import { MetricInfo } from "@/src/components/ui/MetricInfo";
import { PerformanceCharts } from "@/src/components/ui/PerformanceCharts";
import { Lock, ShieldAlert, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const RecentTradeItem = React.memo(({ trade, currencyCode }: { trade: Trade, currencyCode: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-800/50">
    <div className="flex items-center space-x-3">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-red-500/10 text-red-600 dark:text-red-500"
      )}>
        {trade.direction === 'Long' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-bold text-slate-900 dark:text-white">{trade.symbol}</p>
        <p className="text-xs text-slate-400 dark:text-gray-500">{new Date(trade.date).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={cn(
        "font-bold",
        trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
      )}>
        {formatCurrency(trade.netPL, currencyCode, true)}
      </p>
      <Badge variant={trade.status === 'Win' ? 'success' : 'danger'}>{trade.status}</Badge>
    </div>
  </div>
));

import { useTranslation } from "@/src/hooks/useTranslation";

export function Dashboard() {
  const { allTrades, loading } = useTrades();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = React.useState(false);

  const [paywall, setPaywall] = React.useState<{ isOpen: boolean; feature: string; plan: 'PRO' | 'ELITE' }>({
    isOpen: false,
    feature: "",
    plan: 'PRO'
  });

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
  
  // Filters
  const [filters, setFilters] = React.useState({
    fromDate: "",
    toDate: "",
    marketType: "All",
    currency: "All"
  });

  const quote = React.useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);

  const filteredTrades = React.useMemo(() => {
    return allTrades.filter(t => {
      if (filters.marketType !== "All" && t.marketType !== filters.marketType) return false;
      if (filters.currency !== "All" && t.currency !== filters.currency) return false;
      if (filters.fromDate && new Date(t.date) < new Date(filters.fromDate)) return false;
      if (filters.toDate && new Date(t.date) > new Date(filters.toDate)) return false;
      return true;
    });
  }, [allTrades, filters]);

  const stats = React.useMemo(() => {
    if (filteredTrades.length === 0) return {
      totalTrades: 0,
      netPL: 0,
      winRate: 0,
      avgRR: 0,
      disciplineScore: 0,
      consistencyScore: 0,
      equityData: [],
      recentTrades: []
    };

    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === 'Win').length;
    const winRate = (wins / totalTrades) * 100;
    const netPL = filteredTrades.reduce((sum, t) => sum + (t.netPL || 0), 0);
    const avgRR = filteredTrades.reduce((sum, t) => sum + (t.rrRatio || 0), 0) / totalTrades;

    // Calculate scores based on data
    const disciplineScore = Math.min(100, (filteredTrades.filter(t => t.notes && t.notes.length > 20).length / totalTrades) * 100);
    const consistencyScore = Math.min(100, (wins / totalTrades) * 100);

    // Calculate equity curve
    let currentEquity = 0; // Starting equity baseline
    const equityData = filteredTrades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t, index) => {
        currentEquity += (t.netPL || 0);
        return {
          tradeNum: index + 1,
          date: t.date,
          equity: currentEquity,
          netPL: t.netPL || 0,
          symbol: t.symbol
        };
      });

    // Add starting point at zero
    const chartData = [
      { tradeNum: 0, date: equityData[0]?.date || new Date().toISOString(), equity: 0, netPL: 0, symbol: 'Start' },
      ...equityData
    ];

    const recentTrades = [...filteredTrades]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    return { totalTrades, netPL, winRate, avgRR, disciplineScore, consistencyScore, equityData: chartData, recentTrades };
  }, [filteredTrades]);

  const currencyCode = profile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl backdrop-blur-sm dark:bg-gray-900 dark:border-gray-800">
          <p className="text-xs text-slate-500 mb-1 dark:text-gray-500">{new Date(data.date).toLocaleDateString()}</p>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{data.symbol}</span>
            <span className={cn(
              "text-sm font-bold",
              data.netPL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
            )}>
              {formatCurrency(data.netPL, currencyCode, true)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-gray-500">Equity</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(data.equity, currencyCode)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <TradeReminder />
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">{t.dashboard}</h1>
          <p className="text-slate-500 dark:text-gray-400">{t.welcomeBack}, {profile?.fullName || "Trader"}.</p>
        </div>
        <Link to="/add-trade">
          <Button className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            {t.addTrade}
          </Button>
        </Link>
      </div>

      {/* Motivational Quote */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-400 italic dark:bg-blue-500/10">
        "{quote}"
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">{t.totalTrades}</p>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTrades}</p>
            <p className="text-xs text-slate-400 mt-1 dark:text-gray-500">Lifetime activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">{t.netPLLabel}</p>
                <MetricInfo metricName="Realized PNL" />
              </div>
              <TrendingUp className={cn("h-4 w-4", stats.netPL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")} />
            </div>
            <p className={cn(
              "mt-2 text-2xl font-bold", 
              stats.netPL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
            )}>
              {formatCurrency(stats.netPL, currencyCode, true)}
            </p>
            <p className="text-xs text-slate-400 mt-1 dark:text-gray-500">Total realized P/L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">{t.winRate}</p>
                <MetricInfo metricName="Winrate" />
              </div>
              <Target className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.winRate.toFixed(1)}%</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-gray-800">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.winRate}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          {!isPro && (
            <div 
              className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center cursor-pointer dark:bg-black/40"
              onClick={() => checkAccess("Advanced Stats")}
            >
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">{t.avgRRLabel}</p>
                <MetricInfo metricName="Average RR" />
              </div>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{isPro ? `1:${formatRR(stats.avgRR)}` : "1:0.0"}</p>
            <p className="text-xs text-slate-400 mt-1 dark:text-gray-500">Risk vs Reward</p>
          </CardContent>
        </Card>
      </div>

      <PerformanceCharts trades={allTrades} currencyCode={currencyCode} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Equity Curve Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{t.equityCurve}</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-gray-500">From Date</label>
                  <Input 
                    type="date" 
                    className="h-9 text-xs" 
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-gray-500">To Date</label>
                  <Input 
                    type="date" 
                    className="h-9 text-xs" 
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  />
                </div>
                <CustomSelect 
                  label="Market Type"
                  options={[
                    { id: "All", label: "All Markets" },
                    ...MARKET_TYPES.map(m => ({ id: m, label: m }))
                  ]}
                  value={filters.marketType}
                  onChange={(val) => setFilters({ ...filters, marketType: val })}
                />
                <CustomSelect 
                  label="Currency"
                  options={[
                    { id: "All", label: "All Currencies" },
                    ...CURRENCIES.map(c => ({ id: c.symbol, label: c.code }))
                  ]}
                  value={filters.currency}
                  onChange={(val) => setFilters({ ...filters, currency: val })}
                />
                {(filters.fromDate || filters.toDate || filters.marketType !== "All" || filters.currency !== "All") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white"
                    onClick={() => setFilters({ fromDate: "", toDate: "", marketType: "All", currency: "All" })}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            <div className="h-[300px] w-full">
              {stats.equityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.equityData}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-gray-800" />
                    <XAxis 
                      dataKey="tradeNum" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => val === 0 ? 'Start' : `T${val}`}
                      className="dark:stroke-gray-500"
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `${currencySymbol}${val >= 1000 || val <= -1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                      domain={['auto', 'auto']}
                      className="dark:stroke-gray-500"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorEquity)" 
                      animationDuration={1500}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No trade data available for equity curve.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trading Calendar (Mini) */}
        <div className="space-y-6">
          <MarketSentiment />
          <TradingCalendar />
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="relative overflow-hidden rounded-3xl">
        {!isElite && (
          <div 
            className="absolute inset-0 bg-white/20 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center cursor-pointer dark:bg-black/20"
            onClick={() => checkAccess("AI Smart Insights", "ELITE")}
          >
            <div className="bg-amber-500 text-white px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-xl">
              <Crown className="h-5 w-5" />
              <span className="font-bold">Unlock Elite Insights</span>
            </div>
          </div>
        )}
        <SmartInsights trades={allTrades} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Recent Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t.recentTrades}</CardTitle>
            <Link to="/journal" className="text-xs text-blue-500 hover:underline">{t.viewAll}</Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentTrades.length > 0 ? stats.recentTrades.map((trade) => (
              <RecentTradeItem key={trade.id} trade={trade} currencyCode={currencyCode} />
            )) : (
              <div className="text-center py-8 text-gray-500">
                {t.noTrades}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights & Scores */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            {!isPro && (
              <div 
                className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer dark:bg-black/40"
                onClick={() => checkAccess("Performance Scores")}
              >
                <Lock className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-gray-300">Upgrade to Pro</p>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-base">{t.performance}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-gray-400">{t.disciplineScore}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats.disciplineScore.toFixed(0)}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${stats.disciplineScore}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-gray-400">{t.consistencyScore}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.consistencyScore.toFixed(0)}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.consistencyScore}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Paywall 
        isOpen={paywall.isOpen} 
        onClose={() => setPaywall({ ...paywall, isOpen: false })} 
        featureName={paywall.feature} 
        requiredPlan={paywall.plan} 
      />
    </div>
  );
}

