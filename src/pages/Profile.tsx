import { useQuery } from "@tanstack/react-query";
import { getPopular } from "@/lib/tmdb";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Share2, Star, Film, Bookmark, Eye, Users, UserPlus } from "lucide-react";
import { useState } from "react";
import heroBanner from "@/assets/hero-banner.jpg";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { TMDBMovie } from "@/lib/tmdb";

const tabs = ["Watchlist", "Reviews", "Videos"] as const;

interface PaginatedMovies {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<string>("Watchlist");
  const { user, isAuthenticated } = useAuth();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();

  const { data: popularData } = useQuery<PaginatedMovies>({
    queryKey: ["popular"],
    queryFn: () => getPopular(),
  });

  const movies = popularData?.results || [];

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
          <Film className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to view your profile</h2>
        <p className="text-muted-foreground mb-6">Create an account or sign in to track your favorite movies and more.</p>
        <Link to="/login">
          <Button variant="purple" size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="relative h-40 md:h-56">
        <img src={heroBanner} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-12 relative z-10 animate-fade-in">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-background flex items-center justify-center text-2xl font-bold text-primary">
            {user?.avatar}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">{user?.username}</p>
          </div>
          <div className="flex gap-2 pb-1">
            <Button variant="purple" size="sm" className="gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</Button>
            <Button variant="subtle" size="sm"><Share2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        <p className="mt-3 text-sm text-secondary-foreground">{user?.bio}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          {user?.badges.map((b) => (
            <Badge key={b} variant="outline" className="border-primary/30 text-primary text-xs gap-1">
              <Star className="h-3 w-3" /> {b}
            </Badge>
          ))}
        </div>

        <div className="flex gap-6 mt-4 py-4 border-t border-b border-border/50">
          {[
            { icon: Film, label: "Watched", value: user?.stats.watched || 0 },
            { icon: Bookmark, label: "Watchlist", value: watchlist.length || 0 },
            { icon: Eye, label: "Reviews", value: user?.stats.reviews || 0 },
            { icon: Users, label: "Followers", value: user?.stats.followers || 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                <s.icon className="h-3 w-3" /> {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="purple" className="flex-1 gap-2"><UserPlus className="h-4 w-4" /> Follow</Button>
        </div>

        <div className="flex gap-1 mt-6 border-b border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeTab === "Watchlist" && (
          <>
            {isWatchlistLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
                ))}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Your watchlist is empty</p>
                <Link to="/">
                  <Button variant="outline" size="sm" className="mt-2">
                    Browse Movies
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {/* For now, show popular movies as fallback - in production you'd fetch full movie details */}
                {movies.slice(0, watchlist.length).map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === "Reviews" && (
          <p className="text-muted-foreground text-sm text-center py-12">No reviews yet.</p>
        )}
        {activeTab === "Videos" && (
          <p className="text-muted-foreground text-sm text-center py-12">No videos yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

