import { Star, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TMDBMovie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MovieCard({ movie, className }: { movie: TMDBMovie; className?: string }) {
  const [saved, setSaved] = useState(false);
  const year = movie.release_date?.slice(0, 4) || "TBA";

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className={cn("group relative rounded-xl overflow-hidden card-hover", className)}>
        <div className="aspect-[2/3] w-full relative">
          <img
            src={posterUrl(movie.poster_path, "w342")}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:text-primary z-10"
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
          </Button>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{year}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-star fill-star" />
                <span className="text-xs font-medium text-star">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
