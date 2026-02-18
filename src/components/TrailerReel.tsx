import { useState, useRef, useEffect, useCallback } from "react";
import { Pause, Volume2, VolumeX, Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TMDBMovie, TMDBVideo } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";

interface TrailerReelProps {
  movie: TMDBMovie;
  trailer: TMDBVideo;
  isVisible: boolean;
  onWatch: () => void;
  onAddToWatchlist: () => void;
  isSaved: boolean;
}

export default function TrailerReel({ movie, trailer, isVisible, onWatch, onAddToWatchlist, isSaved }: TrailerReelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const year = movie.release_date?.slice(0, 4) || "TBA";
  const genres = movie.genre_ids?.slice(0, 3).map((id) => {
    const genreMap: Record<number, string> = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    };
    return genreMap[id] || "";
  }).filter(Boolean) || [];

  // Control video playback via postMessage
  const controlVideo = useCallback((command: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        `{"event":"command","func":"${command}","args":""}`,
        "*"
      );
    }
  }, []);

  // Autoplay when visible, pause when not visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        controlVideo("playVideo");
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      controlVideo("pauseVideo");
    }
  }, [isVisible, controlVideo]);

  const togglePlay = () => {
    if (isPlaying) {
      controlVideo("pauseVideo");
      setIsPlaying(false);
    } else {
      controlVideo("playVideo");
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Get YouTube embed URL with all branding hidden
  const getEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${trailer.key}`;
    const params = new URLSearchParams({
      autoplay: "1",
      controls: "0",
      disablekb: "1",
      fs: "0",
      modestbranding: "1",
      rel: "0",
      showinfo: "0",
      ecver: "2",
      cc_load_policy: "0",
      iv_load_policy: "3",
      mute: isMuted ? "1" : "0",
      loop: "1",
      playlist: trailer.key,
      enablejsapi: "1",
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div 
      className="relative w-full h-screen bg-black flex items-center justify-center snap-start overflow-hidden"
      onClick={togglePlay}
    >
      {/* Video Container */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* YouTube Embed - No branding */}
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />

        {/* Paused Overlay - Only shows when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
              <Pause className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Sound Toggle - Bottom Right */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute bottom-36 right-4 z-20 p-3 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all active:scale-90"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Content Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-10">
          <div className="flex items-end gap-3">
            {/* Movie Poster */}
            <div 
              className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-lg cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onWatch(); }}
            >
              <img
                src={posterUrl(movie.poster_path, "w185")}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Movie Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">{movie.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-white/80 text-xs">
                <span>{year}</span>
                <span>•</span>
                <div className="flex gap-1">
                  {genres.map((genre) => (
                    <span key={genre} className="text-xs">{genre}</span>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onWatch(); }}
                  className="px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                >
                  Watch
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToWatchlist(); }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-white text-white")} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Actions - Right Side */}
        <div className="absolute bottom-28 right-2 z-20 flex flex-col gap-4">
          {/* Like */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className={cn(
              "p-2 rounded-full transition-transform active:scale-110",
              isLiked ? "text-red-500" : "text-white"
            )}>
              <Heart className={cn("h-7 w-7", isLiked && "fill-current")} />
            </div>
            <span className="text-white/90 text-xs font-medium">{isLiked ? "1.2K" : "1.1K"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

