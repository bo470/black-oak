import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { formatCurrency, cn, formatRR } from "@/src/lib/utils";
import { 
  ArrowLeft, Edit, Trash2, Copy, 
  TrendingUp, TrendingDown, Calendar, 
  Clock, Target, Zap, Smile, Tag, 
  AlertCircle, CheckCircle2, Info, Camera, Globe,
  Loader2, Share2
} from "lucide-react";
import { useTrades } from "./TradeContext";
import { useAuth } from "../auth/AuthContext";
import { TradeShareModal } from "./TradeShareModal";

export function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trades, deleteTrade } = useTrades();
  const { profile } = useAuth();
  const currencyCode = profile?.currency || 'USD';
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const trade = trades.find(t => t.id === id);

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 dark:text-gray-500">Loading trade details...</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade(trade.id);
      navigate("/journal");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/trades/edit/${trade.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className={cn(
        "border-l-8",
        trade.status === 'Win' ? "border-l-emerald-500" : "border-l-red-500"
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {trade.direction === 'Long' ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{trade.symbol}</h1>
                  <Badge variant={trade.status === 'Win' ? 'success' : 'danger'} className="text-sm px-3 py-1">
                    {trade.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1 dark:text-gray-500">
                  <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" /> {new Date(trade.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center"><Clock className="mr-1 h-3 w-3" /> {new Date(trade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span className="flex items-center"><Globe className="mr-1 h-3 w-3" /> {trade.marketType}</span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className={cn(
                "text-4xl font-bold tracking-tighter",
                trade.status === 'Win' ? "text-emerald-500" : "text-red-500"
              )}>
                {formatCurrency(trade.netPL, currencyCode, true)}
              </p>
              <p className="text-sm text-slate-400 font-medium dark:text-gray-500">ROI: {trade.roi}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Trade Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Execution Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Entry Price</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(trade.entryPrice, currencyCode)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Exit Price</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(trade.exitPrice, currencyCode)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Stop Loss</p>
                  <p className="text-lg font-bold text-red-400">{trade.stopLoss ? formatCurrency(trade.stopLoss, currencyCode) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Target Price</p>
                  <p className="text-lg font-bold text-emerald-400">{trade.targetPrice ? formatCurrency(trade.targetPrice, currencyCode) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Quantity</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{trade.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Fees</p>
                  <p className="text-lg font-bold text-slate-500 dark:text-gray-400">{formatCurrency(trade.fees, currencyCode)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">R:R Ratio</p>
                  <p className="text-lg font-bold text-blue-400">1:{formatRR(trade.rrRatio)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {trade.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-gray-300">
                  {trade.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {trade.screenshotURL && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Screenshot</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-xl">
                <img 
                  src={trade.screenshotURL} 
                  alt="Trade Screenshot" 
                  className="w-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Psychology & Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Psychology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smile className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-slate-500 dark:text-gray-400">Before</span>
                </div>
                <Badge variant="secondary">{trade.emotionBefore}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smile className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-slate-500 dark:text-gray-400">After</span>
                </div>
                <Badge variant="secondary">{trade.emotionAfter}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 dark:text-gray-500">Confidence</span>
                  <span className="text-slate-900 font-bold dark:text-white">{trade.confidence}/10</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${trade.confidence * 10}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Setup Type</p>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{trade.setupType || 'None'}</span>
                </div>
              </div>
              {trade.tags && trade.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {trade.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="flex items-center">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {trade.ruleFollowed && (
            <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <CardContent className="pt-4 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Rule Followed</p>
                  <p className="text-xs text-slate-500 mt-1 dark:text-gray-400">You followed your trading plan perfectly for this trade.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <TradeShareModal 
        trade={trade} 
        currency={currencyCode} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
}
