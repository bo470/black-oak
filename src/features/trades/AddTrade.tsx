import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { MARKET_TYPES, EMOTIONS, CURRENCIES } from "@/src/constants";
import { calculatePL, cn, formatCurrency, formatRR } from "@/src/lib/utils";
import { 
  Save, X, Calculator, Plus, Minus, 
  TrendingUp, TrendingDown, Info, AlertCircle, 
  CheckCircle2, Camera, Tag, Smile, Loader2, FileText,
  Upload, Trash2, DollarSign, Zap, Activity, BarChart3,
  Coins, Globe, Search
} from "lucide-react";
import { useTrades } from "./TradeContext";
import { useAuth } from "../auth/AuthContext";
import { storage } from "@/src/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { SelectionGroup } from "@/src/components/ui/SelectionGroup";
import { Paywall } from "@/src/components/Paywall";
import { SymbolSelector, SymbolData } from "@/src/components/ui/SymbolSelector";
import { Lock } from "lucide-react";

export function AddTrade() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addTrade, updateTrade, trades } = useTrades();
  const { profile, user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [isSymbolSelectorOpen, setIsSymbolSelectorOpen] = React.useState(false);
  const [symbolError, setSymbolError] = React.useState<string | null>(null);
  const [paywall, setPaywall] = React.useState<{ isOpen: boolean; feature: string; plan: 'PRO' | 'ELITE' }>({
    isOpen: false,
    feature: "",
    plan: 'PRO'
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    exitDate: new Date().toISOString().split('T')[0],
    exitTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    marketType: 'Stocks',
    symbol: '',
    symbolMetadata: null as SymbolData | null,
    direction: 'Long',
    setupType: '',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    targetPrice: '',
    quantity: '',
    riskAmount: '',
    leverage: '1',
    margin: '0',
    fees: '0',
    currency: profile?.currency || 'USD',
    netPL: '0',
    roi: '0',
    rrRatio: '1',
    notes: '',
    emotionBefore: 'Neutral',
    emotionAfter: 'Neutral',
    confidence: '5',
    ruleFollowed: true,
    tags: [] as string[],
    isDraft: false,
    mistakes: '',
    learnings: '',
    screenshotURL: '',
  });

  React.useEffect(() => {
    if (!id && profile?.currency) {
      setFormData(prev => ({ ...prev, currency: profile.currency }));
    }
  }, [profile?.currency, id]);

  React.useEffect(() => {
    if (id) {
      const trade = trades.find(t => t.id === id);
      if (trade) {
        setFormData({
          ...trade,
          date: trade.date ? trade.date.split('T')[0] : new Date().toISOString().split('T')[0],
          time: trade.time || '12:00',
          exitDate: trade.exitDate || trade.date.split('T')[0],
          exitTime: trade.exitTime || trade.time || '12:00',
          entryPrice: trade.entryPrice.toString(),
          exitPrice: trade.exitPrice.toString(),
          quantity: trade.quantity.toString(),
          stopLoss: trade.stopLoss?.toString() || '',
          targetPrice: trade.targetPrice?.toString() || '',
          fees: trade.fees.toString(),
          confidence: trade.confidence.toString(),
          mistakes: trade.mistakes || '',
          learnings: trade.learnings || '',
        } as any);
      }
    }
  }, [id, trades]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCalculate = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    const fees = parseFloat(formData.fees);
    const sl = parseFloat(formData.stopLoss);
    const target = parseFloat(formData.targetPrice);

    if (entry && exit && qty) {
      const { net, roi } = calculatePL(formData.direction as 'Long' | 'Short', entry, exit, qty, fees);
      
      let rr = parseFloat(formData.rrRatio);
      if (sl && target) {
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(target - entry);
        rr = reward / risk;
      }

      setFormData(prev => ({
        ...prev,
        netPL: net.toString(),
        roi: roi.toFixed(2),
        rrRatio: formatRR(rr)
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `trades/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, screenshotURL: url }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (isDraft: boolean = false) => {
    // Validate Symbol
    if (!formData.symbol) {
      setSymbolError("Please select a symbol.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSymbolError(null);

    // Check trade limit for FREE plan
    if (!id && profile?.plan === 'FREE') {
      const now = new Date();
      const currentMonthTrades = trades.filter(t => {
        const tradeDate = new Date(t.date);
        return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
      });

      if (currentMonthTrades.length >= 50) {
        setPaywall({ isOpen: true, feature: "Unlimited Trade Logging", plan: 'PRO' });
        return;
      }
    }

    setLoading(true);
    try {
      const netPL = parseFloat(formData.netPL) || 0;
      const roi = parseFloat(formData.roi) || 0;
      const rrRatio = parseFloat(formData.rrRatio) || 0;
      
      const tradeData = {
        ...formData,
        marketType: formData.marketType as any,
        direction: formData.direction as any,
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: parseFloat(formData.exitPrice) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
        fees: parseFloat(formData.fees) || 0,
        riskAmount: parseFloat(formData.riskAmount) || 0,
        leverage: parseFloat(formData.leverage) || 1,
        margin: parseFloat(formData.margin) || 0,
        confidence: parseFloat(formData.confidence) || 5,
        emotionBefore: formData.emotionBefore as any,
        emotionAfter: formData.emotionAfter as any,
        netPL,
        roi,
        rrRatio,
        status: (netPL >= 0 ? "Win" : "Loss") as 'Win' | 'Loss',
        date: `${formData.date}T${formData.time}`,
        isDraft,
      };

      if (id) {
        await updateTrade(id, tradeData);
      } else {
        await addTrade(tradeData as any);
      }
      
      // Navigate immediately as onSnapshot in TradeContext will handle the background data sync
      navigate("/journal");
    } catch (err) {
      console.error("Failed to save trade:", err);
      alert("Failed to save trade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">
          {id ? "Edit Trade" : "Add New Trade"}
        </h1>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trade Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entry Date" type="date" name="date" value={formData.date} onChange={handleInputChange} />
                <Input label="Entry Time" type="time" name="time" value={formData.time} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Exit Date" type="date" name="exitDate" value={formData.exitDate} onChange={handleInputChange} />
                <Input label="Exit Time" type="time" name="exitTime" value={formData.exitTime} onChange={handleInputChange} />
              </div>
              <CustomSelect
                label="Currency"
                options={CURRENCIES.map(c => ({
                  id: c.code,
                  label: `${c.code} (${c.symbol})`,
                  icon: <DollarSign className="h-4 w-4" />
                }))}
                value={formData.currency}
                onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
              />

              <div className="grid grid-cols-1 gap-1.5 focus-within:z-[50]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-gray-500">
                  Symbol
                </label>
                <div 
                  onClick={() => setIsSymbolSelectorOpen(true)}
                  className={cn(
                    "flex flex-col h-[72px] w-full justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all hover:bg-slate-50 hover:border-blue-500 cursor-pointer dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800/50",
                    symbolError && "border-red-500 ring-2 ring-red-500/10"
                  )}
                >
                  {formData.symbol ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-900 dark:bg-gray-800 dark:text-white uppercase transition-colors group-hover:bg-blue-500 group-hover:text-white">
                        {formData.symbol.substring(0, 1)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 dark:text-white text-lg leading-none">{formData.symbol}</span>
                          {formData.symbolMetadata?.exchange && (
                            <span className="text-[10px] font-black text-white px-1.5 py-0.5 rounded bg-blue-500 uppercase tracking-tighter">
                              {formData.symbolMetadata.exchange}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">
                          {formData.symbolMetadata?.name || "Selected Symbol"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Select a symbol to trade...</span>
                      <Search className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                </div>
                {symbolError && (
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1 ml-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {symbolError}
                  </p>
                )}
              </div>
              
              <CustomSelect
                label="Direction"
                options={[
                  { id: 'Long', label: 'Long / Buy', icon: <TrendingUp className="h-4 w-4" /> },
                  { id: 'Short', label: 'Short / Sell', icon: <TrendingDown className="h-4 w-4" /> }
                ]}
                value={formData.direction}
                onChange={(val) => setFormData(prev => ({ ...prev, direction: val as 'Long' | 'Short' }))}
              />

              <CustomSelect
                label="Market Type"
                options={MARKET_TYPES.map(m => ({
                  id: m,
                  label: m,
                  icon: m === 'Stocks' ? <Activity className="h-4 w-4" /> : 
                        m === 'Crypto' ? <Coins className="h-4 w-4" /> : 
                        m === 'Forex' ? <Globe className="h-4 w-4" /> : 
                        <BarChart3 className="h-4 w-4" />
                }))}
                value={formData.marketType}
                onChange={(val) => setFormData(prev => ({ ...prev, marketType: val }))}
              />

              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="R:R Ratio (1:X)" 
                  type="number" 
                  step="0.1"
                  name="rrRatio" 
                  value={formData.rrRatio} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Leverage" type="number" name="leverage" value={formData.leverage} onChange={handleInputChange} />
                <Input label="Margin Used" type="number" name="margin" value={formData.margin} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Stop Loss" type="number" name="stopLoss" value={formData.stopLoss} onChange={handleInputChange} />
                <Input label="Target Price" type="number" name="targetPrice" value={formData.targetPrice} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entry Price" type="number" name="entryPrice" value={formData.entryPrice} onChange={handleInputChange} />
                <Input label="Exit Price" type="number" name="exitPrice" value={formData.exitPrice} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} />
                <Input label="Fees / Brokerage" type="number" name="fees" value={formData.fees} onChange={handleInputChange} />
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-gray-800">
                <Input label="Manual Net P/L Adjustment" type="number" name="netPL" value={formData.netPL} onChange={handleInputChange} />
                <p className="text-[10px] text-slate-400 mt-1 dark:text-gray-500">Calculated automatically, but you can override it here.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Psychology & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <CustomSelect
                  label="Emotion Before"
                  options={EMOTIONS.map(e => ({
                    id: e,
                    label: e,
                    icon: <Smile className="h-4 w-4" />
                  }))}
                  value={formData.emotionBefore}
                  onChange={(val) => setFormData(prev => ({ ...prev, emotionBefore: val as any }))}
                />
                <CustomSelect
                  label="Emotion After"
                  options={EMOTIONS.map(e => ({
                    id: e,
                    label: e,
                    icon: <Smile className="h-4 w-4" />
                  }))}
                  value={formData.emotionAfter}
                  onChange={(val) => setFormData(prev => ({ ...prev, emotionAfter: val as any }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider dark:text-gray-500">Confidence (1-10)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  name="confidence" 
                  value={formData.confidence} 
                  onChange={handleInputChange}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-800"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider dark:text-gray-500">Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="What was your reasoning? Any mistakes?"
                  className="flex w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider dark:text-gray-500">Mistakes</label>
                  <textarea 
                    name="mistakes" 
                    value={formData.mistakes} 
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Any rules broken?"
                    className="flex w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider dark:text-gray-500">Learnings</label>
                  <textarea 
                    name="learnings" 
                    value={formData.learnings} 
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="What did you learn?"
                    className="flex w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Calculations & Actions */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-500/20 dark:bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 dark:text-gray-500">Net P/L</span>
                <span className={cn(
                  "text-lg font-bold",
                  parseFloat(formData.netPL) >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {formatCurrency(parseFloat(formData.netPL), formData.currency, true)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 dark:text-gray-500">ROI</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parseFloat(formData.roi).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 dark:text-gray-500">R:R Ratio</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">1:{formatRR(parseFloat(formData.rrRatio))}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={handleCalculate}>
                Recalculate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              
              {formData.screenshotURL ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800">
                  <img 
                    src={formData.screenshotURL} 
                    alt="Trade Screenshot" 
                    className="w-full h-48 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Change
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setFormData(prev => ({ ...prev, screenshotURL: '' }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-slate-300 transition-colors cursor-pointer dark:border-gray-800 dark:hover:border-gray-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  ) : (
                    <Camera className="h-8 w-8 text-slate-400 mb-2 dark:text-gray-600" />
                  )}
                  <p className="text-xs text-slate-400 text-center dark:text-gray-500">
                    {uploading ? "Uploading..." : "Upload trade screenshot (Max 3MB)"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full h-12" onClick={() => handleSave(false)} disabled={loading}>
              <Save className="mr-2 h-5 w-5" />
              {loading ? "Saving..." : id ? "Update Trade" : "Save Trade"}
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => handleSave(true)} disabled={loading}>
              <FileText className="mr-2 h-5 w-5" />
              Save as Draft
            </Button>
            {!id && (
              <Button variant="ghost" className="w-full text-slate-400 dark:text-gray-500" onClick={() => setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', quantity: '' })} disabled={loading}>
                Reset Form
              </Button>
            )}
          </div>
        </div>
      </div>
      <SymbolSelector
        isOpen={isSymbolSelectorOpen}
        onClose={() => setIsSymbolSelectorOpen(false)}
        onSelect={(data) => {
          setFormData(prev => ({
            ...prev,
            symbol: data.symbol,
            symbolMetadata: data,
            marketType: data.marketType || prev.marketType
          }));
          setSymbolError(null);
        }}
        currentValue={formData.symbol}
      />
      <Paywall 
        isOpen={paywall.isOpen} 
        onClose={() => setPaywall({ ...paywall, isOpen: false })} 
        featureName={paywall.feature} 
        requiredPlan={paywall.plan} 
      />
    </div>
  );
}
