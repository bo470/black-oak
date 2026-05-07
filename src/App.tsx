import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/src/components/Layout";
import { useAuth } from "./features/auth/AuthContext";

// Components
import { Dashboard } from "./features/dashboard/Dashboard";
import { Journal } from "./features/journal/Journal";
import { Analytics } from "./features/analytics/Analytics";
import { Profile } from "./features/profile/Profile";
import { AddTrade } from "./features/trades/AddTrade";
import { TradeDetail } from "./features/trades/TradeDetail";
import { Community } from "./features/community/Community";
import { Messages } from "./features/messaging/Messages";
import { Settings } from "./features/settings/Settings";
import { Backtesting } from "./features/backtesting/Backtesting";
import { Login } from "./features/auth/Login";
import { Signup } from "./features/auth/Signup";
import { Onboarding } from "./features/onboarding/Onboarding";
import { TradeProvider } from "./features/trades/TradeContext";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 transition-colors duration-300 dark:bg-black">
    <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  const { user, profile, loading, isAuthReady } = useAuth();

  if (!isAuthReady || loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <TradeProvider>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : !profile ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : !profile.onboardingCompleted ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:id" element={<TradeDetail />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/community" element={<Community />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/backtesting" element={<Backtesting />} />
                <Route path="/add-trade" element={<AddTrade />} />
                <Route path="/edit-trade/:id" element={<AddTrade />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
          </Routes>
        </TradeProvider>
    </BrowserRouter>
  );
}
