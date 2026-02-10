import { useQuery } from "@tanstack/react-query";
import { getTrending, getMovieVideos, posterUrl } from "@/lib/tmdb";
import type { TMDBVideo, TMDBMovie } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Grid3X3, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const Videos = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: trending = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  });

  // Fetch videos for first 6 trending movies
  const movieIds = trending.slice(0, 6).map((m) => m.id);
  const { data: allVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["videos-bulk", movieIds],
    queryFn: async () => {
      const results = await Promise.all(
        movieIds.map(async (id) => {
          const videos = await getMovieVideos(id);
          const movie = trending.find((m) => m.id === id)!;
          return videos
            .filter((v) => v.site === "YouTube")
            .slice(0, 2)
            .map((v) => ({ video: v, movie }));
        })
      );
      return results.flat();
    },
    enabled: movieIds.length > 0,
  });

  const isLoading = moviesLoading || videosLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Trailers & Videos</h1>
        <div className="flex gap-1">
          <Button variant={viewMode === "grid" ? "gold" : "subtle"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "gold" : "subtle"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
      )}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={cn(viewMode === "grid" ? "aspect-video rounded-xl" : "h-28 rounded-xl")} />
            ))
          : allVideos.map(({ video, movie }) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "glass-card rounded-xl overflow-hidden card-hover animate-fade-in block",
                  viewMode === "list" && "flex gap-4"
                )}
              >
                <div
                  className={cn(
                    "relative cursor-pointer group",
                    viewMode === "grid" ? "aspect-video" : "w-48 h-28 flex-shrink-0"
                  )}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                    alt={video.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className={cn("p-3", viewMode === "list" && "flex-1 py-3 pr-4")}>
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{video.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize px-1.5 py-0">
                      {video.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{movie.title}</span>
                  </div>
                  {viewMode === "list" && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{movie.overview}</p>
                  )}
                </div>
              </a>
            ))}
      </div>
    </div>
  );
};

export default Videos;
