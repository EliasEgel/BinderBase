import type { Card } from "../utils/cardApi";

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
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{card.name}</h2>
          <button
            onClick={onClose}
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
                    <div className="text-6xl mb-4">🃏</div>
                    <div>No Image Available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
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

              {card.power !== undefined && card.toughness !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Power / Toughness
                  </label>
                  <div className="text-gray-900">
                    {card.power} / {card.toughness}
                  </div>
                </div>
              )}

              {card.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="text-gray-900 text-sm leading-relaxed">
                    {card.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
