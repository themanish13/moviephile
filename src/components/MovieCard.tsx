import { Star, Bookmark, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/data/mockData";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MovieCard({ movie, className }: { movie: Movie; className?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className={cn("group relative rounded-xl overflow-hidden card-hover", className)}>
        {/* Poster */}
        <div
          className="aspect-[2/3] w-full flex flex-col justify-end p-3 relative"
          style={{ background: movie.poster }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            {movie.trending && (
              <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> Trending
              </Badge>
            )}
            {movie.newRelease && (
              <Badge className="bg-cinema-red text-foreground text-[10px]">New</Badge>
            )}
          </div>

          {/* Save button overlay */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:text-primary z-10"
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
          </Button>

          {/* Info */}
          <div className="relative z-10">
            <h3 className="font-bold text-sm text-foreground leading-tight">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{movie.year}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-star fill-star" />
                <span className="text-xs font-medium text-star">{movie.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
