import { supabase } from "./supabase";
import type { TMDBMovie } from "./tmdb";

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster_path: string | null;
  status: "watching" | "watched" | "plan";
  progress: number;
  created_at: string;
}

// Fetch user's watchlist from Supabase
export const fetchWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }

  return data || [];
};

// Add movie to watchlist
export const addToWatchlist = async (
  userId: string,
  movie: TMDBMovie,
  status: WatchlistItem["status"] = "plan"
): Promise<WatchlistItem | null> => {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      movie_id: movie.id,
      movie_title: movie.title,
      movie_poster_path: movie.poster_path,
      status,
      progress: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding to watchlist:", error);
    return null;
  }

  return data;
};

// Remove movie from watchlist
export const removeFromWatchlist = async (userId: string, movieId: number): Promise<boolean> => {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }

  return true;
};

// Update watchlist item status
export const updateWatchlistStatus = async (
  userId: string,
  movieId: number,
  status: WatchlistItem["status"]
): Promise<boolean> => {
  const { error } = await supabase
    .from("watchlist")
    .update({ status })
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    console.error("Error updating watchlist status:", error);
    return false;
  }

  return true;
};

// Update watchlist item progress
export const updateWatchlistProgress = async (
  userId: string,
  movieId: number,
  progress: number
): Promise<boolean> => {
  const { error } = await supabase
    .from("watchlist")
    .update({ progress })
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    console.error("Error updating watchlist progress:", error);
    return false;
  }

  return true;
};

// Check if movie is in watchlist
export const checkInWatchlist = async (
  userId: string,
  movieId: number
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
};

// Get single watchlist item
export const getWatchlistItem = async (
  userId: string,
  movieId: number
): Promise<WatchlistItem | null> => {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .single();

  if (error) {
    return null;
  }

  return data;
};

