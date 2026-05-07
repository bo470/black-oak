import { Trade } from "@/src/types";

export function exportTradesToCSV(trades: Trade[]) {
  if (trades.length === 0) return;

  const headers = [
    "Date",
    "Symbol",
    "Market Type",
    "Direction",
    "Entry Price",
    "Exit Price",
    "Quantity",
    "Net P/L",
    "ROI (%)",
    "R:R Ratio",
    "Setup Type",
    "Status",
    "Emotion After",
    "Notes"
  ];

  const rows = trades.map(trade => [
    new Date(trade.date).toLocaleDateString(),
    trade.symbol,
    trade.marketType,
    trade.direction,
    trade.entryPrice,
    trade.exitPrice,
    trade.quantity,
    trade.netPL,
    trade.roi,
    trade.rrRatio,
    trade.setupType || "",
    trade.status,
    trade.emotionAfter || "",
    `"${(trade.notes || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `trading_journal_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
