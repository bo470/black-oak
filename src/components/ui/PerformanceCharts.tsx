import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency, getCurrencySymbol, cn } from "@/src/lib/utils";
import { Trade } from "@/src/types";
import { MetricInfo } from "./MetricInfo";
import { CustomSelect } from "./CustomSelect";
import { useTranslation } from "@/src/hooks/useTranslation";

interface PerformanceChartsProps {
  trades: Trade[];
  currencyCode: string;
}

type Period = 'Daily' | 'Weekly' | 'Monthly';

export function PerformanceCharts({ trades, currencyCode }: PerformanceChartsProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = React.useState<Period>('Daily');
  
  const processedData = React.useMemo(() => {
    const dataMap: Record<string, { pnl: number, label: string, date: Date }> = {};
    const closedTrades = trades.filter(t => !t.isDraft); // Note: Current type only has closed statuses

    closedTrades.forEach(trade => {
      const date = new Date(trade.date);
      let key = "";
      let label = "";

      if (period === 'Daily') {
        key = date.toISOString().split('T')[0];
        label = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      } else if (period === 'Weekly') {
        // Simple week calc: Year-WeekNum
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${weekNum}`;
        label = `W${weekNum} ${date.getFullYear()}`;
      } else if (period === 'Monthly') {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        label = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }

      if (!dataMap[key]) {
        dataMap[key] = { pnl: 0, label, date };
      }
      dataMap[key].pnl += (trade.netPL || 0);
    });

    const chartData = Object.values(dataMap).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Highlight peaks
    let maxProfit = -Infinity;
    let maxLoss = Infinity;
    chartData.forEach(d => {
      if (d.pnl > maxProfit) maxProfit = d.pnl;
      if (d.pnl < maxLoss) maxLoss = d.pnl;
    });

    return { 
      chartData, 
      maxProfit: maxProfit === -Infinity ? 0 : maxProfit, 
      maxLoss: maxLoss === Infinity ? 0 : maxLoss 
    };
  }, [trades, period]);

  const currencySymbol = getCurrencySymbol(currencyCode);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{data.label}</p>
          <p className={cn(
            "text-sm font-black",
            data.pnl >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {formatCurrency(data.pnl, currencyCode, true)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between px-0 pb-6">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg font-black uppercase tracking-tight">{period} PnL Performance</CardTitle>
          <MetricInfo metricName="Daily PNL" />
        </div>
        <div className="w-32">
          <CustomSelect
            value={period}
            onChange={(val) => setPeriod(val as Period)}
            options={[
              { id: "Daily", label: "Daily" },
              { id: "Weekly", label: "Weekly" },
              { id: "Monthly", label: "Monthly" }
            ]}
            triggerClassName="h-9 text-xs font-bold bg-white dark:bg-gray-900"
          />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[300px] w-full">
          {processedData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={processedData.chartData} 
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                barGap={8}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-gray-800" />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                  className="dark:stroke-gray-500"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => {
                    const absVal = Math.abs(val);
                    const formatted = absVal >= 1000 ? (val/1000).toFixed(0) + 'k' : val;
                    if (val > 0) return `+${currencySymbol}${absVal >= 1000 ? (absVal/1000).toFixed(0) + 'k' : absVal}`;
                    if (val < 0) return `-${currencySymbol}${absVal >= 1000 ? (absVal/1000).toFixed(0) + 'k' : absVal}`;
                    return `${currencySymbol}0`;
                  }}
                  className="dark:stroke-gray-500"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={16}>
                  {processedData.chartData.map((entry, index) => {
                    const isMaxProfit = entry.pnl === processedData.maxProfit && entry.pnl > 0;
                    const isMaxLoss = entry.pnl === processedData.maxLoss && entry.pnl < 0;
                    
                    let fill = '#94a3b8'; // Neutral
                    if (entry.pnl > 0) fill = isMaxProfit ? '#00c853' : '#10b981';
                    if (entry.pnl < 0) fill = isMaxLoss ? '#ff3d00' : '#ef4444';
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill}
                        fillOpacity={isMaxProfit || isMaxLoss ? 1 : 0.8}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-3xl dark:bg-gray-800/20 border-2 border-dashed border-slate-200 dark:border-gray-800">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center dark:bg-gray-800 mb-4">
                <BarChart className="h-6 w-6 text-slate-300 dark:text-gray-600" />
              </div>
              <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                {t.noTradesFound}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
