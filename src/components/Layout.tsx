import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Film, Bookmark, User, Play, Search, Bell, Plus, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Videos", icon: Play, path: "/videos" },
  { label: "Watchlist", icon: Bookmark, path: "/watchlist" },
  { label: "Profile", icon: User, path: "/profile" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Film className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-lg font-bold text-gradient hidden sm:inline">CineVerse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? "gold" : "ghost"}
                    size="sm"
                    className={cn("gap-2", active && "gold-glow")}
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cinema-red" />
            </Button>
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
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search movies, shows, people..."
                className="w-full bg-muted rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
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
                      variant={active ? "gold" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Floating Action Button */}
      <Link to="/" className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <Button size="icon" variant="gold" className="h-14 w-14 rounded-full shadow-xl gold-glow animate-pulse-gold">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
