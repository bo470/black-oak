import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { Badge } from "@/src/components/ui/Badge";
import { 
  TrendingUp, TrendingDown, Activity, Target, 
  Zap, Play, RotateCcw, BarChart3, History,
  Settings as SettingsIcon, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Strategy, BacktestResult } from "./types";
import { generateMockHistoricalData } from "./mockData";
import { runBacktest } from "./backtestEngine";
import { formatCurrency, cn } from "@/src/lib/utils";

const STRATEGIES: Strategy[] = [
  {
    id: 'sma_crossover',
    name: 'SMA Crossover',
    description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below.',
    parameters: [
      { id: 'fastPeriod', name: 'Fast Period', type: 'number', default: 10, min: 1, max: 50 },
      { id: 'slowPeriod', name: 'Slow Period', type: 'number', default: 20, min: 2, max: 200 },
    ]
  },
  {
    id: 'rsi_reversal',
    name: 'RSI Reversal',
    description: 'Buy when RSI is oversold, sell when it is overbought.',
    parameters: [
      { id: 'period', name: 'RSI Period', type: 'number', default: 14, min: 2, max: 50 },
      { id: 'oversold', name: 'Oversold Level', type: 'number', default: 30, min: 1, max: 49 },
      { id: 'overbought', name: 'Overbought Level', type: 'number', default: 70, min: 51, max: 99 },
    ]
  },
  {
    id: 'macd_crossover',
    name: 'MACD Crossover',
    description: 'Buy when MACD line crosses above 0, sell when it crosses below.',
    parameters: [
      { id: 'fast', name: 'Fast EMA', type: 'number', default: 12, min: 2, max: 50 },
      { id: 'slow', name: 'Slow EMA', type: 'number', default: 26, min: 2, max: 100 },
      { id: 'signal', name: 'Signal Line', type: 'number', default: 9, min: 2, max: 50 },
    ]
  },
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    description: 'Buy when price touches lower band, sell when it touches upper band.',
    parameters: [
      { id: 'period', name: 'Period', type: 'number', default: 20, min: 2, max: 100 },
      { id: 'multiplier', name: 'StdDev Multiplier', type: 'number', default: 2, min: 1, max: 5 },
    ]
  },
  {
    id: 'pinescript',
    name: 'Custom Pine Script',
    description: 'Write your own strategy using simplified Pine Script syntax.',
    parameters: [
      { id: 'code', name: 'Pine Script', type: 'code', default: '// Example: SMA Crossover\nfast = ta.sma(close, 10)\nslow = ta.sma(close, 20)\nstrategy.entry("Long", strategy.long, when = ta.crossover(fast, slow))\nstrategy.close("Long", when = ta.crossunder(fast, slow))' }
    ]
  }
];

export function Backtesting() {
  const [selectedStrategyId, setSelectedStrategyId] = React.useState(STRATEGIES[0].id);
  const [params, setParams] = React.useState<Record<string, any>>({});
  const [result, setResult] = React.useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedStrategy = STRATEGIES.find(s => s.id === selectedStrategyId)!;

  React.useEffect(() => {
    const initialParams: Record<string, any> = {};
    selectedStrategy.parameters.forEach(p => {
      initialParams[p.id] = p.default;
    });
    setParams(initialParams);
  }, [selectedStrategyId]);

  const handleRunBacktest = () => {
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      const data = generateMockHistoricalData('MOCK', 365);
      const res = runBacktest(selectedStrategyId, params, data);
      setResult(res);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">Backtesting</h1>
          <p className="text-slate-500 dark:text-gray-400">Validate your trading strategies against historical data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5 text-blue-500" />
                Strategy Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CustomSelect
                label="Strategy"
                options={STRATEGIES.map(s => ({ id: s.id, label: s.name }))}
                value={selectedStrategyId}
                onChange={setSelectedStrategyId}
              />
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-gray-900/50 dark:border-gray-800">
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed italic">
                  {selectedStrategy.description}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest dark:text-gray-500">Parameters</h4>
                {selectedStrategy.parameters.map(p => (
                  <div key={p.id} className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{p.name}</label>
                    {p.type === 'code' ? (
                      <textarea
                        className="w-full h-48 p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        value={params[p.id] || ''}
                        onChange={(e) => setParams({ ...params, [p.id]: e.target.value })}
                        spellCheck={false}
                      />
                    ) : (
                      <Input
                        type="number"
                        value={params[p.id] || ''}
                        onChange={(e) => setParams({ ...params, [p.id]: Number(e.target.value) })}
                        min={p.min}
                        max={p.max}
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                onClick={handleRunBacktest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                Run Backtest
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20">
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Net Profit</p>
                    <p className="mt-1 text-2xl font-black">{formatCurrency(result.totalProfit, 'USD', true)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">Win Rate</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{result.winRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">Max Drawdown</p>
                    <p className="mt-1 text-2xl font-bold text-red-500">{result.maxDrawdown.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-500">Total Trades</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{result.totalTrades}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Equity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Equity Curve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.equityCurve}>
                        <defs>
                          <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          hide 
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val, 'USD'), 'Equity']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="equity" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorEquity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trade History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <History className="mr-2 h-5 w-5 text-blue-500" />
                    Backtest Trades
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-500 uppercase text-[10px] font-black tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Symbol</th>
                          <th className="px-4 py-3">Entry/Exit</th>
                          <th className="px-4 py-3 text-right">Profit</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                        {result.trades.slice(-10).reverse().map((trade) => (
                          <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-900 dark:text-white">{trade.entryDate}</p>
                              <p className="text-[10px] text-slate-400 dark:text-gray-500">{trade.exitDate}</p>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400">
                                {trade.symbol}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(trade.entryPrice, 'USD')}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(trade.exitPrice, 'USD')}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className={cn(
                                "flex items-center justify-end font-black",
                                trade.profit >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                              )}>
                                {trade.profit >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                                {formatCurrency(trade.profit, 'USD', true)}
                                <span className="ml-1 text-[10px] opacity-70">({trade.profitPercent.toFixed(1)}%)</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Badge variant={trade.status === 'Win' ? 'success' : 'danger'}>
                                {trade.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.trades.length > 10 && (
                    <div className="p-4 text-center border-t border-slate-100 dark:border-gray-800">
                      <p className="text-xs text-slate-400">Showing last 10 of {result.trades.length} trades</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center dark:bg-gray-900">
                <Play className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Results Yet</h3>
                <p className="text-sm text-slate-500 max-w-xs dark:text-gray-500">
                  Configure your strategy parameters and click "Run Backtest" to see performance metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
