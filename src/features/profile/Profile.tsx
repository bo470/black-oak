import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { 
  User, Mail, MapPin, Camera, Save, 
  TrendingUp, Target, Zap, PlusCircle,
  LogOut, Settings, Bell, Globe, Loader2,
  Cpu, Link as LinkIcon, ChevronRight,
  Check, Moon, Sun, DollarSign, Info, Shield, BookOpen, AlertCircle,
  HelpCircle, MessageCircle, Languages
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTrades } from "../trades/TradeContext";
import { CURRENCIES } from "@/src/constants";
import { formatCurrency, cn } from "@/src/lib/utils";
import { BrokerConnection } from "./BrokerConnection";
import { motion, AnimatePresence } from "motion/react";
import { CustomSelect } from "@/src/components/ui/CustomSelect";
import { SelectionGroup } from "@/src/components/ui/SelectionGroup";
import { useTranslation } from "@/src/hooks/useTranslation";
import { LanguageCode } from "@/src/lib/translations";

export function Profile() {
  const { profile, updateProfile, signOut, loading } = useAuth();
  const { trades } = useTrades();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [showLockedHint, setShowLockedHint] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    city: "",
    photoURL: "",
    currency: "USD",
    theme: "dark" as "light" | "dark",
    language: "en-US" as LanguageCode,
    floatingChatbotEnabled: true,
  });

  const stats = React.useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalProfit: 0,
        winRate: 0,
        tradesCount: 0
      };
    }

    const totalProfit = trades.reduce((sum, t) => sum + (t.netPL || 0), 0);
    const wins = trades.filter(t => t.status === 'Win').length;
    const winRate = (wins / trades.length) * 100;
    const tradesCount = trades.length;

    return {
      totalProfit,
      winRate,
      tradesCount
    };
  }, [trades]);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        city: profile.city || "",
        photoURL: profile.photoURL || "",
        currency: profile.currency || "USD",
        theme: profile.theme || "dark",
        language: (profile.language as LanguageCode) || "en-US",
        floatingChatbotEnabled: profile.floatingChatbotEnabled ?? true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccessMessage(t.profileUpdated);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        city: profile.city || "",
        photoURL: profile.photoURL || "",
        currency: profile.currency || "USD",
        theme: profile.theme || "dark",
        language: (profile.language as LanguageCode) || "en-US",
        floatingChatbotEnabled: profile.floatingChatbotEnabled ?? true,
      });
    }
    setIsEditing(false);
  };

  const handleDisabledClick = () => {
    if (!isEditing) {
      setShowLockedHint(true);
      setTimeout(() => setShowLockedHint(false), 2000);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  if (showAdvanced) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowAdvanced(false)} className="rounded-full">
            <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
            {t.back}
          </Button>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t.settings}</h1>
        </div>
        
        <BrokerConnection />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-emerald-600/10 dark:from-blue-500/20 dark:to-emerald-500/20" />
        
        <div className="relative px-8 pt-12 pb-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative shrink-0">
            <div className="h-32 w-32 rounded-[2rem] border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-xl dark:border-gray-900 dark:bg-gray-800">
              {formData.photoURL ? (
                <img 
                  src={formData.photoURL} 
                  alt={formData.fullName} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <User className="h-12 w-12" />
                </div>
              )}
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  {profile.fullName || "Guest Trader"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                  <div className="flex items-center text-slate-500 text-sm dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {profile.city || "Global"}
                  </div>
                  <span className="text-slate-300 dark:text-gray-700 hidden md:inline">•</span>
                  <div className="flex items-center text-slate-500 text-sm dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    {profile.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                  {profile.traderTypes?.[0] || "Pro Trader"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 pt-8">
        {/* Left Column: Stats & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trading Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-gray-400">Total Profit</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                )}>
                  {formatCurrency(stats.totalProfit, profile.currency || '$', true)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-gray-400">Win Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-gray-400">Trades Count</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.tradesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="success" className="px-3 py-1">Consistency King</Badge>
              <Badge variant="warning" className="px-3 py-1">Risk Manager</Badge>
              <Badge variant="default" className="px-3 py-1">Early Bird</Badge>
              <Badge variant="secondary" className="px-3 py-1">Community Star</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base">{t.accountInfo}</CardTitle>
                  <AnimatePresence>
                    {showLockedHint && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"
                      >
                        Tap Edit to change
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {successMessage && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-500"
                    >
                      {successMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center space-x-2">
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    {t.cancel}
                  </Button>
                )}
                <Button 
                  variant={isEditing ? "success" : "outline"} 
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    <><Save className="mr-2 h-4 w-4" /> {t.save}</>
                  ) : (
                    <><Settings className="mr-2 h-4 w-4" /> {t.edit}</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6" onClick={handleDisabledClick}>
              <Input 
                label={t.fullName} 
                value={formData.fullName} 
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input 
                label={t.email} 
                type="email" 
                value={formData.email} 
                disabled={true} 
              />
              <Input 
                label={t.city} 
                value={formData.city} 
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <CustomSelect
                label={t.preferredCurrency}
                disabled={!isEditing}
                options={CURRENCIES.map(c => ({
                  id: c.code,
                  label: `${c.code} (${c.symbol})`,
                  icon: <DollarSign className="h-5 w-5" />
                }))}
                value={formData.currency}
                onChange={(val) => setFormData({ ...formData, currency: val })}
              />

              <CustomSelect
                label={t.appearance}
                disabled={!isEditing}
                options={[
                  { id: 'light', label: t.lightMode, icon: <Sun className="h-5 w-5" /> },
                  { id: 'dark', label: t.darkMode, icon: <Moon className="h-5 w-5" /> }
                ]}
                value={formData.theme}
                onChange={(val) => setFormData(prev => ({ ...prev, theme: val as 'light' | 'dark' }))}
              />

              <CustomSelect
                label={t.languagePreference}
                disabled={!isEditing}
                options={[
                  { id: 'en-US', label: 'English US', icon: <Languages className="h-5 w-5" /> },
                  { id: 'en-IN', label: 'English India', icon: <Languages className="h-5 w-5" /> },
                  { id: 'hinglish', label: 'Hinglish', icon: <Languages className="h-5 w-5" /> },
                  { id: 'hi-IN', label: 'Hindi (हिंदी)', icon: <Languages className="h-5 w-5" /> }
                ]}
                value={formData.language}
                onChange={(val) => setFormData(prev => ({ ...prev, language: val as LanguageCode }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">Get alerts for trade setups and community posts</p>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-blue-600 relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Floating Chatbot</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">Enable draggable AI assistant on all screens</p>
                  </div>
                </div>
                <div 
                  className={cn(
                    "h-6 w-11 rounded-full transition-colors relative cursor-pointer",
                    formData.floatingChatbotEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-gray-700"
                  )}
                  onClick={() => isEditing && setFormData({ ...formData, floatingChatbotEnabled: !formData.floatingChatbotEnabled })}
                >
                  <motion.div 
                    animate={{ x: formData.floatingChatbotEnabled ? 20 : 0 }}
                    className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Public Profile</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">Allow others to see your stats and performance</p>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-blue-600 relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-500/30 transition-all group" onClick={() => setShowAdvanced(true)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Cpu className="h-5 w-5 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Advanced Settings</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">Broker connections, API sync, and more</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Help Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 bg-blue-50/50 dark:border-blue-500/10 dark:bg-blue-500/5 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Documentation & FAQs</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Learn how to maximize your trading performance with our guides.</p>
                  <Button variant="ghost" className="p-0 h-auto mt-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider hover:bg-transparent">
                    Browse Guides <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Need support?</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">Our team is available to help with technical issues or billing questions.</p>
                <a 
                  href="mailto:businessconsulting59@gmail.com"
                  className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-mono">
                  businessconsulting59@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">More</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { label: "About Us", icon: Info },
                { label: "App Features", icon: Zap },
                { label: "Privacy Policy", icon: Shield },
                { label: "Disclaimers", icon: AlertCircle },
                { label: "Terms & Conditions", icon: BookOpen },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  className={cn(
                    "flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors dark:hover:bg-gray-800/50",
                    idx !== 4 && "border-b border-slate-100 dark:border-gray-800"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Button variant="danger" className="w-full h-12" onClick={signOut}>
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
