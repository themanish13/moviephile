import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

export function TopRatedIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-4 h-4", className)} 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function PopularIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-4 h-4", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

export function LatestIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-4 h-4", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

export function ReelsIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

export function ProfileIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill={cn("none", className?.includes("fill") ? "currentColor" : "none")} 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TrendingIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  );
}

export function FilmIcon({ className }: IconProps) {
  return (
    <svg 
      className={cn("w-5 h-5", className)} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

