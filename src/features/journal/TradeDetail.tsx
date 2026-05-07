import * as React from "react";
import { Trade } from "@/src/types";
import { 
  X, Calendar, Tag, Smile, ArrowUpRight, 
  ArrowDownRight, Info, AlertTriangle, Lightbulb,
  Image as ImageIcon, Trash2, Edit3, FileText, Target,
  Share2, Check
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { formatCurrency, cn, formatRR } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../auth/AuthContext";

import { TradeShareModal } from "../trades/TradeShareModal";

interface TradeDetailProps {
  trade: Trade;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onSaveAsDraft?: (trade: Trade) => void;
}

export function TradeDetail({ trade, onClose, onEdit, onDelete, onSaveAsDraft }: TradeDetailProps) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';
  const [copied, setCopied] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl dark:bg-gray-900 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "p-6 flex items-center justify-between border-b border-slate-100 dark:border-gray-800",
          trade.status === 'Win' ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <div className="flex items-center space-x-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center",
              trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              {trade.direction === 'Long' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{trade.symbol}</h2>
                <Badge variant={trade.status === 'Win' ? 'success' : 'danger'}>{trade.status}</Badge>
              </div>
              <p className="text-sm text-slate-400 dark:text-gray-500">{trade.marketType} • {trade.direction}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5 text-slate-400 dark:text-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 dark:bg-gray-800/30 dark:border-gray-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-gray-500">Net P/L</p>
              <p className={cn(
                "text-lg font-bold",
                trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
              )}>
                {formatCurrency(trade.netPL, currency, true)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 dark:bg-gray-800/30 dark:border-gray-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-gray-500">ROI</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{trade.roi?.toFixed(2)}%</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 dark:bg-gray-800/30 dark:border-gray-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-gray-500">R:R Ratio</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">1:{formatRR(trade.rrRatio)}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 dark:bg-gray-800/30 dark:border-gray-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-gray-500">Quantity</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{trade.quantity}</p>
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Date: {new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Entry: {formatCurrency(trade.entryPrice, currency)}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Exit: {formatCurrency(trade.exitPrice, currency)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Tag className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Setup: {trade.setupType || 'None'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Smile className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Emotion: {trade.emotionAfter || 'Neutral'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-300">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Confidence: {trade.confidence}/10</span>
              </div>
            </div>
          </div>

          {/* Notes & Learnings */}
          <div className="space-y-6">
            {trade.notes && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-blue-400">
                  <FileText className="h-4 w-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Trade Notes</h4>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 dark:bg-gray-800/20 dark:border-gray-800/50">
                  <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap dark:text-gray-400">{trade.notes}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Mistakes</h4>
                </div>
                <div className="bg-red-500/5 rounded-2xl p-4 border border-red-500/10">
                  <p className="text-sm text-slate-500 dark:text-gray-400">{trade.mistakes || 'No mistakes recorded.'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Lightbulb className="h-4 w-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Learnings</h4>
                </div>
                <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
                  <p className="text-sm text-slate-500 dark:text-gray-400">{trade.learnings || 'No learnings recorded.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots Placeholder */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 dark:text-gray-400">
              <ImageIcon className="h-4 w-4" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Screenshots</h4>
            </div>
            <div className="h-32 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 dark:border-gray-800 dark:text-gray-600">
              <p className="text-xs">No screenshots attached to this trade.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white/80 flex items-center justify-between dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => onDelete(trade.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button 
              variant="ghost" 
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              onClick={handleShare}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Share"}
            </Button>
          </div>
          <div className="flex space-x-3">
            {onSaveAsDraft && !trade.isDraft && (
              <Button variant="outline" onClick={() => onSaveAsDraft(trade)}>
                <FileText className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            )}
            <Button variant="outline" onClick={() => onEdit(trade)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Trade
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
      <TradeShareModal 
        trade={trade} 
        currency={currency} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </motion.div>
  );
}
