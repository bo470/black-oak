export interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameter[];
}

export interface StrategyParameter {
  id: string;
  name: string;
  type: 'number' | 'select' | 'code';
  default: any;
  options?: string[];
  min?: number;
  max?: number;
}

export interface BacktestResult {
  totalProfit: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  equityCurve: { date: string; equity: number }[];
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  direction: 'Long' | 'Short';
  profit: number;
  profitPercent: number;
  status: 'Win' | 'Loss';
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
