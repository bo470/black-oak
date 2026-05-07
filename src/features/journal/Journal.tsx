import * as React from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { formatCurrency, cn, formatRR } from "@/src/lib/utils";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Calendar, Tag, Smile, MoreVertical, Loader2, X, RotateCcw, Download, Edit2, Trash2, FileText, Globe, Cpu, Activity, Zap, TrendingUp, Check } from "lucide-react";
import { useTrades } from "../trades/TradeContext";
import { useAuth } from "../auth/AuthContext";
import { MARKET_TYPES } from "@/src/constants";
import { exportTradesToCSV } from "@/src/lib/csvExport";
import { TradeDetail } from "./TradeDetail";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Trade } from "@/src/types";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { SelectionGroup } from "@/src/components/ui/SelectionGroup";
import { TradeReminder } from "@/src/components/TradeReminder";
import { Paywall } from "@/src/components/Paywall";
import { Lock } from "lucide-react";

const TradeCard = React.memo(({ trade, currencyCode, onSelect, onEdit, onDelete, onSaveAsDraft, activeMenu, setActiveMenu }: {
  trade: Trade;
  currencyCode: string;
  onSelect: (t: Trade) => void;
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
  onSaveAsDraft: (t: Trade) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all animate-in fade-in slide-in-from-bottom-2"
      onClick={() => onSelect(trade)}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Status & Basic Info */}
          <div className={cn(
            "flex items-center space-x-4 p-4 md:w-1/3",
            trade.status === 'Win' ? "bg-emerald-500/5 dark:bg-emerald-500/10" : "bg-red-500/5 dark:bg-red-500/10"
          )}>
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" : "bg-red-500/10 text-red-500 dark:bg-red-500/20"
            )}>
              {trade.direction === 'Long' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{trade.symbol}</h3>
                <div className="flex items-center space-x-2">
                  {trade.isDraft && <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400">Draft</Badge>}
                  <Badge variant={trade.status === 'Win' ? 'success' : 'danger'}>{trade.status}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 dark:text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(trade.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{trade.marketType}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Metrics & Actions */}
          <div className="flex flex-1 items-center justify-between p-4 md:border-l md:border-slate-100 dark:md:border-gray-800">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">P/L</p>
                <p className={cn(
                  "text-sm font-bold",
                  trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                )}>
                  {formatCurrency(trade.netPL, currencyCode, true)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">R:R</p>
                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">1:{formatRR(trade.rrRatio)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Setup</p>
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-blue-500" />
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-300">{trade.setupType || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Emotion</p>
                <div className="flex items-center space-x-1">
                  <Smile className="h-3 w-3 text-amber-500" />
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-300">{trade.emotionAfter || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === trade.id ? null : trade.id);
                }}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>

              {activeMenu === trade.id && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl z-10 py-2 dark:bg-gray-900 dark:border-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    onClick={() => onEdit(trade)}
                  >
                    <Edit2 className="mr-3 h-4 w-4 text-blue-500" />
                    {t.editTrade}
                  </button>
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    onClick={() => onSaveAsDraft(trade)}
                  >
                    <FileText className="mr-3 h-4 w-4 text-amber-500" />
                    {t.saveAsDraft}
                  </button>
                  <div className="h-px bg-slate-100 my-1 dark:bg-gray-800" />
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={() => onDelete(trade.id)}
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    {t.deleteTrade}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

import { useTranslation } from "@/src/hooks/useTranslation";

export function Journal() {
  const navigate = useNavigate();
  const { trades, loading, hasMore, loadMore, deleteTrade, updateTrade } = useTrades();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [paywall, setPaywall] = React.useState<{ isOpen: boolean; feature: string; plan: 'PRO' | 'ELITE' }>({
    isOpen: false,
    feature: "",
    plan: 'PRO'
  });

  const isPro = profile?.plan === 'PRO' || profile?.plan === 'ELITE';

  const checkAccess = (feature: string, plan: 'PRO' | 'ELITE' = 'PRO') => {
    if (plan === 'PRO' && !isPro) {
      setPaywall({ isOpen: true, feature, plan });
      return false;
    }
    return true;
  };

  const currencyCode = profile?.currency || 'USD';
  const [search, setSearch] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [tradeToDelete, setTradeToDelete] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    marketType: 'All',
    direction: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });

  const filteredTrades = React.useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(search.toLowerCase()) || 
                           (trade.setupType && trade.setupType.toLowerCase().includes(search.toLowerCase()));
      
      const matchesMarket = filters.marketType === "All" || trade.marketType === filters.marketType;
      const matchesDirection = filters.direction === "All" || trade.direction === filters.direction;
      const matchesStatus = filters.status === "All" || trade.status === filters.status;
      
      let matchesDate = true;
      if (filters.startDate) {
        const tradeDate = new Date(trade.date);
        tradeDate.setHours(0, 0, 0, 0);
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && tradeDate >= start;
      }
      if (filters.endDate) {
        const tradeDate = new Date(trade.date);
        tradeDate.setHours(0, 0, 0, 0);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && tradeDate <= end;
      }

      return matchesSearch && matchesMarket && matchesDirection && matchesStatus && matchesDate;
    });
  }, [trades, search, filters]);

  const resetFilters = () => {
    setFilters({
      marketType: 'All',
      direction: 'All',
      status: 'All',
      startDate: '',
      endDate: '',
    });
    setSearch("");
  };

  const handleExport = () => {
    exportTradesToCSV(trades);
  };

  const handleEdit = (trade: Trade) => {
    navigate(`/edit-trade/${trade.id}`);
  };

  const handleDelete = async (id: string) => {
    setTradeToDelete(id);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (tradeToDelete) {
      await deleteTrade(tradeToDelete);
      setTradeToDelete(null);
      if (selectedTrade?.id === tradeToDelete) {
        setSelectedTrade(null);
      }
    }
  };

  const handleSaveAsDraft = async (trade: Trade) => {
    await updateTrade(trade.id, { isDraft: true });
    setActiveMenu(null);
  };

  if (loading && trades.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <TradeReminder />
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">{t.tradeHistory}</h1>
          <p className="text-slate-500 dark:text-gray-400">{t.journalSubtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={showFilters ? "primary" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? t.hideFilters : t.showFilters}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="relative"
            onClick={() => checkAccess("Export CSV") && handleExport()}
          >
            <Download className="mr-2 h-4 w-4" />
            {t.exportData}
            {!isPro && <Lock className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full p-0.5 text-slate-400 border border-slate-100 shadow-sm" />}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-slate-200 bg-white/40 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/40">
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomSelect
                label="Market Type"
                options={[
                  { id: 'All', label: 'All Markets', icon: <Filter className="h-4 w-4" /> },
                  { id: 'Stocks', label: 'Stocks', icon: <TrendingUp className="h-4 w-4" /> },
                  { id: 'Options', label: 'Options', icon: <Zap className="h-4 w-4" /> },
                  { id: 'Futures', label: 'Futures', icon: <Activity className="h-4 w-4" /> },
                  { id: 'Forex', label: 'Forex', icon: <Globe className="h-4 w-4" /> },
                  { id: 'Crypto', label: 'Crypto', icon: <Cpu className="h-4 w-4" /> },
                ]}
                value={filters.marketType}
                onChange={(val) => setFilters({...filters, marketType: val})}
              />

              <CustomSelect
                label="Direction"
                options={[
                  { id: 'All', label: 'All', icon: <Filter className="h-4 w-4" /> },
                  { id: 'Long', label: 'Long', icon: <ArrowUpRight className="h-4 w-4" /> },
                  { id: 'Short', label: 'Short', icon: <ArrowDownRight className="h-4 w-4" /> },
                ]}
                value={filters.direction}
                onChange={(val) => setFilters({...filters, direction: val})}
              />

              <CustomSelect
                label="Status"
                options={[
                  { id: 'All', label: 'All', icon: <Filter className="h-4 w-4" /> },
                  { id: 'Win', label: 'Win', icon: <Check className="h-4 w-4" /> },
                  { id: 'Loss', label: 'Loss', icon: <X className="h-4 w-4" /> },
                  { id: 'Breakeven', label: 'B/E', icon: <RotateCcw className="h-4 w-4" /> },
                ]}
                value={filters.status}
                onChange={(val) => setFilters({...filters, status: val})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] dark:text-gray-500">Start Date</label>
                <Input 
                  type="date" 
                  className="h-12 rounded-2xl"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] dark:text-gray-500">End Date</label>
                <Input 
                  type="date" 
                  className="h-12 rounded-2xl"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-gray-800">
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Showing <span className="text-slate-900 font-bold dark:text-white">{filteredTrades.length}</span> of <span className="text-slate-900 font-bold dark:text-white">{trades.length}</span> trades
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
                <RotateCcw className="mr-2 h-3 w-3" />
                {t.resetFilters}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
        <Input 
          placeholder={t.searchTrades} 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Trades List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTrades.map((trade) => (
          <TradeCard 
            key={trade.id} 
            trade={trade} 
            currencyCode={currencyCode}
            onSelect={setSelectedTrade}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveAsDraft={handleSaveAsDraft}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-8">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
            className="w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Trades"
            )}
          </Button>
        </div>
      )}

      {filteredTrades.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-gray-900">
            <Search className="h-10 w-10 text-slate-300 dark:text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.noTradesFound}</h3>
          <p className="text-slate-500 mt-2 dark:text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Trade Detail Modal */}
      <AnimatePresence>
        {selectedTrade && (
          <TradeDetail 
            trade={selectedTrade} 
            onClose={() => setSelectedTrade(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveAsDraft={handleSaveAsDraft}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tradeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md border-red-500/20 bg-white shadow-2xl dark:bg-gray-900">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.deleteModalTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{t.deleteModalText}</p>
                  </div>
                  <div className="flex w-full space-x-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setTradeToDelete(null)}>
                      {t.cancel}
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                      {t.confirmDelete}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AnimatePresence>

      <Paywall 
        isOpen={paywall.isOpen} 
        onClose={() => setPaywall({ ...paywall, isOpen: false })} 
        featureName={paywall.feature} 
        requiredPlan={paywall.plan} 
      />
    </div>
  );
}
