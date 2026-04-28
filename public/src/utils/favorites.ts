const STORAGE_KEY = "dch:favorites";

export function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: number): { added: boolean } {
  const current = getFavorites();
  const isAlreadyFav = current.includes(id);
  if (isAlreadyFav) {
    const updated = current.filter((f) => f !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { added: false };
  } else {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { added: true };
  }
}
