import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Paywall from "./components/Paywall";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("chef-ai-unlocked") === "true";
  });

  const handleUnlock = () => {
    localStorage.setItem("chef-ai-unlocked", "true");
    setIsUnlocked(true);
  };

  // Admin route is always accessible
  if (location.pathname === "/admin") {
    return <AdminPanel />;
  }

  // Show paywall for non-unlocked users
  if (!isUnlocked) {
    return <Paywall onUnlock={handleUnlock} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
