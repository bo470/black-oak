import { HistoricalBar } from './types';

export function generateMockHistoricalData(
  symbol: string,
  days: number = 100,
  volatility: number = 0.02
): HistoricalBar[] {
  const data: HistoricalBar[] = [];
  let currentPrice = symbol === 'BTC' ? 60000 : symbol === 'AAPL' ? 150 : 100;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    const open = currentPrice;
    const high = open * (1 + Math.random() * volatility);
    const low = open * (1 - Math.random() * volatility);
    const close = low + Math.random() * (high - low);
    const volume = Math.random() * 1000000;

    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return data;
}
