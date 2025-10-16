import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CardSearchForm from "../components/CardSearchForm";
import CardGrid from "../components/CardGrid";
import CardDetailModal from "../components/CardDetailModal";
import { searchCards } from "../utils/cardApi";
import type { SearchFilters, Card } from "../utils/cardApi";

export default function SearchCardsPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Use React Query for API calls
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["searchCards", searchFilters, page, pageSize],
    queryFn: () => searchCards(searchFilters, page, pageSize),
    enabled: Object.keys(searchFilters).length > 0, // Only search when filters are provided
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1); // Reset to first page on new search
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = searchResults
    ? Math.ceil(searchResults.total / pageSize)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
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
        {Object.keys(searchFilters).length > 0 && (
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

            {/* Pagination */}
            {searchResults && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          pageNum === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {Object.keys(searchFilters).length === 0 && (
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
