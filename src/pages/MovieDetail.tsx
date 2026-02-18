import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail, posterUrl, backdropUrl } from "@/lib/tmdb";
import type { TMDBVideo, TMDBMovie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Heart, Bookmark, Play, Clock, Calendar, Film, ChevronLeft, Share2, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";

const MovieDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<TMDBVideo | null>(null);

  // Use watchlist hook for real watchlist functionality
  const { isSaved, toggleMovie } = useWatchlist();
  const [localSaved, setLocalSaved] = useState(false);

  // Combine local state with server state for instant feedback
  const saved = isSaved(Number(id)) || localSaved;

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetail(Number(id)),
    enabled: !!id,
  });

  // Handle add/remove from watchlist
  const handleToggleWatchlist = () => {
    if (!isAuthenticated) {
      // TODO: Show login prompt
      alert("Please sign in to add movies to your watchlist");
      return;
    }
    
    if (movie) {
      toggleMovie(movie as TMDBMovie);
    }
    setLocalSaved(!localSaved);
  };

  const handleWatchTrailer = (trailer: TMDBVideo) => {
    setSelectedTrailer(trailer);
    setTrailerDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-64 md:h-80 rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Movie not found.</p>
      </div>
    );
  }

  const year = movie.release_date?.slice(0, 4) || "TBA";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";
  const trailers = movie.videos?.results.filter((v) => v.site === "YouTube" && v.type === "Trailer") || [];
  const allVideos = movie.videos?.results.filter((v) => v.site === "YouTube") || [];
  const similar = movie.similar?.results.slice(0, 8) || [];
  const reviews = movie.reviews?.results.slice(0, 5) || [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <img src={backdropUrl(movie.backdrop_path)} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Link to="/">
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 z-10 text-foreground/80 hover:text-foreground gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="px-4 -mt-20 relative z-10 space-y-6">
        {/* Title area */}
        <div className="flex gap-4">
          <img
            src={posterUrl(movie.poster_path, "w185")}
            alt={movie.title}
            className="w-28 h-40 rounded-xl flex-shrink-0 shadow-2xl object-cover"
          />
          <div className="flex-1 pt-8">
            <h1 className="text-2xl font-bold text-foreground">{movie.title}</h1>
            {movie.tagline && <p className="text-sm text-muted-foreground italic mt-0.5">{movie.tagline}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-star fill-star" />
                <span className="font-bold text-star">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {year}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {runtime}
              </span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {movie.genres.map((g) => (
                <Badge key={g.id} variant="outline" className="border-border text-muted-foreground text-xs">
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {trailers.length > 0 && (
            <Button variant="purple" className="flex-1 gap-2" onClick={() => handleWatchTrailer(trailers[0])}>
              <Play className="h-4 w-4" /> Watch Trailer
            </Button>
          )}
          <Button variant={liked ? "purple" : "subtle"} className="flex-1 gap-2" onClick={() => setLiked(!liked)}>
            <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {liked ? "Liked" : "Like"}
          </Button>
          <Button variant={saved ? "purple" : "subtle"} className="flex-1 gap-2" onClick={handleToggleWatchlist}>
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} /> {saved ? "In Watchlist" : "Add to Watchlist"}
          </Button>
          <Button variant="subtle" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-secondary-foreground leading-relaxed">{movie.overview}</p>
        </div>

        {/* Trailers & Videos */}
        {allVideos.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" /> Videos & Trailers
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allVideos.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleWatchTrailer(v)}
                  className="w-56 flex-shrink-0 rounded-lg overflow-hidden glass-card cursor-pointer group text-left"
                >
                  <div className="aspect-video relative">
                    <img
                      src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                      alt={v.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 group-hover:bg-background/10 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-background/90 px-1 py-0.5 text-[10px] rounded text-muted-foreground">
                      {v.type}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">{v.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" /> Reviews
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{review.author}</span>
                    {review.author_details.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-star fill-star" />
                        <span className="text-xs text-star">{review.author_details.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-secondary-foreground line-clamp-4">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="pb-8">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" /> You Might Also Like
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {similar.slice(0, 4).map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Dialog */}
      <Dialog open={trailerDialogOpen} onOpenChange={setTrailerDialogOpen}>
        <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                {selectedTrailer?.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTrailerDialogOpen(false)}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedTrailer && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
                title={selectedTrailer.name}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieDetail;
