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

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes?: TMDBEpisode[];
}

export interface TMDBTVShowDetail extends TMDBTVShow {
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  seasons: TMDBSeason[];
  videos?: { results: TMDBVideo[] };
  similar?: { results: TMDBTVShow[] };
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

export async function getTrending(page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/trending/movie/week", { page: page.toString() });
}

export async function getPopular(page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/movie/popular", { page: page.toString() });
}

export async function getNowPlaying(page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/movie/now_playing", { page: page.toString() });
}

export async function getUpcoming(page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/movie/upcoming", { page: page.toString() });
}

export async function getTopRated(page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/movie/top_rated", { page: page.toString() });
}

export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return fetchTMDB<TMDBMovieDetail>(`/movie/${id}`, { append_to_response: "videos,similar,reviews" });
}

export async function getMovieById(id: number): Promise<TMDBMovie> {
  return fetchTMDB<TMDBMovie>(`/movie/${id}`, {});
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/search/movie", { query });
  return data.results;
}

export async function getMovieVideos(id: number): Promise<TMDBVideo[]> {
  const data = await fetchTMDB<{ results: TMDBVideo[] }>(`/movie/${id}/videos`);
  return data.results;
}

export async function getTrendingTV(page = 1): Promise<{ results: TMDBTVShow[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBTVShow[]; page: number; total_pages: number }>("/trending/tv/week", { page: page.toString() });
}

export async function getPopularTV(page = 1): Promise<{ results: TMDBTVShow[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBTVShow[]; page: number; total_pages: number }>("/tv/popular", { page: page.toString() });
}

export async function getTVOnTheAir(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/tv/on_the_air");
  return data.results;
}

export async function getTVTopRated(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/tv/top_rated");
  return data.results;
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<{ results: TMDBMovie[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBMovie[]; page: number; total_pages: number }>("/discover/movie", { with_genres: genreId.toString(), page: page.toString() });
}

export async function getTVByGenre(genreId: number, page = 1): Promise<{ results: TMDBTVShow[]; page: number; total_pages: number }> {
  return fetchTMDB<{ results: TMDBTVShow[]; page: number; total_pages: number }>("/discover/tv", { with_genres: genreId.toString(), page: page.toString() });
}

export async function getTVVideos(id: number): Promise<TMDBVideo[]> {
  const data = await fetchTMDB<{ results: TMDBVideo[] }>(`/tv/${id}/videos`);
  return data.results;
}

export async function getTVShowDetail(id: number): Promise<TMDBTVShowDetail> {
  return fetchTMDB<TMDBTVShowDetail>(`/tv/${id}`, { append_to_response: "videos,similar" });
}

export async function getTVShowSeason(tvId: number, seasonNumber: number): Promise<TMDBSeason> {
  return fetchTMDB<TMDBSeason>(`/tv/${tvId}/season/${seasonNumber}`);
}
