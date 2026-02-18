import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getTrending, getTrendingTV, getPopular, getPopularTV, getNowPlaying, getUpcoming, getTopRated, getMoviesByGenre, getTVByGenre, getMovieVideos, getTVVideos, getMovieDetail, getMovieById, searchMovies, posterUrl, backdropUrl } from "@/lib/tmdb";
import type { TMDBMovie, TMDBTVShow, TMDBVideo, TMDBMovieDetail } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Grid3X3, List, Plus, Film, Tv, TrendingUp, Star, Heart, Calendar, Award, Flame, Search, Clock, Star as StarIcon, Info, Globe, Link } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

interface PaginatedMovies {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
}

interface PaginatedTV {
  results: TMDBTVShow[];
  page: number;
  total_pages: number;
}

const Watch = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TMDBVideo | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isTrailerDialogOpen, setIsTrailerDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [category, setCategory] = useState<string>("trending");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("vidsrc");
  const [searchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchQuery = searchParams.get("search") || "";

  // Movie queries
  const trendingMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["trending-movies"],
    queryFn: ({ pageParam = 1 }) => getTrending(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const popularMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["popular-movies"],
    queryFn: ({ pageParam = 1 }) => getPopular(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const nowPlayingMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["nowplaying-movies"],
    queryFn: ({ pageParam = 1 }) => getNowPlaying(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const upcomingMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["upcoming-movies"],
    queryFn: ({ pageParam = 1 }) => getUpcoming(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const topRatedMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["toprated-movies"],
    queryFn: ({ pageParam = 1 }) => getTopRated(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const genreMoviesQuery = useInfiniteQuery<PaginatedMovies>({
    queryKey: ["genre-movies", selectedGenre],
    queryFn: ({ pageParam = 1 }) => selectedGenre ? getMoviesByGenre(parseInt(selectedGenre), pageParam as number) : Promise.resolve({ results: [], page: 1, total_pages: 1 }),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!selectedGenre,
  });

  // TV queries
  const trendingTVQuery = useInfiniteQuery<PaginatedTV>({
    queryKey: ["trending-tv"],
    queryFn: ({ pageParam = 1 }) => getTrendingTV(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const popularTVQuery = useInfiniteQuery<PaginatedTV>({
    queryKey: ["popular-tv"],
    queryFn: ({ pageParam = 1 }) => getPopularTV(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const genreTVQuery = useInfiniteQuery<PaginatedTV>({
    queryKey: ["genre-tv", selectedGenre],
    queryFn: ({ pageParam = 1 }) => selectedGenre ? getTVByGenre(parseInt(selectedGenre), pageParam as number) : Promise.resolve({ results: [], page: 1, total_pages: 1 }),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!selectedGenre,
  });

  // Fetch movie/TV detail when selected
  const { data: itemDetail, isLoading: detailLoading } = useQuery<TMDBMovieDetail>({
    queryKey: ["detail", selectedItem?.id, contentType],
    queryFn: () => selectedItem && contentType === "movie" ? getMovieDetail(selectedItem.id) : Promise.resolve(null),
    enabled: !!selectedItem && contentType === "movie" && isDetailDialogOpen,
  });

  // Fetch videos for selected item
  const { data: itemVideos = [], isLoading: videosLoading } = useQuery<TMDBVideo[]>({
    queryKey: ["videos", selectedItem?.id, contentType],
    queryFn: () => selectedItem ? (contentType === "movie" ? getMovieVideos(selectedItem.id) : getTVVideos(selectedItem.id)) : Promise.resolve([]),
    enabled: !!selectedItem && isTrailerDialogOpen,
  });

  // Search query
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Handle direct movie playback from query parameter
  const { data: directMovie } = useQuery({
    queryKey: ["movieById", searchParams.get("movie")],
    queryFn: () => {
      const movieId = searchParams.get("movie");
      if (!movieId) return null;
      return getMovieById(parseInt(movieId));
    },
    enabled: !!searchParams.get("movie"),
  });

  useEffect(() => {
    if (directMovie) {
      setSelectedItem(directMovie);
      setContentType("movie");
      setIsVideoDialogOpen(true);
    }
  }, [directMovie]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const query = getCurrentQuery();
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [contentType, category, selectedGenre]);

  const getCurrentQuery = () => {
    if (contentType === "movie") {
      switch (category) {
        case "trending": return trendingMoviesQuery;
        case "popular": return popularMoviesQuery;
        case "nowplaying": return nowPlayingMoviesQuery;
        case "upcoming": return upcomingMoviesQuery;
        case "toprated": return topRatedMoviesQuery;
        case "genre": return genreMoviesQuery;
        default: return trendingMoviesQuery;
      }
    } else {
      switch (category) {
        case "trending": return trendingTVQuery;
        case "popular": return popularTVQuery;
        case "genre": return genreTVQuery;
        default: return trendingTVQuery;
      }
    }
  };

  const getCurrentData = () => {
    if (searchQuery) return searchResults;
    const query = getCurrentQuery();
    return query.data?.pages.flatMap((page) => page.results) || [];
  };

  const currentQuery = getCurrentQuery();
  const currentData = getCurrentData();
  const isLoading = searchQuery ? searchLoading : currentQuery.isLoading;

  const openDetailDialog = (item: TMDBMovie | TMDBTVShow, type: "movie" | "tv") => {
    setSelectedItem(item);
    setContentType(type);
    setIsDetailDialogOpen(true);
  };

  // Streaming source URLs
  const getStreamingUrl = (id: number, source: string, type: "movie" | "tv"): string => {
    const sources: Record<string, string> = {
      vidsrc: `https://vidsrc.me/embed/${type === "movie" ? "movie" : "tv"}/${id}`,
    };
    return sources[source] || sources.vidsrc;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {searchQuery ? (
            <span className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search: {searchQuery}
            </span>
          ) : (
            `Watch ${contentType === "movie" ? "Movies" : "TV Shows"}`
          )}
        </h1>
        <div className="flex gap-1">
          <Button variant={viewMode === "grid" ? "purple" : "subtle"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "purple" : "subtle"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!searchQuery && (
        <Tabs value={contentType} onValueChange={(value) => { setContentType(value as "movie" | "tv"); setCategory("trending"); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movie" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              TV Shows
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2 mt-4">
            {contentType === "movie" ? (
              <>
                <Button variant={category === "trending" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("trending")} className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Button>
                <Button variant={category === "popular" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("popular")} className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Popular
                </Button>
                <Button variant={category === "nowplaying" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("nowplaying")} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  New Releases
                </Button>
                <Button variant={category === "upcoming" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("upcoming")} className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Coming Soon
                </Button>
                <Button variant={category === "toprated" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("toprated")} className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Top Rated
                </Button>
              </>
            ) : (
              <>
                <Button variant={category === "trending" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("trending")} className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Button>
                <Button variant={category === "popular" ? "purple" : "subtle"} size="sm" onClick={() => setCategory("popular")} className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Popular
                </Button>
              </>
            )}

            <Select value={selectedGenre} onValueChange={(value) => { setSelectedGenre(value); setCategory("genre"); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="28">Action</SelectItem>
                <SelectItem value="12">Adventure</SelectItem>
                <SelectItem value="16">Animation</SelectItem>
                <SelectItem value="35">Comedy</SelectItem>
                <SelectItem value="80">Crime</SelectItem>
                <SelectItem value="99">Documentary</SelectItem>
                <SelectItem value="18">Drama</SelectItem>
                <SelectItem value="10751">Family</SelectItem>
                <SelectItem value="14">Fantasy</SelectItem>
                <SelectItem value="36">History</SelectItem>
                <SelectItem value="27">Horror</SelectItem>
                <SelectItem value="10402">Music</SelectItem>
                <SelectItem value="9648">Mystery</SelectItem>
                <SelectItem value="10749">Romance</SelectItem>
                <SelectItem value="878">Sci-Fi</SelectItem>
                <SelectItem value="53">Thriller</SelectItem>
                <SelectItem value="10752">War</SelectItem>
                <SelectItem value="37">Western</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Tabs>
      )}

      <div className={cn(viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3")}>
        {isLoading && !currentData.length
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={cn(viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-32 rounded-xl")} />
            ))
          : currentData.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchQuery ? `No results found for "${searchQuery}"` : "No content available"}
            </div>
          ) : (
            currentData.map((item) => (
              <div key={item.id} className={cn("glass-card rounded-xl overflow-hidden card-hover animate-fade-in block text-left", viewMode === "list" && "flex gap-4")}>
                <div 
                  className={cn("relative cursor-pointer group", viewMode === "grid" ? "aspect-[2/3]" : "w-40 flex-shrink-0")}
                  onClick={() => openDetailDialog(item, contentType)}
                >
                  <img 
                    src={posterUrl(item.poster_path, "w500")} 
                    alt={contentType === "movie" ? (item as TMDBMovie).title : (item as TMDBTVShow).name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="purple" size="icon" className="h-12 w-12 rounded-full">
                      <Info className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <div className={cn("p-3", viewMode === "list" && "flex-1 py-3 pr-4")}>
                  <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                    {contentType === "movie" ? (item as TMDBMovie).title : (item as TMDBTVShow).name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize px-1.5 py-0">
                      {contentType === "movie" ? (item as TMDBMovie).release_date?.split('-')[0] : (item as TMDBTVShow).first_air_date?.split('-')[0]}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {item.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )
        }
      </div>

      {!searchQuery && currentQuery.isFetchingNextPage && (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`loading-${i}`} className={cn(viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-32 rounded-xl")} />
          ))}
        </div>
      )}

      {!searchQuery && <div ref={loadMoreRef} className="h-4" />}

      {!searchQuery && !currentQuery.hasNextPage && currentData.length > 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          You have reached the end
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? (contentType === "movie" ? (selectedItem as TMDBMovie).title : (selectedItem as TMDBTVShow).name) : ""}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Backdrop and Poster */}
              <div className="relative h-64 rounded-xl overflow-hidden">
                <img 
                  src={backdropUrl(itemDetail?.backdrop_path || selectedItem.backdrop_path, "w1280")} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              {/* Title and Rating */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {contentType === "movie" ? (selectedItem as TMDBMovie).title : (selectedItem as TMDBTVShow).name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {contentType === "movie" 
                        ? (selectedItem as TMDBMovie).release_date?.split('-')[0] 
                        : (selectedItem as TMDBTVShow).first_air_date?.split('-')[0]}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm">
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {selectedItem.vote_average?.toFixed(1)}/10
                    </span>
                    {contentType === "movie" && itemDetail?.runtime && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {Math.floor(itemDetail.runtime / 60)}h {itemDetail.runtime % 60}m
                      </span>
                    )}
                    {contentType === "tv" && (selectedItem as TMDBTVShow).number_of_seasons && (
                      <span className="text-sm text-muted-foreground">
                        {(selectedItem as TMDBTVShow).number_of_seasons} Seasons
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="purple" size="lg" className="gap-2" onClick={() => setIsVideoDialogOpen(true)}>
                    <Play className="h-5 w-5" />
                    Watch Now
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setIsTrailerDialogOpen(true)}>
                    <Film className="h-5 w-5" />
                    Trailer
                  </Button>
                </div>
              </div>

              {/* Genres */}
              {itemDetail?.genres && itemDetail.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {itemDetail.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="text-sm">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedItem.overview || "No overview available."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="ghost" size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add to Watchlist
                </Button>
                <Button variant="ghost" size="lg" className="gap-2 text-red-500 hover:text-red-600">
                  <Heart className="h-5 w-5" />
                  Favorite
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {selectedItem ? (contentType === "movie" ? (selectedItem as TMDBMovie).title : (selectedItem as TMDBTVShow).name) : ""}
            </DialogTitle>
          </DialogHeader>
          
          {/* Source Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Link className="h-4 w-4" />
              Stream:
            </span>
            {["vidsrc"].map((source) => (
              <Button
                key={source}
                variant={selectedSource === source ? "purple" : "outline"}
                size="sm"
                onClick={() => setSelectedSource(source)}
                className="capitalize text-xs"
              >
                {source.replace(/([A-Z])/g, ' $1').trim()}
              </Button>
            ))}
          </div>

          {selectedItem && (
            <iframe
              width="100%"
              height="450"
              src={getStreamingUrl(selectedItem.id, selectedSource, contentType)}
              title={contentType === "movie" ? (selectedItem as TMDBMovie).title : (selectedItem as TMDBTVShow).name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          
          <div className="text-center text-xs text-muted-foreground mt-2">
            If player doesn't load, try another source above
          </div>
        </DialogContent>
      </Dialog>

      {/* Trailer Dialog */}
      <Dialog open={isTrailerDialogOpen} onOpenChange={(open) => { setIsTrailerDialogOpen(open); if (!open) setSelectedVideo(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Trailer - ${contentType === "movie" ? (selectedItem as TMDBMovie).title : (selectedItem as TMDBTVShow).name}` : "Trailer"}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo ? (
            <iframe
              width="100%"
              height="450"
              src={`https://www.youtube.com/embed/${selectedVideo.key}`}
              title={selectedVideo.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : videosLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading trailers...</div>
            </div>
          ) : itemVideos.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Select a trailer:</h4>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {itemVideos.filter(v => v.site === "YouTube").map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`} 
                      alt={video.name}
                      className="w-32 h-18 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">{video.name}</div>
                      <div className="text-xs text-muted-foreground">{video.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">No trailers available</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Watch;
