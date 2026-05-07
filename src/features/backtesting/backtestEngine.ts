import { HistoricalBar, BacktestResult, BacktestTrade } from './types';

export function runBacktest(
  strategyId: string,
  parameters: Record<string, any>,
  data: HistoricalBar[]
): BacktestResult {
  const trades: BacktestTrade[] = [];
  let currentEquity = 10000; // Starting capital
  const equityCurve: { date: string; equity: number }[] = [{ date: data[0].date, equity: currentEquity }];
  
  let position: { entryPrice: number; entryDate: string; direction: 'Long' | 'Short' } | null = null;

  // --- Indicators ---

  // Simple Moving Average
  const calculateSMA = (period: number, index: number, source: number[] = data.map(d => d.close)) => {
    if (index < period - 1) return null;
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += source[index - i];
    }
    return sum / period;
  };

  // Exponential Moving Average
  const calculateEMA = (period: number, index: number, source: number[] = data.map(d => d.close), prevEma: number | null = null) => {
    if (index < period - 1) return null;
    if (index === period - 1) return calculateSMA(period, index, source);
    
    const k = 2 / (period + 1);
    const currentPrice = source[index];
    const ema = prevEma !== null ? prevEma : calculateSMA(period, index - 1, source);
    if (ema === null) return null;
    return currentPrice * k + ema * (1 - k);
  };

  // Standard Deviation
  const calculateStdDev = (period: number, index: number, source: number[] = data.map(d => d.close)) => {
    const sma = calculateSMA(period, index, source);
    if (sma === null) return null;
    let sumSq = 0;
    for (let i = 0; i < period; i++) {
      sumSq += Math.pow(source[index - i] - sma, 2);
    }
    return Math.sqrt(sumSq / period);
  };

  // RSI
  const calculateRSI = (period: number, index: number) => {
    if (index < period) return null;
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < period; i++) {
      const diff = data[index - i].close - data[index - i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  };

  // MACD
  const calculateMACD = (fast: number, slow: number, signal: number, index: number) => {
    const fastEma = calculateEMA(fast, index);
    const slowEma = calculateEMA(slow, index);
    if (fastEma === null || slowEma === null) return null;
    const macdLine = fastEma - slowEma;
    return macdLine;
  };

  // --- Pine Script Interpreter (Simplified) ---
  const interpretPineScript = (code: string, index: number) => {
    if (!code) return null;
    
    // This is a VERY simplified interpreter for demo purposes
    // It looks for crossover/crossunder patterns
    try {
      const lines = code.split('\n');
      const vars: Record<string, any> = {};
      let signal: 'Buy' | 'Sell' | null = null;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) return;

        // Variable assignment: x = ta.sma(close, 10)
        const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch) {
          const varName = assignMatch[1];
          const expression = assignMatch[2];

          if (expression.includes('ta.sma')) {
            const period = parseInt(expression.match(/\d+/)?.[0] || '10');
            vars[varName] = calculateSMA(period, index);
            vars[`prev_${varName}`] = calculateSMA(period, index - 1);
          } else if (expression.includes('ta.ema')) {
            const period = parseInt(expression.match(/\d+/)?.[0] || '10');
            vars[varName] = calculateEMA(period, index);
            vars[`prev_${varName}`] = calculateEMA(period, index - 1);
          } else if (expression.includes('ta.rsi')) {
            const period = parseInt(expression.match(/\d+/)?.[0] || '14');
            vars[varName] = calculateRSI(period, index);
            vars[`prev_${varName}`] = calculateRSI(period, index - 1);
          }
        }

        // Strategy entry: strategy.entry("Long", strategy.long, when = ta.crossover(fast, slow))
        if (trimmed.includes('strategy.entry') && trimmed.includes('ta.crossover')) {
          const parts = trimmed.match(/ta\.crossover\((\w+),\s*(\w+)\)/);
          if (parts) {
            const fastVar = parts[1];
            const slowVar = parts[2];
            if (vars[`prev_${fastVar}`] <= vars[`prev_${slowVar}`] && vars[fastVar] > vars[slowVar]) {
              signal = 'Buy';
            }
          }
        }

        // Strategy close: strategy.close("Long", when = ta.crossunder(fast, slow))
        if (trimmed.includes('strategy.close') && trimmed.includes('ta.crossunder')) {
          const parts = trimmed.match(/ta\.crossunder\((\w+),\s*(\w+)\)/);
          if (parts) {
            const fastVar = parts[1];
            const slowVar = parts[2];
            if (vars[`prev_${fastVar}`] >= vars[`prev_${slowVar}`] && vars[fastVar] < vars[slowVar]) {
              signal = 'Sell';
            }
          }
        }
      });

      return signal;
    } catch (e) {
      console.error("Pine Script Error:", e);
      return null;
    }
  };

  // --- Main Loop ---
  for (let i = 1; i < data.length; i++) {
    const currentBar = data[i];
    const prevBar = data[i - 1];

    // Strategy Logic
    let signal: 'Buy' | 'Sell' | null = null;

    if (strategyId === 'sma_crossover') {
      const fastSMA = calculateSMA(parameters.fastPeriod, i);
      const slowSMA = calculateSMA(parameters.slowPeriod, i);
      const prevFastSMA = calculateSMA(parameters.fastPeriod, i - 1);
      const prevSlowSMA = calculateSMA(parameters.slowPeriod, i - 1);

      if (fastSMA !== null && slowSMA !== null && prevFastSMA !== null && prevSlowSMA !== null) {
        if (prevFastSMA <= prevSlowSMA && fastSMA > slowSMA) signal = 'Buy';
        else if (prevFastSMA >= prevSlowSMA && fastSMA < slowSMA) signal = 'Sell';
      }
    } else if (strategyId === 'rsi_reversal') {
      const rsi = calculateRSI(parameters.period, i);
      if (rsi !== null) {
        if (rsi < parameters.oversold) signal = 'Buy';
        else if (rsi > parameters.overbought) signal = 'Sell';
      }
    } else if (strategyId === 'macd_crossover') {
      const macd = calculateMACD(parameters.fast, parameters.slow, parameters.signal, i);
      const prevMacd = calculateMACD(parameters.fast, parameters.slow, parameters.signal, i - 1);
      // Simplified MACD: Buy when MACD crosses 0
      if (macd !== null && prevMacd !== null) {
        if (prevMacd <= 0 && macd > 0) signal = 'Buy';
        else if (prevMacd >= 0 && macd < 0) signal = 'Sell';
      }
    } else if (strategyId === 'bollinger_bands') {
      const sma = calculateSMA(parameters.period, i);
      const stdDev = calculateStdDev(parameters.period, i);
      if (sma !== null && stdDev !== null) {
        const upper = sma + stdDev * parameters.multiplier;
        const lower = sma - stdDev * parameters.multiplier;
        if (currentBar.close < lower) signal = 'Buy';
        else if (currentBar.close > upper) signal = 'Sell';
      }
    } else if (strategyId === 'pinescript') {
      signal = interpretPineScript(parameters.code, i);
    }

    // Execution Logic
    if (signal === 'Buy' && !position) {
      position = { entryPrice: currentBar.close, entryDate: currentBar.date, direction: 'Long' };
    } else if (signal === 'Sell' && position) {
      const profit = (currentBar.close - position.entryPrice) / position.entryPrice * currentEquity;
      const profitPercent = (currentBar.close - position.entryPrice) / position.entryPrice * 100;
      
      trades.push({
        id: Math.random().toString(36).substr(2, 9),
        symbol: 'MOCK',
        entryDate: position.entryDate,
        exitDate: currentBar.date,
        entryPrice: position.entryPrice,
        exitPrice: currentBar.close,
        direction: 'Long',
        profit,
        profitPercent,
        status: profit >= 0 ? 'Win' : 'Loss'
      });

      currentEquity += profit;
      position = null;
    }

    equityCurve.push({ date: currentBar.date, equity: currentEquity });
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.status === 'Win').length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalProfit = currentEquity - 10000;

  // Max Drawdown
  let maxEquity = 10000;
  let maxDD = 0;
  for (const point of equityCurve) {
    if (point.equity > maxEquity) maxEquity = point.equity;
    const dd = (maxEquity - point.equity) / maxEquity;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    totalProfit,
    winRate,
    maxDrawdown: maxDD * 100,
    totalTrades,
    equityCurve,
    trades
  };
}
