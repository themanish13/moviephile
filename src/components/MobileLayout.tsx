import { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Play, User, Search, Bell, Film, Sparkles, Bookmark, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/lib/tmdb";

// Bottom navigation items (TikTok style)
const bottomNavItems = [
  { label: "Home", icon: Home, path: "/mobile" },
  { label: "TV Shows", icon: Tv, path: "/mobile?category=tvshows" },
  { label: "Reels", icon: Play, path: "/reels" },
  { label: "Watchlist", icon: Bookmark, path: "/m/watchlist" },
  { label: "Profile", icon: User, path: "/m/profile" },
];

// Swipe navigation order for mobile
const swipeOrder = ["/mobile", "/reels", "/m/watchlist", "/m/profile"];

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Swipe detection refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length >= 2,
    retry: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Handle swipe gestures for navigation
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Get current index in swipe order
    const currentPath = location.pathname;
    const currentIndex = swipeOrder.findIndex(path => 
      currentPath === path || currentPath.startsWith(path)
    );

    if (currentIndex === -1) return;

    if (isLeftSwipe && currentIndex < swipeOrder.length - 1) {
      // Swipe left -> go to next page
      navigate(swipeOrder[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      // Swipe right -> go to previous page
      navigate(swipeOrder[currentIndex - 1]);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/mobile" className="flex items-center gap-2 group">
            <Film className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-lg font-bold purple-gradient-text">MovieReels</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary h-9 w-9"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 px-4 py-3 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search movies..."
                className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            {searchQuery.length >= 2 && (
              <div className="mt-2">
                {searchLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
                    {searchResults.slice(0, 5).map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/?movie=${movie.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 p-2 hover:bg-white/10 transition-colors"
                      >
                        <img
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : "/placeholder.svg"}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm">{movie.title}</div>
                          <div className="text-xs text-muted-foreground">{movie.release_date?.split("-")[0]}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content with Swipe Support */}
      <main 
        className="flex-1 pb-20 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </main>

      {/* Bottom Navigation - TikTok Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-pb">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    isActive ? "bg-primary/20" : "hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button for Original Reels */}
      <Link
        to="/foryou"
        className="fixed bottom-20 right-4 z-40"
        title="Original Reels"
      >
        <Button
          size="icon"
          variant="purple"
          className="h-12 w-12 rounded-full shadow-xl neon-purple touch-feedback"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </Link>

      {/* Safe Area for Bottom Navigation on Notched Phones */}
      <style>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}
