import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden card-hover animate-fade-in">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {post.user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{post.user.name}</span>
            {post.user.badge && (
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">
                {post.user.badge}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <p className="px-4 pb-3 text-sm text-secondary-foreground leading-relaxed">{post.content}</p>

      {/* Movie Card */}
      <Link to={`/movie/${post.movie.id}`} className="block mx-4 mb-3">
        <div className="flex gap-3 bg-secondary/50 rounded-lg p-3 transition-colors hover:bg-secondary/80 group">
          <div
            className="w-16 h-24 rounded-md flex-shrink-0 flex items-end p-1"
            style={{ background: post.movie.poster }}
          >
            <span className="text-[8px] font-bold text-foreground/80 leading-tight">{post.movie.title}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {post.movie.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{post.movie.year}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{post.movie.runtime}</span>
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="h-3 w-3 text-star fill-star" />
                <span className="text-xs font-medium text-star">{post.movie.rating}</span>
              </div>
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {post.movie.genre.map((g) => (
                <span key={g} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {g}
                </span>
              ))}
              {post.movie.trending && (
                <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> Trending
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-cinema-red" onClick={handleLike}>
            <Heart className={cn("h-4 w-4 transition-all", liked && "fill-cinema-red text-cinema-red animate-heart-beat")} />
            <span className="text-xs">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => setSaved(!saved)}>
          <Bookmark className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
        </Button>
      </div>
    </div>
  );
}
