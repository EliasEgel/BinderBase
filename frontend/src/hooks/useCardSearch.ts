import { useQuery } from "@tanstack/react-query";
import { searchCards } from "../utils/cardApi";
import type { SearchFilters } from "../utils/cardApi";

/**
 * Custom hook for searching cards using TanStack Query
 * @param filters - Search filters (name)
 * @param enabled - Whether the query should be enabled
 * @returns TanStack Query result
 */
export function useCardSearch(filters: SearchFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ["searchCards", filters],
    queryFn: () => searchCards(filters),
    enabled: enabled && Boolean(filters.name?.trim()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
