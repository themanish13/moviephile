import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrending, getPopular, getNowPlaying, getUpcoming, getTopRated, getMovieVideos, type TMDBMovie, type TMDBVideo } from "@/lib/tmdb";
import TrailerReel from "@/components/TrailerReel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Sparkles, TrendingUp, Calendar, Star, Film, Home, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";

interface PaginatedMovies {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
}

interface MovieWithTrailer {
  movie: TMDBMovie;
  trailer: TMDBVideo | null;
  isSaved: boolean;
}

type Category = "trending" | "newrelease" | "toprated" | "upcoming" | "popular";

const categoryConfig = {
  trending: { label: "Trending", icon: TrendingUp, color: "text-primary" },
  newrelease: { label: "New Releases", icon: Sparkles, color: "text-green-500" },
  toprated: { label: "IMDb Top Rated", icon: Star, color: "text-yellow-500" },
  upcoming: { label: "Coming Soon", icon: Calendar, color: "text-orange-500" },
  popular: { label: "Popular", icon: Film, color: "text-pink-500" },
};

async function fetchMoviesWithTrailers(
  category: Category,
  page: number
): Promise<MovieWithTrailer[]> {
  let data: PaginatedMovies;

  switch (category) {
    case "trending":
      data = await getTrending(page);
      break;
    case "newrelease":
      data = await getNowPlaying(page);
      break;
    case "toprated":
      data = await getTopRated(page);
      break;
    case "upcoming":
      data = await getUpcoming(page);
      break;
    case "popular":
    default:
      data = await getPopular(page);
      break;
  }

  // Fetch trailers for each movie in parallel
  const moviesWithTrailers = await Promise.all(
    data.results.map(async (movie) => {
      try {
        const videos = await getMovieVideos(movie.id);
        const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer") || null;
        return { movie, trailer, isSaved: false };
      } catch {
        return { movie, trailer: null, isSaved: false };
      }
    })
  );

  return moviesWithTrailers.filter((item) => item.trailer !== null);
}

const ForYou = () => {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleMovie } = useWatchlist();
  const [activeCategory, setActiveCategory] = useState<Category>("trending");
  const [visibleIndex, setVisibleIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Infinite query for movies
  const moviesQuery = useInfiniteQuery({
    queryKey: ["foryou", activeCategory],
    queryFn: ({ pageParam = 1 }) => fetchMoviesWithTrailers(activeCategory, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length + 1;
      return currentPage <= 5 ? currentPage : undefined; // Limit to 5 pages
    },
    initialPageParam: 1,
  });

  // Flatten all pages
  const allMovies = moviesQuery.data?.pages.flatMap((page) => page) || [];

  // Reset refs when movies change
  useEffect(() => {
    reelRefs.current = reelRefs.current.slice(0, allMovies.length);
  }, [allMovies.length]);

  // Handle toggle saved
  const handleToggleSave = (movie: TMDBMovie) => {
    if (!isAuthenticated) {
      alert("Please sign in to manage your watchlist");
      return;
    }
    toggleMovie(movie);
  };

  // Track visible reel using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setVisibleIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.6, // Consider visible when 60% is in view
      }
    );

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [allMovies]);

  // Handle scroll to load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && moviesQuery.hasNextPage && !moviesQuery.isFetchingNextPage) {
          moviesQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = scrollContainerRef.current?.lastElementChild;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [moviesQuery.hasNextPage, moviesQuery.isFetchingNextPage, moviesQuery.fetchNextPage]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
            MovieReels
          </h1>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-primary gap-1">
              <Grid3X3 className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="max-w-md mx-auto px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {(Object.keys(categoryConfig) as Category[]).map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisibleIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 hover:bg-white/20 text-white/80"
                  }`}
                >
                  <Icon className={cn("h-4 w-4", cat === activeCategory ? "text-primary-foreground" : config.color)} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Scroll Reels */}
      <main className="pt-24 pb-4">
        <div 
          ref={scrollContainerRef}
          className="flex flex-col snap-y snap-mandatory overflow-y-scroll h-[calc(100vh-6rem)] scroll-smooth no-scrollbar"
          style={{ 
            scrollSnapType: "y mandatory",
          }}
        >
          {moviesQuery.isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full h-full min-h-screen snap-start flex-shrink-0 flex items-center justify-center bg-gray-900">
                <Skeleton className="w-full max-w-md aspect-[9/16] rounded-none" />
              </div>
            ))
          ) : allMovies.length > 0 ? (
            <>
              {allMovies.map((item, index) => (
                <div
                  key={`${item.movie.id}-${item.trailer?.id}`}
                  ref={(el) => { reelRefs.current[index] = el; }}
                  data-index={index}
                  className="w-full h-full min-h-screen snap-start flex-shrink-0"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <TrailerReel
                    movie={item.movie}
                    trailer={item.trailer!}
                    isVisible={index === visibleIndex}
                    onWatch={() => window.location.href = `/?movie=${item.movie.id}`}
                    onAddToWatchlist={() => handleToggleSave(item.movie)}
                    isSaved={isSaved(item.movie.id)}
                  />
                </div>
              ))}

              {/* Loading sentinel */}
              {moviesQuery.isFetchingNextPage && (
                <div className="w-full min-h-screen snap-start flex-shrink-0 flex items-center justify-center bg-gray-900">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/60 text-sm">Loading more...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="w-full min-h-screen snap-start flex-shrink-0 flex flex-col items-center justify-center">
              <Film className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-white/60 text-lg">No trailers found</p>
              <p className="text-white/40 text-sm mt-1">Try another category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForYou;

