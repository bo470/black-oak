import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Broker {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

const INDIAN_BROKERS: Broker[] = [
  { 
    id: 'zerodha', 
    name: 'Zerodha (Kite)', 
    logo: 'https://kite.zerodha.com/static/images/kite-logo.svg',
    status: 'disconnected' 
  },
  { 
    id: 'upstox', 
    name: 'Upstox', 
    logo: 'https://upstox.com/app/themes/upstox/dist/img/logo/upstox-logo.svg',
    status: 'disconnected' 
  },
  { 
    id: 'angelone', 
    name: 'Angel One', 
    logo: 'https://www.angelone.in/static/images/logo.svg',
    status: 'disconnected' 
  },
];

export function BrokerConnection() {
  const [brokers, setBrokers] = React.useState<Broker[]>(INDIAN_BROKERS);
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null);

  const handleConnect = (brokerId: string) => {
    setIsConnecting(brokerId);
    // Mock connection process
    setTimeout(() => {
      setBrokers(prev => prev.map(b => 
        b.id === brokerId ? { ...b, status: 'connected', lastSync: new Date().toISOString() } : b
      ));
      setIsConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (brokerId: string) => {
    setBrokers(prev => prev.map(b => 
      b.id === brokerId ? { ...b, status: 'disconnected', lastSync: undefined } : b
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Broker Connections</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Sync your trades automatically from Indian stock brokers</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Zap className="mr-1 h-3 w-3" />
          Auto-Sync Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {brokers.map((broker) => (
          <Card key={broker.id} className={cn(
            "overflow-hidden transition-all duration-200",
            broker.status === 'connected' ? "border-emerald-500/30 bg-emerald-500/5" : "hover:border-slate-300 dark:hover:border-gray-700"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 dark:bg-gray-800 dark:border-gray-700">
                    <img 
                      src={broker.logo} 
                      alt={broker.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${broker.name}&background=random`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{broker.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {broker.status === 'connected' ? (
                        <>
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-wider dark:text-emerald-500">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Connected
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500">•</span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                            Last sync: {new Date(broker.lastSync!).toLocaleTimeString()}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-gray-500">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Not Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {broker.status === 'connected' ? (
                    <>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDisconnect(broker.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleConnect(broker.id)}
                      disabled={isConnecting !== null}
                    >
                      {isConnecting === broker.id ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                      )}
                      {isConnecting === broker.id ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-600 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="h-24 w-24" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Secure API Integration</h4>
              <p className="text-sm text-blue-100 mt-1">
                We use official broker APIs and secure OAuth flows. Your login credentials are never stored on our servers. All data is encrypted and synced directly to your journal.
              </p>
              <Button variant="secondary" className="mt-4 bg-white text-blue-600 hover:bg-blue-50">
                Learn more about security
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
