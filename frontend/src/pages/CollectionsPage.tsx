import { useQuery } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import type { CardResponseDto } from "../utils/cardApi";
import { fetchUserCollection } from "../utils/fetchUserCollection";
import CollectionCard from "../components/CollectionCard"; 
export default function CollectionsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["userCards", userId], // This key is important for invalidation
    queryFn: async () => {
      const clerkToken = await getToken();
      if (!userId || !clerkToken) {
        throw new Error("User or token not available");
      }
      const result = await fetchUserCollection(userId, clerkToken);
      return result.data as CardResponseDto[];
    },
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="p-8 text-center">
        Please sign in to view your collection.
      </div>
    );
  }
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">Error loading cards.</div>
    );

  const cards = data || []; // Default to empty array

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ← Back to Search
          </a>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Your Collection
        </h2>

        {cards.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p>No cards in your collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 👇 Replace the old div with the new component */}
            {cards.map((card) => (
              <CollectionCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
