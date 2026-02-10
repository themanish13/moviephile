const API_KEY = "aa3704c98b8144f9f2e39f98c8e5ffc6";
const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  runtime?: number;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  videos?: { results: TMDBVideo[] };
  similar?: { results: TMDBMovie[] };
  reviews?: { results: TMDBReview[] };
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  size: number;
  published_at: string;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details: { username: string; avatar_path: string | null; rating: number | null };
  content: string;
  created_at: string;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export function getGenreNames(ids: number[]): string[] {
  return ids.map((id) => GENRE_MAP[id] || "Other").slice(0, 3);
}

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "/placeholder.svg";
  return `${IMG_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280"): string {
  if (!path) return "/placeholder.svg";
  return `${IMG_BASE}/${size}${path}`;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function getTrending(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/trending/movie/week");
  return data.results;
}

export async function getPopular(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/popular");
  return data.results;
}

export async function getNowPlaying(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/now_playing");
  return data.results;
}

export async function getUpcoming(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/upcoming");
  return data.results;
}

export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return fetchTMDB<TMDBMovieDetail>(`/movie/${id}`, { append_to_response: "videos,similar,reviews" });
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/search/movie", { query });
  return data.results;
}

export async function getMovieVideos(id: number): Promise<TMDBVideo[]> {
  const data = await fetchTMDB<{ results: TMDBVideo[] }>(`/movie/${id}/videos`);
  return data.results;
}
