import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTopRated, getPopular, getNowPlaying, getMovieVideos, type TMDBMovie, type TMDBVideo } from "@/lib/tmdb";
import MobileTrailerReel from "@/components/MobileTrailerReel";
import { cn } from "@/lib/utils";
import { TopRatedIcon, PopularIcon, LatestIcon } from "@/components/ui/custom-icons";

type Category = "toprated" | "popular" | "latest";

const categoryConfig = {
  toprated: {
    label: "Top Rated",
    icon: TopRatedIcon,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    fetchFn: getTopRated,
  },
  popular: {
    label: "Popular",
    icon: PopularIcon,
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    fetchFn: getPopular,
  },
  latest: {
    label: "Latest",
    icon: LatestIcon,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/20",
    fetchFn: getNowPlaying,
  },
};

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

async function fetchMoviesWithTrailers(
  category: Category,
  page: number
): Promise<MovieWithTrailer[]> {
  const config = categoryConfig[category];
  const data: PaginatedMovies = await config.fetchFn(page);

  // Fetch trailers for first 10 movies in parallel (limited for performance)
  const moviesWithTrailers = await Promise.all(
    data.results.slice(0, 10).map(async (movie) => {
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

export default function ReelsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("popular");
  const [savedMovies, setSavedMovies] = useState<Set<number>>(new Set());
  const [visibleIndex, setVisibleIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Infinite query for movies
  const moviesQuery = useInfiniteQuery({
    queryKey: ["reels", activeCategory],
    queryFn: ({ pageParam = 1 }) => fetchMoviesWithTrailers(activeCategory, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length + 1;
      return currentPage <= 5 ? currentPage : undefined; // Limit to 5 pages for performance
    },
    initialPageParam: 1,
  });

  // Flatten all pages
  const allMovies = moviesQuery.data?.pages.flatMap((page) => page) || [];

  // Reset refs when movies change
  useEffect(() => {
    reelRefs.current = reelRefs.current.slice(0, allMovies.length);
  }, [allMovies.length]);

  // Toggle saved state
  const toggleSave = useCallback((movieId: number) => {
    setSavedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  }, []);

  // Track visible reel using IntersectionObserver with higher threshold
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
        threshold: 0.8, // Consider visible when 80% is in view for better single-reel focus
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

  // Handle category change
  const handleCategoryChange = (newCategory: Category) => {
    setActiveCategory(newCategory);
    setSavedMovies(new Set());
    setVisibleIndex(0);
    // Reset scroll position
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Category Tabs */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold purple-gradient-text">Reels</h1>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(Object.keys(categoryConfig) as Category[]).map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              const isActive = activeCategory === cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive && config.color)} />
                  <span className={isActive ? config.color : ""}>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Vertical Scroll Reels */}
      <main className="pt-14">
        <div 
          ref={scrollContainerRef}
          className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        >
          {moviesQuery.isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-[calc(100vh-3.5rem)] snap-start flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-white/60 text-sm">Loading reels...</span>
                </div>
              </div>
            ))
          ) : allMovies.length > 0 ? (
            <>
              {allMovies.map((item, index) => (
                <div
                  key={`${item.movie.id}-${item.trailer?.id}-${index}`}
                  ref={(el) => { reelRefs.current[index] = el; }}
                  data-index={index}
                  className="w-full h-[calc(100vh-3.5rem)] snap-start flex-shrink-0"
                >
                  <MobileTrailerReel
                    movie={item.movie}
                    trailer={item.trailer!}
                    isVisible={index === visibleIndex}
                    isSaved={savedMovies.has(item.movie.id)}
                    onSave={() => toggleSave(item.movie.id)}
                    onWatch={() => window.location.href = `/?movie=${item.movie.id}`}
                  />
                </div>
              ))}

              {/* Loading sentinel */}
              {moviesQuery.isFetchingNextPage && (
                <div className="w-full h-[100px] snap-start flex-shrink-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/60 text-sm">Loading more...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="w-full h-[calc(100vh-3.5rem)] snap-start flex-shrink-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <PopularIcon className="h-10 w-10 text-white/30" />
              </div>
              <p className="text-white/60 text-lg">No reels found</p>
              <p className="text-white/40 text-sm mt-1">Try another category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
