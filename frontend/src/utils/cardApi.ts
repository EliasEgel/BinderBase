// API utility for card-related operations

export interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  set: string;
  imageUrl?: string;
  description?: string;
  manaCost?: string;
  power?: number;
  toughness?: number;
}

export interface SearchFilters {
  name?: string;
}

export interface SearchResponse {
  cards: Card[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Search for cards based on provided filters
 * @param filters - Search criteria
 * @param page - Page number (default: 1)
 * @param pageSize - Number of results per page (default: 20)
 * @returns Promise with search results
 */
export async function searchCards(
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResponse> {
  // TODO: Implement actual API call to backend
  // For now, return mock data structure
  console.log(
    "Searching cards with filters:",
    filters,
    "page:",
    page,
    "pageSize:",
    pageSize
  );

  // Mock response structure - replace with actual API call
  return {
    cards: [],
    total: 0,
    page,
    pageSize,
  };
}

/**
 * Get card details by ID
 * @param cardId - Unique card identifier
 * @returns Promise with card details
 */
export async function getCardById(cardId: string): Promise<Card | null> {
  // TODO: Implement actual API call to backend
  console.log("Fetching card by ID:", cardId);

  // Mock response - replace with actual API call
  return null;
}

/**
 * Get all available card sets
 * @returns Promise with list of card sets
 */
export async function getCardSets(): Promise<string[]> {
  // TODO: Implement actual API call to backend
  console.log("Fetching card sets");

  // Mock response - replace with actual API call
  return [];
}

/**
 * Get all available card rarities
 * @returns Promise with list of card rarities
 */
export async function getCardRarities(): Promise<string[]> {
  // TODO: Implement actual API call to backend
  console.log("Fetching card rarities");

  // Mock response - replace with actual API call
  return [];
}

/**
 * Get all available card types
 * @returns Promise with list of card types
 */
export async function getCardTypes(): Promise<string[]> {
  // TODO: Implement actual API call to backend
  console.log("Fetching card types");

  // Mock response - replace with actual API call
  return [];
}
