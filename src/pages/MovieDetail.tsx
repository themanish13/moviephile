import { useParams, Link } from "react-router-dom";
import { movies, posts, videos } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MovieCard from "@/components/MovieCard";
import { Star, Heart, MessageCircle, Bookmark, Play, Clock, Calendar, Film, ChevronLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MovieDetail = () => {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === Number(id));
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const relatedMovies = movies.filter((m) => m.id !== Number(id)).slice(0, 4);
  const movieVideos = videos.filter((v) => v.movieId === Number(id));
  const moviePosts = posts.filter((p) => p.movie.id === Number(id));

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 md:h-80" style={{ background: movie.poster }}>
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
          <div
            className="w-28 h-40 rounded-xl flex-shrink-0 shadow-2xl flex items-end p-2"
            style={{ background: movie.poster }}
          >
            <span className="text-[9px] font-bold text-foreground/80">{movie.title}</span>
          </div>
          <div className="flex-1 pt-8">
            <h1 className="text-2xl font-bold text-foreground">{movie.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-star fill-star" />
                <span className="font-bold text-star">{movie.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {movie.year}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {movie.runtime}
              </span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {movie.genre.map((g) => (
                <Badge key={g} variant="outline" className="border-border text-muted-foreground text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant={liked ? "gold" : "subtle"}
            className="flex-1 gap-2"
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {liked ? "Liked" : "Like"}
          </Button>
          <Button
            variant={saved ? "gold" : "subtle"}
            className="flex-1 gap-2"
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "In Watchlist" : "Add to Watchlist"}
          </Button>
          <Button variant="subtle" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-secondary-foreground leading-relaxed">{movie.description}</p>
        </div>

        {/* Videos */}
        {movieVideos.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" /> Videos
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movieVideos.map((v) => (
                <div
                  key={v.id}
                  className="w-56 flex-shrink-0 rounded-lg overflow-hidden glass-card cursor-pointer group"
                >
                  <div className="aspect-video relative" style={{ background: v.thumbnail }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-background/80 rounded px-1 py-0.5 text-[9px] text-foreground">
                      {v.duration}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" /> Reviews & Comments
          </h2>
          {moviePosts.length > 0 ? (
            <div className="space-y-3">
              {moviePosts.map((post) => (
                <div key={post.id} className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {post.user.avatar}
                    </div>
                    <span className="text-sm font-medium text-foreground">{post.user.name}</span>
                    <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                  </div>
                  <p className="text-sm text-secondary-foreground">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* Related Movies */}
        <div className="pb-8">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" /> You Might Also Like
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {relatedMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
