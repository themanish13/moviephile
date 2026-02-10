import { useQuery } from "@tanstack/react-query";
import { getPopular, posterUrl, getGenreNames } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, Trash2, Share2, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type WatchStatus = "watching" | "watched" | "plan";

interface WatchlistItem {
  movie: TMDBMovie;
  status: WatchStatus;
  progress: number;
}

const statusColors: Record<WatchStatus, string> = {
  watching: "bg-primary/15 text-primary border-primary/30",
  watched: "bg-green-500/15 text-green-400 border-green-500/30",
  plan: "bg-muted text-muted-foreground border-border",
};

const Watchlist = () => {
  const { data: popularMovies = [], isLoading } = useQuery({
    queryKey: ["popular"],
    queryFn: getPopular,
  });

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [filter, setFilter] = useState<WatchStatus | "all">("all");

  // Initialize watchlist from fetched data
  if (popularMovies.length > 0 && !initialized) {
    setItems(
      popularMovies.slice(0, 8).map((m, i) => ({
        movie: m,
        status: i < 2 ? "watching" : i < 5 ? "watched" : "plan",
        progress: i < 2 ? Math.floor(Math.random() * 70 + 20) : i < 5 ? 100 : 0,
      }))
    );
    setInitialized(true);
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const toggleStatus = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.movie.id === id
          ? {
              ...item,
              status: item.status === "plan" ? "watching" : item.status === "watching" ? "watched" : "plan",
              progress: item.status === "watching" ? 100 : item.status === "watched" ? 0 : item.progress,
            }
          : item
      )
    );
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
        <Button variant="subtle" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "watching", "watched", "plan"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "gold" : "subtle"}
            size="sm"
            className="text-xs capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "plan" ? "Plan to Watch" : f}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(({ movie, status, progress }) => {
          const year = movie.release_date?.slice(0, 4) || "TBA";
          const genres = getGenreNames(movie.genre_ids || []);
          return (
            <div key={movie.id} className="glass-card rounded-xl p-4 flex gap-4 card-hover animate-fade-in">
              <Link to={`/movie/${movie.id}`}>
                <img
                  src={posterUrl(movie.poster_path, "w154")}
                  alt={movie.title}
                  className="w-16 h-24 rounded-lg flex-shrink-0 object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/movie/${movie.id}`}>
                      <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors">{movie.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{year}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-star fill-star" />
                        <span className="text-xs text-star">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] capitalize", statusColors[status])}>
                    {status === "plan" ? "Plan to Watch" : status}
                  </Badge>
                </div>
                {status === "watching" && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{progress}% complete</span>
                  </div>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {genres.map((g) => (
                    <span key={g} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{g}</span>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary gap-1" onClick={() => toggleStatus(movie.id)}>
                    <Check className="h-3 w-3" /> {status === "watched" ? "Rewatch" : "Mark Watched"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive">
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
