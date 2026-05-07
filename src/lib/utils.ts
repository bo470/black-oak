import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currencyCode: string = 'USD') {
  const currencyMap: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
  };
  return currencyMap[currencyCode] || currencyCode;
}

export function formatCurrency(amount: number, currencyInput: string = '$', showSign: boolean = false) {
  const isNegative = amount < 0;
  const isPositive = amount > 0;
  const absAmount = Math.abs(amount);
  
  const symbol = getCurrencySymbol(currencyInput);
  
  // Use Intl.NumberFormat for proper grouping
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  const sign = isNegative ? '-' : (isPositive && showSign ? '+' : '');
  return `${sign}${symbol}${formatted}`;
}

export function formatRR(ratio: number): string {
  if (!ratio && ratio !== 0) return '0';
  // Remove trailing zeros and unnecessary decimal point
  return Number(ratio.toFixed(2)).toString();
}

export function formatDuration(ms: number) {
  if (!ms || ms < 0) return "0m";
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function calculatePL(
  direction: 'Long' | 'Short',
  entry: number,
  exit: number,
  quantity: number,
  fees: number = 0
) {
  const gross = direction === 'Long' ? (exit - entry) * quantity : (entry - exit) * quantity;
  const net = gross - fees;
  const roi = (net / (entry * quantity)) * 100;
  return { gross, net, roi };
}
