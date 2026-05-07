import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Share2, Copy, Check, QrCode, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Trade } from "@/src/types";
import { formatCurrency, formatRR, cn } from "@/src/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

interface TradeShareModalProps {
  trade: Trade;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TradeShareModal({ trade, currency, isOpen, onClose }: TradeShareModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Use the actual origin for the share URL
  const shareUrl = `${window.location.origin}/journal/${trade.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
      
      const link = document.createElement('a');
      link.download = `trade-${trade.symbol}-${trade.status.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-gray-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Share Trade Summary</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Share Card Content (The visual summary) */}
          <div className="p-6 space-y-6">
            <div 
              ref={cardRef}
              id="trade-share-card"
              className={cn(
                "rounded-2xl p-6 space-y-4 border-2 shadow-sm transition-colors bg-white dark:bg-gray-900",
                trade.status === 'Win' 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-red-500/5 border-red-500/20"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {trade.symbol}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest dark:text-gray-500">
                    {trade.direction} • {new Date(trade.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  trade.status === 'Win' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {trade.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-gray-500">Profit / Loss</p>
                  <p className={cn(
                    "text-xl font-black",
                    trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                  )}>
                    {formatCurrency(trade.netPL, currency, true)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-gray-500">R:R Ratio</p>
                  <p className="text-xl font-black text-blue-500">1:{formatRR(trade.rrRatio)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/50 dark:border-gray-800/50 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase dark:text-gray-500">Entry</p>
                  <p className="text-xs font-bold dark:text-white">{formatCurrency(trade.entryPrice, currency)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase dark:text-gray-500">Exit</p>
                  <p className="text-xs font-bold dark:text-white">{formatCurrency(trade.exitPrice, currency)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase dark:text-gray-500">ROI</p>
                  <p className="text-xs font-bold dark:text-white">{trade.roi}%</p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-gray-800/50">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase dark:text-gray-500">Scan to view log</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">BlackOak Trading Journal</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-slate-100 dark:bg-white dark:border-none">
                  <QRCodeSVG value={shareUrl} size={48} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex flex-col space-y-3">
            <Button className="w-full" onClick={handleCopyLink}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Link Copied!" : "Copy Share Link"}
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownloadImage}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? "Saving..." : "Save PNG"}
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Social
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
