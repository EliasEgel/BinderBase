import type { CardResponseDto } from "../utils/cardApi";

/**
 * Displays a single card on the public marketplace.
 * Shows seller, name, and price.
 */
export default function MarketplaceCard({ card }: { card: CardResponseDto }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow hover:shadow-lg">
      {/* Card Details */}
      <div>
        <h3
          className="font-semibold text-lg text-gray-800 truncate"
          title={card.name}
        >
          {card.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">Card ID: {card.cardId}</p>
      </div>

      {/* Pricing and Seller Info */}
      <div>
        <p className="text-2xl font-bold text-green-600 mb-2">
          {/* Ensure price exists and format it */}
          {card.price ? `${card.price.toFixed(2)}` : "Price not set"}
        </p>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Seller: <span className="font-medium">{card.username}</span>
          </p>
        </div>
      </div>
    </div>
  );
}