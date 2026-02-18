import { Star, Bookmark, Play, Share2, Plus, Eye, Clock, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TMDBMovie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";

export default function MovieCard({ movie, className }: { movie: TMDBMovie; className?: string }) {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleMovie } = useWatchlist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const year = movie.release_date?.slice(0, 4) || "TBA";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";

  // Use real watchlist state
  const saved = isSaved(movie.id);

  const handleWatchNow = () => {
    navigate(`/?movie=${movie.id}`);
    setDialogOpen(false);
  };

  const handleViewDetails = () => {
    navigate(`/movie/${movie.id}`);
    setDialogOpen(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/movie/${movie.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title}`,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
    }
    setDialogOpen(false);
  };

  const handleWatchTrailer = () => {
    navigate(`/movie/${movie.id}`);
    setDialogOpen(false);
  };

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please sign in to manage your watchlist");
      return;
    }
    toggleMovie(movie);
  };

  return (
    <>
      <div 
        className={cn("group relative rounded-xl overflow-hidden card-hover cursor-pointer", className)}
        onClick={() => setDialogOpen(true)}
      >
        <div className="aspect-[2/3] w-full relative">
          <img
            src={posterUrl(movie.poster_path, "w342")}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-primary z-10 bg-black/50 hover:bg-black/70"
            onClick={handleToggleWatchlist}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
          </Button>

          {/* Info - moves down on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10 group-hover:pb-16 transition-all">
            <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{year}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-yellow-500">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <img
                src={posterUrl(movie.poster_path, "w92")}
                alt={movie.title}
                className="w-16 h-24 rounded-lg object-cover"
              />
              <div>
                <DialogTitle className="text-lg leading-tight">{movie.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{year} • {runtime}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium text-yellow-500">{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-2 mt-4">
            <Button 
              variant="purple" 
              className="w-full gap-2" 
              onClick={handleWatchNow}
            >
              <Play className="h-4 w-4" />
              Watch Now
            </Button>
            
            <Button 
              variant="subtle" 
              className="w-full gap-2" 
              onClick={handleToggleWatchlist}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} />
              {saved ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
            
            <Button 
              variant="subtle" 
              className="w-full gap-2" 
              onClick={handleViewDetails}
            >
              <Info className="h-4 w-4" />
              View Details
            </Button>
            
            <Button 
              variant="subtle" 
              className="w-full gap-2" 
              onClick={handleWatchTrailer}
            >
              <Clock className="h-4 w-4" />
              Watch Trailer
            </Button>
            
            <Button 
              variant="subtle" 
              className="w-full gap-2" 
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

