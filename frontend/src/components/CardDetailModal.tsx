import type { Card } from "../utils/cardApi";
import { addCardToCollection } from "../utils/addCardApi";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CardDetailModal({
  card,
  isOpen,
  onClose,
}: CardDetailModalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  if (!isOpen || !card) return null;

  // Get username fallback logic
  const username =
    user?.username ||
    user?.firstName ||
    user?.lastName ||
    user?.fullName ||
    "Unknown";
  const userId = user?.id || "";

  async function handleAddCard() {
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const clerkToken = await getToken();
      if (!clerkToken) throw new Error("No Clerk token available");
      if (!card) throw new Error("No card selected");
      const result = await addCardToCollection(
        card,
        userId,
        username,
        clerkToken
      );
      if (result.success) {
        setAddSuccess("Card added to your collection!");
      } else {
        setAddError(result.message || "Failed to add card.");
      }
    } catch (err: any) {
      setAddError(err.message || "Error adding card.");
    } finally {
      setAdding(false);
    }
  }

  function handleClose() {
    setAddSuccess(null);
    setAddError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{card.name}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Image */}
            <div>
              <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div>No Image Available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              {/* ...existing code... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {card.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="text-gray-900">{card.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rarity
                </label>
                <div className="text-gray-900">{card.rarity}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set
                </label>
                <div className="text-gray-900">{card.set}</div>
              </div>
              {card.manaCost && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mana Cost
                  </label>
                  <div className="text-gray-900">{card.manaCost}</div>
                </div>
              )}
              {card.power && card.toughness && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Power / Toughness
                  </label>
                  <div className="text-gray-900">
                    {card.power} / {card.toughness}
                  </div>
                </div>
              )}
              {card.text && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text
                  </label>
                  <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                    {card.text}
                  </div>
                </div>
              )}
              {/* Add to Collection Button */}
              <div>
                <button
                  onClick={handleAddCard}
                  disabled={adding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors w-full mt-2"
                >
                  {adding ? "Adding..." : "Add to Collection"}
                </button>
                {addSuccess && (
                  <div className="text-green-600 text-sm mt-2">
                    {addSuccess}
                  </div>
                )}
                {addError && (
                  <div className="text-red-600 text-sm mt-2">{addError}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
