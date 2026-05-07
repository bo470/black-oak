import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Bell, Moon, Sun, Shield, Globe, CreditCard, HelpCircle, Info, LogOut, Zap, Crown } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { cn } from "@/src/lib/utils";
import { Pricing } from "./Pricing";
import { useLocation } from "react-router-dom";

export function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'pricing' ? 'pricing' : 'settings';
  
  const [activeTab, setActiveTab] = React.useState<'settings' | 'pricing'>(initialTab);
  const theme = profile?.theme || 'dark';
  const [notifications, setNotifications] = React.useState(true);
  const [frequency, setFrequency] = React.useState("Medium");

  React.useEffect(() => {
    if (queryParams.get('tab') === 'pricing') {
      setActiveTab('pricing');
    }
  }, [location.search]);

  const toggleTheme = async (newTheme: 'light' | 'dark') => {
    try {
      await updateProfile({ theme: newTheme });
    } catch (err) {
      console.error("Failed to update theme:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">Settings</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl dark:bg-gray-900">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'settings' ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-white" : "text-slate-500"
            )}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('pricing')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'pricing' ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-white" : "text-slate-500"
            )}
          >
            Subscription
          </button>
        </div>
      </div>

      {activeTab === 'pricing' ? (
        <Pricing />
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-gray-900/50 dark:border-gray-800">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    profile?.plan === 'ELITE' ? "bg-amber-500 text-white" :
                    profile?.plan === 'PRO' ? "bg-blue-600 text-white" :
                    "bg-slate-200 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {profile?.plan === 'ELITE' ? <Crown className="h-6 w-6" /> :
                     profile?.plan === 'PRO' ? <Zap className="h-6 w-6" /> :
                     <CreditCard className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {profile?.plan || 'FREE'} PLAN
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {profile?.subscriptionStatus === 'active' ? 'Active until ' + new Date(profile?.subscriptionExpiry || 0).toLocaleDateString() : 'No active subscription'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('pricing')}>
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Theme</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Choose your preferred interface style</p>
              </div>
            </div>
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 border border-slate-200 dark:bg-gray-900 dark:border-gray-800">
              <Button 
                variant={theme === "light" ? "primary" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => toggleTheme("light")}
              >
                Light
              </Button>
              <Button 
                variant={theme === "dark" ? "primary" : "ghost"} 
                size="sm" 
                className="h-8"
                onClick={() => toggleTheme("dark")}
              >
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Receive alerts on your device</p>
              </div>
            </div>
            <div 
              className={cn(
                "h-6 w-11 rounded-full relative cursor-pointer transition-colors",
                notifications ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-800"
              )}
              onClick={() => setNotifications(!notifications)}
            >
              <div className={cn(
                "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
                notifications ? "right-1" : "left-1"
              )} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest dark:text-gray-500">Frequency</p>
            <div className="grid grid-cols-3 gap-2">
              {["Low", "Medium", "High"].map((f) => (
                <Button
                  key={f}
                  variant={frequency === f ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFrequency(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-white">Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <Shield className="mr-3 h-5 w-5 text-emerald-500" />
              <span>Change Password</span>
            </div>
            <Badge variant="secondary">Secure</Badge>
          </Button>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <Globe className="mr-3 h-5 w-5 text-blue-500" />
              <span>Privacy Settings</span>
            </div>
            <Badge variant="secondary">Public</Badge>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-white">Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="mr-3 h-5 w-5 text-purple-500" />
            <span>Help Center</span>
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Info className="mr-3 h-5 w-5 text-slate-400 dark:text-gray-500" />
            <span>About Black Oak</span>
          </Button>
        </CardContent>
      </Card>

      <Button variant="danger" className="w-full h-12" onClick={signOut}>
        <LogOut className="mr-2 h-5 w-5" />
        Sign Out
      </Button>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest dark:text-gray-600">
        Version 1.0.4 (Build 20240330)
      </p>
    </div>
    )}
    </div>
  );
}
