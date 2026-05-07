import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { cn, formatCurrency } from "@/src/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useTrades } from "../trades/TradeContext";
import { useAuth } from "../auth/AuthContext";

const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

export function TradingCalendar() {
  const { trades, loading } = useTrades();
  const { profile } = useAuth();
  const currency = profile?.currency || '$';
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const totalDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const calendarData = React.useMemo(() => {
    const data: { [key: string]: { pl: number, count: number } } = {};
    trades.forEach(trade => {
      const date = new Date(trade.date);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!data[dateStr]) {
          data[dateStr] = { pl: 0, count: 0 };
        }
        data[dateStr].pl += (trade.netPL || 0);
        data[dateStr].count += 1;
      }
    });
    return data;
  }, [trades, month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </Card>
    );
  }

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-20 md:h-24 border-b border-r border-slate-200 dark:border-gray-800" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = calendarData[dateStr];

    days.push(
      <div 
        key={d} 
        className={cn(
          "h-20 md:h-24 border-b border-r border-slate-200 p-2 flex flex-col justify-between transition-colors hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800/30 cursor-pointer",
          data && data.pl > 0 && "bg-emerald-500/5 dark:bg-emerald-500/10",
          data && data.pl < 0 && "bg-red-500/5 dark:bg-red-500/10"
        )}
      >
        <span className="text-xs font-bold text-slate-400 dark:text-gray-500">{d}</span>
        {data && (
          <div className="text-right">
            <p className={cn(
              "text-[10px] md:text-xs font-bold",
              data.pl > 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
            )}>
              {formatCurrency(data.pl, currency, true)}
            </p>
            <p className="text-[8px] text-slate-400 uppercase tracking-tighter dark:text-gray-500">{data.count} Trades</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800">
        <CardTitle className="text-base">{monthName} {year}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-l border-slate-200 dark:border-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-r border-slate-200 bg-slate-50 dark:text-gray-500 dark:border-gray-800 dark:bg-gray-900/50">
              {day}
            </div>
          ))}
          {days}
        </div>
      </CardContent>
    </Card>
  );
}
