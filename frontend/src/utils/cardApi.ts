// API utility for card-related operations

// Type for user collection response
export type CardResponseDto = {
  id: number;
  name: string;
  cardId: string;
  username: string;
};

export interface Card {
  id: string;
  name: string;
  names?: string[];
  manaCost?: string;
  cmc?: number;
  colors?: string[];
  colorIdentity?: string[];
  type: string;
  supertypes?: string[];
  types?: string[];
  subtypes?: string[];
  rarity: string;
  set: string;
  text?: string;
  artist?: string;
  number?: string;
  power?: string;
  toughness?: string;
  layout?: string;
  imageUrl?: string;
}

// Can be extended with more filters later
export interface SearchFilters {
  name?: string;
}

export interface SearchResponse {
  cards: Card[];
  total: number;
}

// MTG API response interface
interface MTGCard {
  name: string;
  names?: string[];
  manaCost?: string;
  cmc?: number;
  colors?: string[];
  colorIdentity?: string[];
  type: string;
  supertypes?: string[];
  types?: string[];
  subtypes?: string[];
  rarity: string;
  set: string;
  text?: string;
  artist?: string;
  number?: string;
  power?: string;
  toughness?: string;
  layout?: string;
  multiverseid?: number;
  imageUrl?: string;
  id: string;
}

interface MTGApiResponse {
  cards: MTGCard[];
}

/**
 * Search for cards based on provided filters
 * @param filters - Search criteria
 * @returns Promise with search results
 */
export async function searchCards(
  filters: SearchFilters
): Promise<SearchResponse> {
  try {
    // Get the API base URL from environment variables
    const apiBaseUrl = import.meta.env.VITE_MTG_API;

    if (!apiBaseUrl) {
      throw new Error("VITE_MTG_API environment variable is not set");
    }

    // Build the search URL
    const searchParams = new URLSearchParams();
    if (filters.name) {
      searchParams.append("name", filters.name);
    }

    const url = `${apiBaseUrl}/cards?${searchParams.toString()}`;

    console.log("Making API call to:", url);

    // Make the API call
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: MTGApiResponse = await response.json();

    // Map MTG API response to our Card interface
    const cards: Card[] = data.cards.map((mtgCard) => ({
      id: mtgCard.id,
      name: mtgCard.name,
      names: mtgCard.names,
      manaCost: mtgCard.manaCost,
      cmc: mtgCard.cmc,
      colors: mtgCard.colors,
      colorIdentity: mtgCard.colorIdentity,
      type: mtgCard.type,
      supertypes: mtgCard.supertypes,
      types: mtgCard.types,
      subtypes: mtgCard.subtypes,
      rarity: mtgCard.rarity,
      set: mtgCard.set,
      text: mtgCard.text,
      artist: mtgCard.artist,
      number: mtgCard.number,
      power: mtgCard.power,
      toughness: mtgCard.toughness,
      layout: mtgCard.layout,
      imageUrl: mtgCard.imageUrl,
    }));

    return {
      cards,
      total: cards.length,
    };
  } catch (error) {
    console.error("Error searching cards:", error);
    throw new Error(
      `Failed to search cards: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
