export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  runtime: string;
  description: string;
  poster: string;
  trending?: boolean;
  newRelease?: boolean;
}

export interface Post {
  id: number;
  user: { name: string; avatar: string; badge?: string };
  movie: Movie;
  content: string;
  likes: number;
  comments: number;
  liked?: boolean;
  timestamp: string;
}

export interface Video {
  id: number;
  movieId: number;
  title: string;
  thumbnail: string;
  duration: string;
  type: "trailer" | "clip" | "behind-the-scenes";
}

const posterGradients = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #2d1b69 0%, #1a1a2e 50%, #e94560 100%)",
  "linear-gradient(135deg, #0f3460 0%, #533483 50%, #e94560 100%)",
  "linear-gradient(135deg, #1b1b2f 0%, #162447 50%, #1f4068 100%)",
  "linear-gradient(135deg, #2c003e 0%, #512b58 50%, #8b2252 100%)",
  "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #e94560 30%, #0f3460 100%)",
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
];

export const movies: Movie[] = [
  { id: 1, title: "Dune: Part Three", year: 2026, genre: ["Sci-Fi", "Drama"], rating: 9.1, runtime: "2h 48m", description: "The epic conclusion of the Dune saga. Paul Atreides leads the Fremen in a final battle for the fate of the universe.", poster: posterGradients[0], trending: true, newRelease: true },
  { id: 2, title: "The Last Horizon", year: 2026, genre: ["Thriller", "Mystery"], rating: 8.7, runtime: "2h 12m", description: "A detective uncovers a conspiracy that stretches across dimensions in this mind-bending thriller.", poster: posterGradients[1], trending: true },
  { id: 3, title: "Neon Dreams", year: 2025, genre: ["Sci-Fi", "Action"], rating: 8.4, runtime: "2h 05m", description: "In a cyberpunk city, a hacker discovers the key to rewriting reality itself.", poster: posterGradients[2], newRelease: true },
  { id: 4, title: "Whispers in the Dark", year: 2025, genre: ["Horror", "Thriller"], rating: 7.9, runtime: "1h 55m", description: "A family moves into a historic mansion only to discover its walls hold terrifying secrets.", poster: posterGradients[3] },
  { id: 5, title: "Crimson Tide Rising", year: 2026, genre: ["Action", "Drama"], rating: 8.2, runtime: "2h 20m", description: "An elite squad races against time to prevent a catastrophic event that could reshape geopolitics.", poster: posterGradients[4], trending: true },
  { id: 6, title: "The Gardener", year: 2025, genre: ["Drama", "Romance"], rating: 8.8, runtime: "1h 50m", description: "A touching story about a retired botanist who finds unexpected love and purpose.", poster: posterGradients[5] },
  { id: 7, title: "Eclipse Protocol", year: 2026, genre: ["Sci-Fi", "Thriller"], rating: 8.0, runtime: "2h 15m", description: "When Earth's sun begins to dim, a team of astronauts embarks on a desperate mission.", poster: posterGradients[6], newRelease: true },
  { id: 8, title: "Silent Waters", year: 2025, genre: ["Drama", "Mystery"], rating: 8.5, runtime: "2h 02m", description: "A coastal town harbors deep secrets beneath its tranquil surface.", poster: posterGradients[7] },
];

export const posts: Post[] = [
  { id: 1, user: { name: "CinemaPhile", avatar: "CP", badge: "Top Reviewer" }, movie: movies[0], content: "Just watched Dune: Part Three and I'm speechless. Villeneuve has outdone himself. The cinematography is breathtaking!", likes: 342, comments: 89, timestamp: "2h ago" },
  { id: 2, user: { name: "MovieBuff92", avatar: "MB" }, movie: movies[1], content: "The Last Horizon is the best thriller I've seen this year. The twist at the end left me shook!", likes: 218, comments: 45, timestamp: "4h ago" },
  { id: 3, user: { name: "FilmCritic_Jay", avatar: "FJ", badge: "Movie Buff" }, movie: movies[2], content: "Neon Dreams brings something fresh to the cyberpunk genre. The visuals are absolutely stunning.", likes: 156, comments: 32, timestamp: "6h ago" },
  { id: 4, user: { name: "SciFiLover", avatar: "SL" }, movie: movies[5], content: "The Gardener made me cry. Such a beautiful, understated film. Oscar-worthy performances.", likes: 289, comments: 67, timestamp: "8h ago" },
  { id: 5, user: { name: "ActionAddict", avatar: "AA", badge: "Top Reviewer" }, movie: movies[4], content: "Crimson Tide Rising delivers non-stop action. The set pieces are incredible!", likes: 178, comments: 41, timestamp: "12h ago" },
];

export const videos: Video[] = [
  { id: 1, movieId: 1, title: "Dune: Part Three - Official Trailer", thumbnail: posterGradients[0], duration: "3:24", type: "trailer" },
  { id: 2, movieId: 2, title: "The Last Horizon - Teaser", thumbnail: posterGradients[1], duration: "2:10", type: "trailer" },
  { id: 3, movieId: 3, title: "Neon Dreams - Behind the Scenes", thumbnail: posterGradients[2], duration: "8:45", type: "behind-the-scenes" },
  { id: 4, movieId: 4, title: "Whispers in the Dark - Clip", thumbnail: posterGradients[3], duration: "1:30", type: "clip" },
  { id: 5, movieId: 5, title: "Crimson Tide Rising - Full Trailer", thumbnail: posterGradients[4], duration: "2:55", type: "trailer" },
  { id: 6, movieId: 6, title: "The Gardener - Exclusive Clip", thumbnail: posterGradients[5], duration: "4:12", type: "clip" },
  { id: 7, movieId: 7, title: "Eclipse Protocol - Official Trailer", thumbnail: posterGradients[6], duration: "2:38", type: "trailer" },
  { id: 8, movieId: 8, title: "Silent Waters - Behind the Scenes", thumbnail: posterGradients[7], duration: "6:20", type: "behind-the-scenes" },
];

export const userProfile = {
  name: "Alex Rivera",
  username: "@alexcinema",
  avatar: "AR",
  bio: "Film enthusiast | Sci-fi addict | Always watching something",
  favoriteGenres: ["Sci-Fi", "Thriller", "Drama"],
  stats: { watchlist: 47, watched: 312, reviews: 89, followers: 1240, following: 356 },
  badges: ["Top Reviewer", "Movie Buff", "Sci-Fi Expert"],
};
