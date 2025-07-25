import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface UserFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}

export function useFavorites() {
  const { user } = useSupabaseAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      console.log('⭐ No user ID, clearing favorites');
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      console.log('⭐ Fetching favorites for user:', user.id);
      setLoading(true);
      const response = await fetch(`/api/favorites?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch favorites');
      }

      console.log('⭐ Favorites loaded:', data.favorites.length, 'items');
      setFavorites(data.favorites);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check if a tool is favorited
  const isFavorite = useCallback((toolId: string) => {
    return favorites.some(fav => fav.tool_id === toolId);
  }, [favorites]);

  // Get favorite with note for a specific tool
  const getFavorite = useCallback((toolId: string) => {
    return favorites.find(fav => fav.tool_id === toolId);
  }, [favorites]);

  // Add a tool to favorites
  const addFavorite = useCallback(async (toolId: string, note?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          toolId,
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add favorite');
      }

      // Update local state
      setFavorites(prev => [data.favorite, ...prev]);
      return data.favorite;
    } catch (err: any) {
      console.error('Error adding favorite:', err);
      throw err;
    }
  }, [user?.id]);

  // Remove a tool from favorites
  const removeFavorite = useCallback(async (toolId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          toolId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove favorite');
      }

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.tool_id !== toolId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      throw err;
    }
  }, [user?.id]);

  // Update note for a favorite
  const updateFavoriteNote = useCallback(async (toolId: string, note: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          toolId,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update favorite');
      }

      // Update local state
      setFavorites(prev => prev.map(fav => 
        fav.tool_id === toolId ? { ...fav, note, updated_at: data.favorite.updated_at } : fav
      ));
      return data.favorite;
    } catch (err: any) {
      console.error('Error updating favorite:', err);
      throw err;
    }
  }, [user?.id]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (toolId: string, note?: string) => {
    if (isFavorite(toolId)) {
      await removeFavorite(toolId);
    } else {
      await addFavorite(toolId, note);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Load favorites when user changes
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    getFavorite,
    addFavorite,
    removeFavorite,
    updateFavoriteNote,
    toggleFavorite,
    refetch: fetchFavorites,
  };
} 