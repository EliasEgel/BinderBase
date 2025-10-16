import { useState } from "react";
import CardSearchForm from "../components/CardSearchForm";
import CardGrid from "../components/CardGrid";
import CardDetailModal from "../components/CardDetailModal";
import { useCardSearch } from "../hooks/useCardSearch";
import type { SearchFilters, Card } from "../utils/cardApi";

export default function SearchCardsPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Use TanStack Query for API calls
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useCardSearch(searchFilters, hasSearched);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setHasSearched(true); // Enable the query to run
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back to index */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-block px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            Back
          </a>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Card Search</h1>
          <p className="text-gray-600">
            Search and explore TCG cards in your collection
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <CardSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Search Results
              </h2>
              {searchResults && (
                <div className="text-sm text-gray-600">
                  {searchResults.total} cards found
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-red-800">
                  Error searching cards: {error.message}
                </div>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Card Grid */}
            <CardGrid
              cards={searchResults?.cards || []}
              isLoading={isLoading}
              onCardClick={handleCardClick}
            />

            {/* Results count */}
            {searchResults && searchResults.cards.length > 0 && (
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Showing {searchResults.cards.length} of {searchResults.total}{" "}
                  cards
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Search
            </h3>
            <p className="text-gray-600">
              Use the search form above to find cards in your collection
            </p>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
