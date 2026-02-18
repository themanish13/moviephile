import { useState, useRef, useEffect, useCallback } from "react";
import { Pause, Bookmark, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TMDBMovie, TMDBVideo } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";

interface MobileTrailerReelProps {
  movie: TMDBMovie;
  trailer: TMDBVideo;
  isVisible: boolean;
  isSaved: boolean;
  onSave: () => void;
  onWatch: () => void;
}

export default function MobileTrailerReel({
  movie,
  trailer,
  isVisible,
  isSaved,
  onSave,
  onWatch,
}: MobileTrailerReelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const year = movie.release_date?.slice(0, 4) || "TBA";
  const rating = movie.vote_average?.toFixed(1) || "0.0";
  
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
  const controlVideo = useCallback((command: string, args?: string[]) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: args || [],
        }),
        "*"
      );
    }
  }, []);

  // Show/hide controls with timeout
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Handle video ready
  const handleVideoReady = () => {
    setIsLoading(false);
  };

  // Autoplay when visible - force remount when visibility changes to properly stop video
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // When not visible, immediately stop playing
      setIsPlaying(false);
      // Force pause via postMessage for extra reliability
      controlVideo("pauseVideo");
      controlVideo("stopVideo");
    }
  }, [isVisible, controlVideo]);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      controlVideo("pauseVideo");
      setIsPlaying(false);
      setShowControls(true);
    } else {
      controlVideo("playVideo");
      setIsPlaying(true);
      showControlsTemporarily();
    }
  };


  // Get YouTube embed URL with all branding hidden
  const getEmbedUrl = useCallback(() => {
    const videoId = trailer.key;
    const params = new URLSearchParams({
      autoplay: isVisible ? "1" : "0",
      controls: "0",
      disablekb: "1",
      fs: "0",
      modestbranding: "1",
      rel: "0",
      showinfo: "0",
      ecver: "2",
      cc_load_policy: "0",
      iv_load_policy: "3",
      mute: "0", // Always unmuted
      loop: "1",
      playlist: videoId,
      enablejsapi: "1",
      origin: window.location.origin,
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [trailer.key, isVisible]);

  // Handle interactions
  const handleInteraction = () => {
    showControlsTemporarily();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      onClick={handleInteraction}
    >
      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* YouTube Embed - key forces remount when visibility changes */}
        {isVisible && (
          <iframe
            ref={iframeRef}
            key={`${trailer.key}-${isVisible}`}
            src={getEmbedUrl()}
            className="w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleVideoReady}
            style={{ border: "none" }}
          />
        )}
        {/* Black placeholder when not visible */}
        {!isVisible && (
          <div className="w-full h-full bg-black" />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-white/60 text-sm">Loading...</span>
            </div>
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />
        
        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Paused Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 animate-pulse"
            >
              <Play className="h-10 w-10 text-white ml-1" fill="white" />
            </button>
          </div>
        )}

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-medium">
              HD
            </span>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 z-20">
          <div className="flex items-end gap-3">
            {/* Movie Poster */}
            <div 
              className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg cursor-pointer border border-white/10"
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
              <h2 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-white/80 text-xs">
                <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-white/90">
                  {year}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium">{rating}</span>
                </span>
                <span className="text-white/60">•</span>
                <div className="flex gap-1">
                  {genres.slice(0, 2).map((genre) => (
                    <span key={genre} className="text-xs text-white/70">{genre}</span>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onWatch(); }}
                  className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 shadow-lg"
                >
                  Watch Now
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  className="p-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all active:scale-90"
                  title="Add to Watchlist"
                >
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-white text-white")} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onWatch(); }}
                  className="p-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all active:scale-90"
                  title="Details"
                >
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
