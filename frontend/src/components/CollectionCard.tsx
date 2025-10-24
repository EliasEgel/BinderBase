import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import type { CardResponseDto } from "../utils/cardApi";
import {
  listCardForSale,
  unlistCard,
  markCardAsSold,
} from "../utils/marketplaceApi";

// A small component for displaying the card's status as a badge
const StatusBadge = ({ status }: { status: CardResponseDto["status"] }) => {
  const statusStyles: Record<
    CardResponseDto["status"],
    { text: string; bg: string }
  > = {
    IN_COLLECTION: { text: "text-gray-800", bg: "bg-gray-200" },
    FOR_SALE: { text: "text-green-800", bg: "bg-green-200" },
    SOLD: { text: "text-red-800", bg: "bg-red-200" },
  };

  const { text, bg } = statusStyles[status];
  const formattedStatus = status.replace("_", " ").toLowerCase();

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold capitalize rounded-full ${text} ${bg}`}
    >
      {formattedStatus}
    </span>
  );
};

export default function CollectionCard({ card }: { card: CardResponseDto }) {
  const [price, setPrice] = useState("");
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Generic mutation handler to invalidate the collection query on success
  const onMutationSuccess = () => {
    // This tells React Query to refetch the user's collection data
    queryClient.invalidateQueries({ queryKey: ["userCards", user?.id] });
  };

  const listMutation = useMutation({
    mutationFn: listCardForSale,
    onSuccess: onMutationSuccess,
  });

  const unlistMutation = useMutation({
    mutationFn: unlistCard,
    onSuccess: onMutationSuccess,
  });

  const soldMutation = useMutation({
    mutationFn: markCardAsSold,
    onSuccess: onMutationSuccess,
  });

  const handleAction = async (
    mutation: typeof listMutation,
    args: Omit<Parameters<typeof mutation.mutateAsync>[0], "clerkToken">
  ) => {
    const clerkToken = await getToken();
    if (!clerkToken) return;

    mutation.mutate({ ...args, clerkToken });
  };

  const isMutating =
    listMutation.isPending || unlistMutation.isPending || soldMutation.isPending;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{card.name}</h3>
          <StatusBadge status={card.status} />
        </div>
        {card.status === "FOR_SALE" && card.price && (
          <p className="text-xl font-bold text-green-600 mb-2">${card.price.toFixed(2)}</p>
        )}
        <p className="text-sm text-gray-500">Card ID: {card.cardId}</p>
      </div>

      {/* --- Action Buttons --- */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {card.status === "IN_COLLECTION" && (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Set Price (e.g., 19.99)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isMutating}
            />
            <button
              onClick={() => handleAction(listMutation, { cardDbId: card.id, userId: user!.id, price })}
              disabled={!price || isMutating}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              {isMutating ? "Listing..." : "List for Sale"}
            </button>
          </div>
        )}

        {card.status === "FOR_SALE" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(soldMutation, { cardDbId: card.id, userId: user!.id })}
              disabled={isMutating}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
            >
              {isMutating ? "..." : "Mark as Sold"}
            </button>
            <button
              onClick={() => handleAction(unlistMutation, { cardDbId: card.id, userId: user!.id })}
              disabled={isMutating}
              className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-300 transition-colors"
            >
              {isMutating ? "..." : "Unlist"}
            </button>
          </div>
        )}

        {card.status === "SOLD" && (
          <p className="text-center font-medium text-red-600">This card has been sold.</p>
        )}
      </div>
    </div>
  );
}