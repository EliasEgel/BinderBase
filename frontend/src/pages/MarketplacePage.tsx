import { useState, useMemo } from "react"; // 👈 Import useState and useMemo
import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchAllCardsForSale } from "../utils/marketplaceApi";
import type { CardResponseDto } from "../utils/cardApi";
import MarketplaceCard from "../components/MarketplaceCard";

// Define the possible sort options
type SortOrder = "price_asc" | "price_desc" | "name_asc" | "name_desc";

export default function MarketplacePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("price_asc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplaceCards"],
    queryFn: async () => {
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error("Authentication token not available");
      }
      const result = await fetchAllCardsForSale(clerkToken);
      return result.data as CardResponseDto[];
    },
    enabled: !!userId,
  });
  const cards = data || [];
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards;

    // Apply search filter (checks card name and seller username)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(lowerCaseSearch) ||
          card.username.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply sorting
    switch (sortOrder) {
      case "price_asc":
        return filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_desc":
        return filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name_asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [cards, searchTerm, sortOrder]); // Re-run only if these dependencies change

  if (!userId) {
    return (
      <div className="p-8 text-center">
        Please sign in to view the marketplace.
      </div>
    );
  }

  // Show a loading state while fetching
  if (isLoading)
    return <div className="p-8 text-center">Loading marketplace...</div>;

  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading marketplace.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ← Back to Home
          </a>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Marketplace
        </h2>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Name or Seller
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., 'Counterspell' or 'Seller Name'"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="md:w-1/4">
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {cards.length === 0 ? (
          // This shows if the marketplace is truly empty (no data from API)
          <div className="text-center text-gray-500 mt-12">
            <p>There are no cards for sale right now.</p>
          </div>
        ) : filteredAndSortedCards.length === 0 ? (
          // This shows if filters result in no matches
          <div className="text-center text-gray-500 mt-12">
            <p>No cards match your current filters.</p>
          </div>
        ) : (
          // Otherwise, show the filtered and sorted grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedCards.map((card) => (
              <MarketplaceCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
