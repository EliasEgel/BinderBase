import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import type { CardResponseDto } from "../utils/cardApi";
import { useAuth } from "@clerk/clerk-react";
import { fetchUserCollection } from "../utils/fetchUserCollection";

export default function CollectionsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["userCards", userId],
    queryFn: async () => {
      const clerkToken = await getToken();
      const result = await fetchUserCollection(userId!, clerkToken!);
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

  const cards = data as CardResponseDto[];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Collection</h2>
      {cards?.length === 0 ? (
        <div className="text-center text-gray-500">
          No cards in your collection yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards?.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded shadow p-4 flex flex-col items-center"
            >
              <div className="font-semibold text-lg mb-2">{card.name}</div>
              <div className="text-gray-600">Card ID: {card.cardId}</div>
              <div className="text-gray-400 text-sm mt-2">
                Added by: {card.username}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
