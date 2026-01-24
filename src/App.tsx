import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Paywall from "./components/Paywall";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("chef-ai-unlocked") === "true";
  });

  const handleUnlock = () => {
    localStorage.setItem("chef-ai-unlocked", "true");
    setIsUnlocked(true);
  };

  if (!isUnlocked) {
    return <Paywall onUnlock={handleUnlock} />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin route - always accessible */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Protected app routes */}
            <Route path="/" element={<ProtectedRoute><Index defaultTab="scanner" /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Index defaultTab="scanner" /></ProtectedRoute>} />
            <Route path="/descobrir" element={<ProtectedRoute><Index defaultTab="discover" /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Index defaultTab="chat" /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Index defaultTab="menu" /></ProtectedRoute>} />
            <Route path="/compras" element={<ProtectedRoute><Index defaultTab="shopping" /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
