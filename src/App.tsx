import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import MobileLayout from "@/components/MobileLayout";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import MovieDetail from "./pages/MovieDetail";
import TVShowDetail from "./pages/TVShowDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForYou from "./pages/ForYou";
import ReelsPage from "./pages/ReelsPage";
import MobileHomePage from "./pages/MobileHomePage";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Desktop Routes with Main Layout */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/watchlist" element={<Layout><Watchlist /></Layout>} />
            <Route path="/movie/:id" element={<Layout><MovieDetail /></Layout>} />
            <Route path="/tv/:id" element={<Layout><TVShowDetail /></Layout>} />
            <Route path="/foryou" element={<Layout><ForYou /></Layout>} />
            
            {/* Mobile Routes with Mobile Layout */}
            <Route path="/mobile" element={<MobileLayout><MobileHomePage /></MobileLayout>} />
            <Route path="/m/tv/:id" element={<MobileLayout><TVShowDetail /></MobileLayout>} />
            <Route path="/reels" element={<MobileLayout><ReelsPage /></MobileLayout>} />
            <Route path="/m/watchlist" element={<MobileLayout><Watchlist /></MobileLayout>} />
            <Route path="/m/profile" element={<MobileLayout><Profile /></MobileLayout>} />
            
            {/* Fallback */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
