import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTVShowDetail, getTVShowSeason, posterUrl, backdropUrl, type TMDBTVShowDetail, type TMDBSeason, type TMDBEpisode } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Star, Heart, Bookmark, Play, ChevronLeft, Share2, 
  Calendar, Clock, Tv, ChevronDown, X, ListVideo 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const TVShowDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(null);
  const [watchDialogOpen, setWatchDialogOpen] = useState(false);

  const { data: tvShow, isLoading: isShowLoading } = useQuery({
    queryKey: ["tvshow", id],
    queryFn: () => getTVShowDetail(Number(id)),
    enabled: !!id,
  });

  const { data: seasonData, isLoading: isSeasonLoading } = useQuery({
    queryKey: ["tvshow-season", id, selectedSeason],
    queryFn: () => getTVShowSeason(Number(id), selectedSeason),
    enabled: !!id && !!selectedSeason,
  });

  const handleWatchEpisode = (episode: TMDBEpisode) => {
    setSelectedEpisode(episode);
    setWatchDialogOpen(true);
  };

  if (isShowLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-64 md:h-80 rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">TV Show not found.</p>
      </div>
    );
  }

  const year = tvShow.first_air_date?.slice(0, 4) || "TBA";
  const seasons = tvShow.seasons?.filter(s => s.season_number > 0) || [];
  const currentSeason = seasonData;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <img 
          src={backdropUrl(tvShow.backdrop_path)} 
          alt={tvShow.name} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Link to="/mobile">
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 z-10 text-foreground/80 hover:text-foreground gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="px-4 -mt-20 relative z-10 space-y-6">
        {/* Title area */}
        <div className="flex gap-4">
          <img
            src={posterUrl(tvShow.poster_path, "w185")}
            alt={tvShow.name}
            className="w-28 h-40 rounded-xl flex-shrink-0 shadow-2xl object-cover"
          />
          <div className="flex-1 pt-8">
            <h1 className="text-2xl font-bold text-foreground">{tvShow.name}</h1>
            {tvShow.tagline && <p className="text-sm text-muted-foreground italic mt-0.5">{tvShow.tagline}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-star fill-star" />
                <span className="font-bold text-star">{tvShow.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {year}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Tv className="h-3.5 w-3.5" /> {tvShow.number_of_seasons} Seasons
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <ListVideo className="h-3.5 w-3.5" /> {tvShow.number_of_episodes} Episodes
              </span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {tvShow.genres?.map((g) => (
                <Badge key={g.id} variant="outline" className="border-border text-muted-foreground text-xs">
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="purple" className="flex-1 gap-2" onClick={() => {
            if (currentSeason?.episodes?.[0]) {
              handleWatchEpisode(currentSeason.episodes[0]);
            }
          }}>
            <Play className="h-4 w-4" /> Watch S{selectedSeason} E1
          </Button>
          <Button variant={liked ? "purple" : "subtle"} className="flex-1 gap-2" onClick={() => setLiked(!liked)}>
            <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {liked ? "Liked" : "Like"}
          </Button>
          <Button variant={saved ? "purple" : "subtle"} className="flex-1 gap-2" onClick={() => setSaved(!saved)}>
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} /> {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="subtle" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-secondary-foreground leading-relaxed">{tvShow.overview}</p>
        </div>

        {/* Season & Episodes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ListVideo className="h-4 w-4 text-primary" /> Episodes
            </h2>
            {seasons.length > 0 && (
              <Select
                value={selectedSeason.toString()}
                onValueChange={(value) => setSelectedSeason(Number(value))}
              >
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {seasons.map((season) => (
                    <SelectItem 
                      key={season.id} 
                      value={season.season_number.toString()}
                      className="focus:bg-white/10"
                    >
                      Season {season.season_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Episodes List */}
          {isSeasonLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : currentSeason?.episodes ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {currentSeason.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="glass-card rounded-xl p-3 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors group"
                    onClick={() => handleWatchEpisode(episode)}
                  >
                    {/* Episode Thumbnail */}
                    <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                      {episode.still_path ? (
                        <img
                          src={posterUrl(episode.still_path, "w300")}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      {episode.runtime && (
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 text-[10px] rounded text-white">
                          {Math.floor(episode.runtime / 60)}h {episode.runtime % 60}m
                        </span>
                      )}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Episode {episode.episode_number}
                          </p>
                          <h3 className="font-medium text-foreground text-sm line-clamp-1">
                            {episode.name}
                          </h3>
                        </div>
                        {episode.vote_average > 0 && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="h-3 w-3 text-star fill-star" />
                            <span className="text-xs text-star">{episode.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {episode.overview || "No description available."}
                      </p>
                      {episode.air_date && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(episode.air_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No episodes available for this season.</p>
          )}
        </div>

        {/* Similar Shows */}
        {tvShow.similar?.results && tvShow.similar.results.length > 0 && (
          <div className="pb-8">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tv className="h-4 w-4 text-primary" /> Similar Shows
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {tvShow.similar.results.slice(0, 4).map((show) => (
                <Link key={show.id} to={`/tv/${show.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <img
                      src={posterUrl(show.poster_path, "w185")}
                      alt={show.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs font-medium text-white line-clamp-2">{show.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Watch Episode Dialog */}
      <Dialog open={watchDialogOpen} onOpenChange={setWatchDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex flex-col gap-1">
                <span className="text-lg">{tvShow.name}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  S{selectedSeason} E{selectedEpisode?.episode_number} - {selectedEpisode?.name}
                </span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWatchDialogOpen(false)}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Video player would load here</p>
              <p className="text-xs text-muted-foreground mt-2">
                Episode {selectedEpisode?.episode_number}: {selectedEpisode?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="purple" className="flex-1 gap-2">
              <Play className="h-4 w-4" /> Play Episode
            </Button>
            <Button variant="subtle" className="gap-2">
              <Bookmark className="h-4 w-4" /> Add to List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TVShowDetail;
