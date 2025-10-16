import type { Card } from "../utils/cardApi";

interface CardGridProps {
  cards: Card[];
  isLoading?: boolean;
  onCardClick?: (card: Card) => void;
}

export default function CardGrid({
  cards,
  isLoading = false,
  onCardClick,
}: CardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 aspect-[3/4] rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No cards found</div>
        <div className="text-gray-400">Try adjusting your search criteria</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.(card)}
        >
          {/* Card Image */}
          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center p-4">
                <div className="text-4xl mb-2">🃏</div>
                <div>No Image</div>
              </div>
            )}
          </div>

          {/* Card Info */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {card.name}
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{card.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Rarity:</span>
                <span className="font-medium">{card.rarity}</span>
              </div>
              <div className="flex justify-between">
                <span>Set:</span>
                <span className="font-medium">{card.set}</span>
              </div>
              {card.manaCost && (
                <div className="flex justify-between">
                  <span>Mana:</span>
                  <span className="font-medium">{card.manaCost}</span>
                </div>
              )}
              {card.power && card.toughness && (
                <div className="flex justify-between">
                  <span>P/T:</span>
                  <span className="font-medium">
                    {card.power}/{card.toughness}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
