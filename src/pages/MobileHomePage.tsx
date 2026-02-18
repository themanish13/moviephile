import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getTrending, getPopular, getTopRated, getUpcoming, 
  getTrendingTV, getPopularTV, getTVTopRated,
  type TMDBMovie, type TMDBTVShow 
} from "@/lib/tmdb";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, Star, Calendar, Flame, Play, 
  Search, Bell, Film, ChevronRight, Sparkles,
  Info, Plus, Bookmark, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { posterUrl } from "@/lib/tmdb";

type Category = "trending" | "popular" | "toprated" | "upcoming" | "tvshows";
type ContentType = "movie" | "tv";

const categoryConfig = {
  trending: { label: "Trending", icon: TrendingUp, color: "text-primary", type: "movie" as ContentType },
  popular: { label: "Popular", icon: Flame, color: "text-pink-500", type: "movie" as ContentType },
  toprated: { label: "Top Rated", icon: Star, color: "text-yellow-500", type: "movie" as ContentType },
  upcoming: { label: "Coming Soon", icon: Calendar, color: "text-cyan-500", type: "movie" as ContentType },
  tvshows: { label: "TV Shows", icon: Film, color: "text-purple-500", type: "tv" as ContentType },
};

interface PaginatedContent<T> {
  results: T[];
  page: number;
  total_pages: number;
}

type ContentItem = TMDBMovie | TMDBTVShow;

function isTVShow(item: ContentItem): item is TMDBTVShow {
  return "name" in item;
}

export default function MobileHomePage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("trending");
  const [isSwitching, setIsSwitching] = useState(false);

  // Handle URL query parameter for category
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam in categoryConfig) {
      setActiveCategory(categoryParam as Category);
    }
  }, [searchParams]);

  const isTVCategory = activeCategory === "tvshows";

  // Handle category change with loading state
  const handleCategoryChange = (cat: Category) => {
    if (cat !== activeCategory) {
      setIsSwitching(true);
      // Clear all content queries to force fresh fetch
      queryClient.removeQueries({ queryKey: ["mobile-content"] });
      setActiveCategory(cat);
      // Reset switching state after a short delay to allow query to fetch
      setTimeout(() => setIsSwitching(false), 300);
    }
  };
  
  // Fetch movies or TV shows based on category
  const contentQuery = useInfiniteQuery<{ results: ContentItem[]; page: number; total_pages: number }>({
    queryKey: ["mobile-content", activeCategory],
    queryFn: ({ pageParam = 1 }) => {
      if (isTVCategory) {
        return getTrendingTV(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
      } else {
        switch (activeCategory) {
          case "trending": return getTrending(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
          case "popular": return getPopular(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
          case "toprated": return getTopRated(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
          case "upcoming": return getUpcoming(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
          default: return getTrending(pageParam as number) as Promise<{ results: ContentItem[]; page: number; total_pages: number }>;
        }
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    placeholderData: undefined, // Don't show previous data while loading new data
  });

  // Get content from query data
  const movies: ContentItem[] = contentQuery.data?.pages.flatMap((page) => page.results) || [];

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400";
    if (rating >= 6) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[50vh] overflow-hidden">
          {movies[0] ? (
            <>
              <img
                src={posterUrl(movies[0].backdrop_path, "original")}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              
              {/* Hero Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Badge className="mb-3 bg-primary/20 border-primary/50 text-primary">
                  {categoryConfig[activeCategory].label}
                </Badge>
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {isTVShow(movies[0]) ? movies[0].name : movies[0].title}
                </h1>
                <div className="flex items-center gap-3 text-white/80 text-sm mb-4">
          <span>{isTVShow(movies[0]) ? movies[0].first_air_date?.split("-")[0] : movies[0].release_date?.split("-")[0]}</span>

                  <span className={cn("flex items-center gap-1", getRatingColor(movies[0].vote_average))}>
                    <Star className="h-4 w-4 fill-current" />
                    {movies[0].vote_average?.toFixed(1)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-xs">
                    HD
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link to={isTVShow(movies[0]) ? `/tv/${movies[0].id}` : `/movie/${movies[0].id}`}>
                    <Button variant="purple" size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Watch Now
                    </Button>
                  </Link>
                  <Button variant="glass-button" size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Add
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-14 z-40 bg-background/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2 p-4 overflow-x-auto scrollbar-hide">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            const isActive = activeCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "" : config.color)} />
                {config.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="p-4">
        <div className="flex gap-3">
          <Link to="/reels" className="flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Watch Reels</h3>
                  <p className="text-xs text-muted-foreground">Short trailers</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </div>
          </Link>
          <Link to="/watchlist" className="flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Bookmark className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Watchlist</h3>
                  <p className="text-xs text-muted-foreground">Your saved movies</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Content Grid */}
      <section className="p-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isTVCategory ? "All TV Shows" : "All Movies"}
          </h2>
          <span className="text-xs text-muted-foreground">{movies.length} items</span>
        </div>

        {(contentQuery.isLoading || isSwitching) ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {movies.slice(1).map((item) => (
              <Link
                key={item.id}
                to={isTVShow(item) ? `/tv/${item.id}` : `/movie/${item.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden card-glow">
                  <img
                    src={posterUrl(item.poster_path, "w342")}
                    alt={isTVShow(item) ? item.name : item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md flex items-center gap-1">
                    <Star className={cn("h-3 w-3 fill-current", getRatingColor(item.vote_average))} />
                    <span className={cn("text-xs font-medium", getRatingColor(item.vote_average))}>
                      {item.vote_average?.toFixed(1)}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80">
                      <Bookmark className="h-3 w-3 text-white" />
                    </button>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm font-medium text-white line-clamp-2">
                      {isTVShow(item) ? item.name : item.title}
                    </h3>
                    <p className="text-xs text-white/70 mt-1">
                      {isTVShow(item) ? item.first_air_date?.split("-")[0] : item.release_date?.split("-")[0]}
                    </p>
                    {isTVShow(item) && item.number_of_seasons && (
                      <p className="text-xs text-primary mt-1">
                        {item.number_of_seasons} {item.number_of_seasons === 1 ? "Season" : "Seasons"}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}

        {/* Load More */}
        {contentQuery.hasNextPage && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => contentQuery.fetchNextPage()}
              disabled={contentQuery.isFetchingNextPage}
              className="text-muted-foreground hover:text-foreground"
            >
              {contentQuery.isFetchingNextPage ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
