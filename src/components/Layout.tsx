import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Film, Bookmark, User, Play, Search, Bell, Menu, X, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { searchMovies } from "@/lib/tmdb";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Reels", icon: Play, path: "/foryou" },
  { label: "Watchlist", icon: Bookmark, path: "/watchlist" },
  { label: "Profile", icon: User, path: "/profile" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const { data: searchResults = [], isLoading: searchLoading, error } = useQuery({
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Film className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-lg font-bold text-gradient hidden sm:inline">MovieReels</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? "purple" : "ghost"}
                    size="sm"
                    className={cn("gap-2", active && "purple-glow")}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
                <div className="flex items-center gap-2 ml-1">
                  <span className="hidden lg:inline text-sm text-muted-foreground">
                    {user?.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={logout}
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="purple" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-border/50 px-4 py-3 animate-fade-in">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search movies..."
                className="w-full bg-muted rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            {searchQuery.length >= 2 && (
              <div className="max-w-2xl mx-auto mt-2">
                {searchLoading && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Searching...
                  </div>
                )}
                {error && (
                  <div className="text-center text-sm text-red-500 py-4">
                    Error searching movies. Please try again.
                  </div>
                )}
                {!searchLoading && !error && searchResults?.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No results found for "{searchQuery}"
                  </div>
                )}
                {!searchLoading && !error && searchResults && searchResults.length > 0 && (
                  <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                    {searchResults.slice(0, 5).map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/?movie=${movie.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 p-2 hover:bg-muted transition-colors"
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
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 px-4 py-3 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={active ? "purple" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="purple" className="w-full justify-start gap-3 mt-2">
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-500 hover:text-red-600"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MovieReels. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link to="/foryou" className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <Button size="icon" variant="purple" className="h-14 w-14 rounded-full shadow-xl purple-glow animate-pulse-glow">
          <Play className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
