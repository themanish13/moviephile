import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { posterUrl, getGenreNames } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Check, Trash2, Share2, Filter, Plus, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WatchlistItem } from "@/hooks/useWatchlist";

type WatchStatus = WatchlistItem["status"];

const statusColors: Record<WatchStatus, string> = {
  watching: "bg-primary/15 text-primary border-primary/30",
  watched: "bg-green-500/15 text-green-400 border-green-500/30",
  plan: "bg-muted text-muted-foreground border-border",
};

const Watchlist = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    watchlist,
    isLoading,
    refetch,
    markAsWatching,
    markAsWatched,
    markAsPlan,
    removeMovie,
    updateProgress,
  } = useWatchlist();
  const [filter, setFilter] = useState<WatchStatus | "all">("all");

  // Handle status toggle
  const handleToggleStatus = (item: WatchlistItem) => {
    const { movie_id, status } = item;
    
    // Cycle: plan -> watching -> watched -> plan
    if (status === "plan") {
      markAsWatching(movie_id);
    } else if (status === "watching") {
      markAsWatched(movie_id);
    } else {
      markAsPlan(movie_id);
    }
  };

  // Handle progress change
  const handleProgressChange = (movieId: number, progress: number) => {
    updateProgress.mutate({ movieId, progress });
  };

  // Handle remove from watchlist
  const handleRemove = (movieId: number) => {
    if (confirm("Are you sure you want to remove this movie from your watchlist?")) {
      removeMovie.mutate(movieId);
    }
  };

  // Filter items
  const filtered = filter === "all" 
    ? watchlist 
    : watchlist.filter((item) => item.status === filter);

  // Stats
  const stats = {
    all: watchlist.length,
    watching: watchlist.filter((i) => i.status === "watching").length,
    watched: watchlist.filter((i) => i.status === "watched").length,
    plan: watchlist.filter((i) => i.status === "plan").length,
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign in to view your watchlist</h2>
          <p className="text-muted-foreground max-w-md">
            Create an account to track movies you want to watch, mark progress, and build your personalized collection.
          </p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {stats.all} {stats.all === 1 ? "movie" : "movies"} • {stats.watching} watching • {stats.watched} watched • {stats.plan} planned
          </p>
        </div>
        <Link to="/">
          <Button variant="subtle" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Movie
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "watching", "watched", "plan"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "purple" : "subtle"}
            size="sm"
            className="text-xs capitalize whitespace-nowrap"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "plan" ? "Plan to Watch" : f}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-background/20 text-[10px]">
              {stats[f]}
            </span>
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="p-4 rounded-full bg-muted">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">
            {filter === "all" ? "Your watchlist is empty" : `No ${filter} movies`}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {filter === "all"
              ? "Start adding movies to track what you want to watch."
              : `You don't have any movies marked as "${filter}" yet.`}
          </p>
          {filter === "all" && (
            <Link to="/" className="mt-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Browse Movies
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Watchlist items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const { movie_id, movie_title, movie_poster_path, status, progress } = item;
          // We'll fetch full movie details from TMDB when needed
          // For now, we use stored data and fetch year from title if needed
          const year = "2024"; // TODO: Store year in watchlist table or fetch
          const genres = []; // TODO: Store genres or fetch
          const voteAverage = 0; // TODO: Store or fetch

          return (
            <div
              key={movie_id}
              className="glass-card rounded-xl p-4 flex gap-4 card-hover animate-fade-in"
            >
              <Link to={`/movie/${movie_id}`}>
                <img
                  src={posterUrl(movie_poster_path, "w154")}
                  alt={movie_title}
                  className="w-16 h-24 rounded-lg flex-shrink-0 object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/movie/${movie_id}`}>
                      <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                        {movie_title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{year}</span>
                      {voteAverage > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-star fill-star" />
                          <span className="text-xs text-star">{voteAverage.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", statusColors[status])}
                  >
                    {status === "plan" ? "Plan to Watch" : status}
                  </Badge>
                </div>

                {/* Progress bar for watching */}
                {status === "watching" && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden cursor-pointer">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                        onClick={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percent = Math.round((x / rect.width) * 100);
                          handleProgressChange(movie_id, Math.max(0, Math.min(100, percent)));
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {progress}% complete
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-primary"
                        onClick={() => markAsWatched(movie_id)}
                      >
                        Mark complete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                    onClick={() => handleToggleStatus(item)}
                  >
                    <Check className="h-3 w-3" />
                    {status === "watched" ? "Rewatch" : status === "watching" ? "Mark Watched" : "Start Watching"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(movie_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;

