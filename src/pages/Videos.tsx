import { videos, movies } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Bookmark, Clock, Grid3X3, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Videos = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Trailers & Videos</h1>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "gold" : "subtle"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "gold" : "subtle"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
      )}>
        {videos.map((video) => {
          const movie = movies.find((m) => m.id === video.movieId);
          const isPlaying = playingId === video.id;

          return (
            <div
              key={video.id}
              className={cn(
                "glass-card rounded-xl overflow-hidden card-hover animate-fade-in",
                viewMode === "list" && "flex gap-4"
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  "relative cursor-pointer group",
                  viewMode === "grid" ? "aspect-video" : "w-48 h-28 flex-shrink-0"
                )}
                style={{ background: video.thumbnail }}
                onClick={() => setPlayingId(isPlaying ? null : video.id)}
              >
                <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center transition-transform",
                    "group-hover:scale-110",
                    isPlaying && "bg-foreground/90"
                  )}>
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-background/80 rounded px-1.5 py-0.5 text-[10px] font-medium text-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {video.duration}
                </div>

                {/* Hover overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground hover:text-primary bg-background/50">
                    <Bookmark className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className={cn("p-3", viewMode === "list" && "flex-1 py-3 pr-4")}>
                <h3 className="font-semibold text-sm text-foreground leading-tight">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize px-1.5 py-0">
                    {video.type.replace("-", " ")}
                  </Badge>
                  {movie && (
                    <span className="text-xs text-muted-foreground">{movie.year}</span>
                  )}
                </div>
                {viewMode === "list" && movie && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{movie.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Videos;
