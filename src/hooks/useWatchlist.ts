import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistStatus,
  updateWatchlistProgress,
  checkInWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";
import type { TMDBMovie } from "@/lib/tmdb";
import { useState, useCallback } from "react";

export type { WatchlistItem };

// Main watchlist hook
export const useWatchlist = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [localSavedMovies, setLocalSavedMovies] = useState<Set<number>>(new Set());

  // Fetch watchlist from Supabase
  const {
    data: watchlist = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["watchlist", user?.email],
    queryFn: () => (user ? fetchWatchlist(user.email) : Promise.resolve([])),
    enabled: isAuthenticated && !!user,
    staleTime: 30000,
  });

  // Check if a specific movie is saved
  const isSaved = useCallback(
    (movieId: number) => {
      return localSavedMovies.has(movieId) || watchlist.some((item) => item.movie_id === movieId);
    },
    [watchlist, localSavedMovies]
  );

  // Add movie to watchlist
  const addMovie = useMutation({
    mutationFn: async (movie: TMDBMovie) => {
      if (!user) throw new Error("Must be logged in");
      return addToWatchlist(user.email, movie, "plan");
    },
    onSuccess: (_, movie) => {
      setLocalSavedMovies((prev) => new Set(prev).add(movie.id));
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.email] });
    },
  });

  // Remove movie from watchlist
  const removeMovie = useMutation({
    mutationFn: async (movieId: number) => {
      if (!user) throw new Error("Must be logged in");
      return removeFromWatchlist(user.email, movieId);
    },
    onSuccess: (_, movieId) => {
      setLocalSavedMovies((prev) => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.email] });
    },
  });

  // Toggle movie in watchlist - direct function
  const toggleMovie = useCallback(async (movie: TMDBMovie) => {
    if (!user) {
      alert("Please sign in to add movies to your watchlist");
      return;
    }
    
    const inWatchlist = await checkInWatchlist(user.email, movie.id);
    if (inWatchlist) {
      await removeFromWatchlist(user.email, movie.id);
    } else {
      await addToWatchlist(user.email, movie, "plan");
    }
    
    setLocalSavedMovies((prev) => {
      const next = new Set(prev);
      if (next.has(movie.id)) {
        next.delete(movie.id);
      } else {
        next.add(movie.id);
      }
      return next;
    });
    
    queryClient.invalidateQueries({ queryKey: ["watchlist", user?.email] });
  }, [user, queryClient]);

  // Update movie status
  const updateStatus = useMutation({
    mutationFn: async ({
      movieId,
      status,
    }: {
      movieId: number;
      status: WatchlistItem["status"];
    }) => {
      if (!user) throw new Error("Must be logged in");
      return updateWatchlistStatus(user.email, movieId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.email] });
    },
  });

  // Update movie progress
  const updateProgress = useMutation({
    mutationFn: async ({
      movieId,
      progress,
    }: {
      movieId: number;
      progress: number;
    }) => {
      if (!user) throw new Error("Must be logged in");
      return updateWatchlistProgress(user.email, movieId, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.email] });
    },
  });

  // Quick actions
  const markAsWatching = useCallback(
    (movieId: number) => {
      updateStatus.mutate({ movieId, status: "watching" });
    },
    [updateStatus]
  );

  const markAsWatched = useCallback(
    (movieId: number) => {
      updateStatus.mutate({ movieId, status: "watched" });
      updateProgress.mutate({ movieId, progress: 100 });
    },
    [updateStatus, updateProgress]
  );

  const markAsPlan = useCallback(
    (movieId: number) => {
      updateStatus.mutate({ movieId, status: "plan" });
      updateProgress.mutate({ movieId, progress: 0 });
    },
    [updateStatus, updateProgress]
  );

  return {
    watchlist,
    isLoading,
    error,
    refetch,
    isSaved,
    addMovie,
    removeMovie,
    toggleMovie,
    updateStatus,
    updateProgress,
    markAsWatching,
    markAsWatched,
    markAsPlan,
  };
};

// Hook for checking a single movie's watchlist status - standalone version
export const useWatchlistStatus = (movieId: number) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: watchlist = [],
    isLoading,
  } = useQuery({
    queryKey: ["watchlist", user?.email],
    queryFn: () => (user ? fetchWatchlist(user.email) : Promise.resolve([])),
    enabled: isAuthenticated && !!user,
    staleTime: 30000,
  });

  const item = watchlist.find((item: WatchlistItem) => item.movie_id === movieId);

  return {
    isLoading,
    isSaved: !!item,
    status: item?.status as "watching" | "watched" | "plan" | undefined,
    progress: item?.progress,
  };
};
