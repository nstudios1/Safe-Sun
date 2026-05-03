import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { MeshBackground } from "@/components/safesun/MeshBackground";
import { BottomNav } from "@/components/safesun/BottomNav";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import Insights from "./pages/Insights";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function Shell() {
  const { user } = useApp();
  if (!user) return <Auth />;
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <MeshBackground />
        <Sonner position="top-center" theme="dark" toastOptions={{ className: "glass-strong !text-white" }} />
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
