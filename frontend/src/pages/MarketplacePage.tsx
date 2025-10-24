import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchAllCardsForSale } from "../utils/marketplaceApi"; // Import new API function
import type { CardResponseDto } from "../utils/cardApi";
import MarketplaceCard from "../components/MarketplaceCard"; // Import new card component

export default function MarketplacePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplaceCards"], // A new, unique query key
    queryFn: async () => {
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error("Authentication token not available");
      }
      const result = await fetchAllCardsForSale(clerkToken);
      return result.data as CardResponseDto[];
    },
    enabled: !!userId, // Only run if the user is logged in
  });

  if (!userId) {
    return (
      <div className="p-8 text-center">
        Please sign in to view the marketplace.
      </div>
    );
  }
  if (isLoading)
    return <div className="p-8 text-center">Loading marketplace...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading marketplace.
      </div>
    );

  const cards = data || [];

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

        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Marketplace
        </h2>

        {cards.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p>There are no cards for sale right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <MarketplaceCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}