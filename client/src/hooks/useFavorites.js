import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "galerie:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  const toggleFavorite = useCallback((tokenId) => {
    setFavorites((prev) => {
      if (!tokenId) return prev;
      const id = String(tokenId);
      return prev.includes(id)
        ? prev.filter((existingId) => existingId !== id)
        : [...prev, id];
    });
  }, []);

  const isFavorite = useCallback(
    (tokenId) => {
      if (!tokenId) return false;
      const id = String(tokenId);
      return favorites.includes(id);
    },
    [favorites]
  );

  return { favorites, isFavorite, toggleFavorite };
}

