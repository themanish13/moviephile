import { movies, posts } from "@/data/mockData";
import PostCard from "@/components/PostCard";
import MovieCard from "@/components/MovieCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const filterTabs = ["For You", "Trending", "New Releases", "My Watchlist"] as const;

const Index = () => {
  const [activeFilter, setActiveFilter] = useState<string>("For You");
  const trendingMovies = movies.filter((m) => m.trending || m.newRelease);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 animate-fade-in">
        <img src={heroBanner} alt="Cinema" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8 max-w-md">
          <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary/30 gap-1">
            <Sparkles className="h-3 w-3" /> New Releases This Week
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Discover & Share Your Favorite Films
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join the community. Review, discuss, and curate your watchlist.
          </p>
        </div>
      </div>

      {/* Trending Carousel */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Now
          </h2>
          <Button variant="ghost-gold" size="sm" className="gap-1 text-xs">
            See All <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} className="w-32 md:w-36 flex-shrink-0" />
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? "gold" : "subtle"}
            size="sm"
            className="text-xs whitespace-nowrap"
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Index;
