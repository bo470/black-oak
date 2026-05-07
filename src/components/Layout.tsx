import * as React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, BookOpen, BarChart3, User, Trophy, Users, MessageSquare, Settings, History } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ChatBot } from "./ChatBot";
import { useTranslation } from "@/src/hooks/useTranslation";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: "/" },
    { icon: BookOpen, label: t.journal, path: "/journal" },
    { icon: BarChart3, label: t.analytics, path: "/analytics" },
    { icon: History, label: t.backtesting, path: "/backtesting" },
    { icon: Users, label: t.community, path: "/community" },
  ];

  const secondaryNavItems = [
    { icon: User, label: t.profile, path: "/profile" },
    { icon: MessageSquare, label: t.messaging, path: "/messages" },
    { icon: Settings, label: t.settings, path: "/settings" },
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex === -1) return;

    if (direction === 'left' && currentIndex < navItems.length - 1) {
      navigate(navItems[currentIndex + 1].path);
    } else if (direction === 'right' && currentIndex > 0) {
      navigate(navItems[currentIndex - 1].path);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 pt-16 md:pt-0 md:pb-0 md:pl-64 transition-colors duration-200 dark:bg-black dark:text-slate-100 overflow-x-hidden">
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl transition-colors duration-200 dark:border-gray-800 dark:bg-black/80 md:hidden">
        <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
          BLACK <span className="text-blue-500">OAK</span>
        </span>
        <button 
          onClick={() => navigate("/profile")}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-90 z-[60]",
            location.pathname === "/profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-200 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          <User className="h-6 w-6" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-slate-200 bg-white/50 backdrop-blur-xl transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900/50 md:flex">
        <div className="flex h-16 items-center px-6">
          <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
            BLACK <span className="text-blue-500">OAK</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="my-4 border-t border-slate-200 dark:border-gray-800" />
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation - Redesigned */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:hidden pointer-events-none">
        <nav className="mx-auto flex max-w-lg items-center justify-between rounded-[2rem] bg-slate-900/95 backdrop-blur-2xl border border-white/10 px-2 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:bg-black/90 pointer-events-auto ring-1 ring-white/5">
          {navItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-1 flex-col items-center justify-center transition-all duration-300",
                  isActive ? "text-blue-500" : "text-slate-400 hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
                      isActive ? "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-transparent"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                    {item.label === t.journal && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                    )}
                  </motion.div>
                  <span className={cn("mt-1 text-[9px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-40")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Center FAB */}
          <NavLink
            to="/add-trade"
            className="group relative flex h-14 w-14 -translate-y-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.6)] active:scale-90 transition-all duration-300"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-blue-400 blur-md"
            />
            <PlusCircle className="relative z-10 h-8 w-8 transition-transform group-hover:rotate-90" />
          </NavLink>

          {navItems.slice(2).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-1 flex-col items-center justify-center transition-all duration-300",
                  isActive ? "text-blue-500" : "text-slate-400 hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
                      isActive ? "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-transparent"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                  </motion.div>
                  <span className={cn("mt-1 text-[9px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-40")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Floating Action Button (Desktop) */}
      <NavLink
        to="/add-trade"
        className="fixed bottom-8 right-8 hidden h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all md:flex"
      >
        <PlusCircle className="h-8 w-8" />
      </NavLink>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold) {
                handleSwipe('left');
              } else if (info.offset.x > threshold) {
                handleSwipe('right');
              }
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ChatBot />
    </div>
  );
}
