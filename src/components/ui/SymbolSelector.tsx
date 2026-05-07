import * as React from "react";
import { 
  Search, Globe, Bitcoin, TrendingUp, ChevronLeft, 
  Check, Info, MapPin, Building2, CircleDollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

export type MarketType = 'Stocks' | 'Crypto' | 'Forex';
export type CountryCode = 'India' | 'US' | 'UK' | 'Other';

export interface SymbolData {
  symbol: string;
  name: string;
  marketType: MarketType;
  country?: CountryCode;
  exchange?: string;
  logo?: string;
}

const MOCK_DATA: SymbolData[] = [
  // India Stocks
  { symbol: "RELIANCE", name: "Reliance Industries", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "TCS", name: "Tata Consultancy Services", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "HDFCBANK", name: "HDFC Bank", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "INFY", name: "Infosys", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "ICICIBANK", name: "ICICI Bank", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "SBIN", name: "State Bank of India", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "ITC", name: "ITC", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "TATAMOTORS", name: "Tata Motors", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "LT", name: "Larsen & Toubro", marketType: "Stocks", country: "India", exchange: "NSE" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", marketType: "Stocks", country: "India", exchange: "NSE" },
  
  // US Stocks
  { symbol: "AAPL", name: "Apple Inc.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "Nvidia Corp.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla, Inc.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms, Inc.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", marketType: "Stocks", country: "US", exchange: "NASDAQ" },
  
  // UK Stocks
  { symbol: "HSBA", name: "HSBC Holdings", marketType: "Stocks", country: "UK", exchange: "LSE" },
  { symbol: "BP", name: "BP p.l.c.", marketType: "Stocks", country: "UK", exchange: "LSE" },
  { symbol: "GSK", name: "GSK plc", marketType: "Stocks", country: "UK", exchange: "LSE" },
  { symbol: "VOD", name: "Vodafone Group", marketType: "Stocks", country: "UK", exchange: "LSE" },
  
  // Crypto
  { symbol: "BTC", name: "Bitcoin", marketType: "Crypto" },
  { symbol: "ETH", name: "Ethereum", marketType: "Crypto" },
  { symbol: "SOL", name: "Solana", marketType: "Crypto" },
  { symbol: "BNB", name: "Binance Coin", marketType: "Crypto" },
  { symbol: "XRP", name: "XRP", marketType: "Crypto" },
  { symbol: "DOGE", name: "Dogecoin", marketType: "Crypto" },
  
  // Forex
  { symbol: "EUR/USD", name: "Euro vs US Dollar", marketType: "Forex" },
  { symbol: "GBP/USD", name: "British Pound vs US Dollar", marketType: "Forex" },
  { symbol: "USD/JPY", name: "US Dollar vs Japanese Yen", marketType: "Forex" },
  { symbol: "USD/INR", name: "US Dollar vs Indian Rupee", marketType: "Forex" },
  { symbol: "AUD/USD", name: "Australian Dollar vs US Dollar", marketType: "Forex" },
  { symbol: "USD/CAD", name: "US Dollar vs Canadian Dollar", marketType: "Forex" },
  { symbol: "XAU/USD", name: "Gold vs US Dollar", marketType: "Forex" },
];

interface SymbolSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: SymbolData) => void;
  currentValue?: string;
}

type Step = 'MARKET_TYPE' | 'COUNTRY' | 'SEARCH' | 'MANUAL';

export function SymbolSelector({ isOpen, onClose, onSelect, currentValue }: SymbolSelectorProps) {
  const [step, setStep] = React.useState<Step>('MARKET_TYPE');
  const [selectedMarket, setSelectedMarket] = React.useState<MarketType | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [manualData, setManualData] = React.useState({ country: "", name: "", symbol: "" });

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setStep('MARKET_TYPE');
      setSelectedMarket(null);
      setSelectedCountry(null);
      setSearchQuery("");
      setManualData({ country: "", name: "", symbol: "" });
    }
  }, [isOpen]);

  const filteredSymbols = React.useMemo(() => {
    return MOCK_DATA.filter(item => {
      const matchesMarket = item.marketType === selectedMarket;
      const matchesCountry = selectedMarket === 'Stocks' ? item.country === selectedCountry : true;
      const matchesSearch = searchQuery.trim() === "" || 
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesMarket && matchesCountry && matchesSearch;
    });
  }, [selectedMarket, selectedCountry, searchQuery]);

  const handleBack = () => {
    if (step === 'COUNTRY') setStep('MARKET_TYPE');
    else if (step === 'SEARCH') {
      if (selectedMarket === 'Stocks') setStep('COUNTRY');
      else setStep('MARKET_TYPE');
    }
    else if (step === 'MANUAL') setStep('COUNTRY');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'MARKET_TYPE': return "Select Market Type";
      case 'COUNTRY': return "Select Country";
      case 'SEARCH': return `Search ${selectedMarket}`;
      case 'MANUAL': return "Manual Entry";
      default: return "Choose Symbol";
    }
  };

  const renderMarketType = () => (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={() => {
          setSelectedMarket('Stocks');
          setStep('COUNTRY');
        }}
        className="flex items-center space-x-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/10 dark:hover:border-blue-500/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">Stocks</h4>
          <p className="text-sm text-slate-500 dark:text-gray-400">Equities from various global exchanges</p>
        </div>
      </button>

      <button
        onClick={() => {
          setSelectedMarket('Crypto');
          setStep('SEARCH');
        }}
        className="flex items-center space-x-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/10 dark:hover:border-blue-500/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Bitcoin className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">Crypto</h4>
          <p className="text-sm text-slate-500 dark:text-gray-400">Cryptocurrencies and digital assets</p>
        </div>
      </button>

      <button
        onClick={() => {
          setSelectedMarket('Forex');
          setStep('SEARCH');
        }}
        className="flex items-center space-x-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/10 dark:hover:border-blue-500/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CircleDollarSign className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">Forex</h4>
          <p className="text-sm text-slate-500 dark:text-gray-400">Global currency pairs and metals</p>
        </div>
      </button>
    </div>
  );

  const renderCountry = () => (
    <div className="grid grid-cols-1 gap-3">
      {['India', 'US', 'UK', 'Other'].map((country) => (
        <button
          key={country}
          onClick={() => {
            if (country === 'Other') {
              setStep('MANUAL');
            } else {
              setSelectedCountry(country as CountryCode);
              setStep('SEARCH');
            }
          }}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-500 dark:border-gray-800 dark:bg-gray-800/10"
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 dark:bg-gray-800 dark:text-gray-400">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{country}</span>
          </div>
          <Check className={cn("h-5 w-5 text-blue-500 opacity-0", selectedCountry === country && "opacity-100")} />
        </button>
      ))}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
        <Input
          autoFocus
          placeholder={`Search ${selectedMarket === 'Stocks' ? selectedCountry : selectedMarket}...`}
          className="pl-10 h-12 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="max-h-[350px] overflow-y-auto space-y-2 custom-scrollbar">
        {filteredSymbols.length > 0 ? filteredSymbols.map((item) => (
          <button
            key={item.symbol}
            onClick={() => {
              onSelect(item);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-900 dark:bg-gray-800 dark:text-white uppercase">
                {item.symbol.substring(0, 1)}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 dark:text-white">{item.symbol}</span>
                  {item.exchange && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-1 rounded dark:bg-gray-800 dark:text-gray-500">
                      {item.exchange}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[180px]">
                  {item.name}
                </div>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-blue-500/10 dark:text-blue-400">
              <Check className="h-4 w-4" />
            </div>
          </button>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center dark:bg-gray-800 mb-3">
              <Search className="h-8 w-8 text-slate-300 dark:text-gray-700" />
            </div>
            <p className="text-slate-500 dark:text-gray-400">No matching symbols found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderManual = () => (
    <div className="space-y-4">
      <Input
        label="Country Name"
        placeholder="e.g. Germany"
        value={manualData.country}
        onChange={(e) => setManualData({ ...manualData, country: e.target.value })}
      />
      <Input
        label="Stock/Company Name"
        placeholder="e.g. Volkswagen"
        value={manualData.name}
        onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
      />
      <Input
        label="Symbol"
        placeholder="e.g. VOW3"
        value={manualData.symbol}
        onChange={(e) => setManualData({ ...manualData, symbol: e.target.value.toUpperCase() })}
      />
      
      <Button
        className="w-full h-12 rounded-xl mt-4"
        disabled={!manualData.symbol || !manualData.name}
        onClick={() => {
          onSelect({
            symbol: manualData.symbol,
            name: manualData.name,
            marketType: 'Stocks',
            country: 'Other',
            exchange: manualData.country
          });
          onClose();
        }}
      >
        Continue with {manualData.symbol || "Manual Entry"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getStepTitle()}
      type="bottom-sheet"
    >
      <div className="pb-6">
        {step !== 'MARKET_TYPE' && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'MARKET_TYPE' && renderMarketType()}
            {step === 'COUNTRY' && renderCountry()}
            {step === 'SEARCH' && renderSearch()}
            {step === 'MANUAL' && renderManual()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}
