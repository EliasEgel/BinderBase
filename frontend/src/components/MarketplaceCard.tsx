import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate
import type { CardResponseDto } from "../utils/cardApi";

/**
 * Displays a single card on the public marketplace.
 * Shows seller, name, and price.
 */
export default function MarketplaceCard({ card }: { card: CardResponseDto }) {
  const { user } = useUser();
  const navigate = useNavigate();

  const isOwnCard = user?.id === card.userId;

  const handleContactSeller = () => {
    // Navigate to chat with query parameters
    navigate({
      to: "/chat",
      search: {
        partnerId: card.userId,
        partnerName: card.username,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow hover:shadow-lg h-full">
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

      {/* Pricing, Seller Info, and Action Button */}
      <div className="mt-auto">
        <p className="text-2xl font-bold text-green-600 mb-2">
          {card.price ? `${card.price.toFixed(2)}` : "Price not set"}
        </p>
        
        <div className="pt-2 border-t border-gray-200 space-y-3">
          <p className="text-sm text-gray-600">
            Seller: <span className="font-medium">{card.username}</span>
          </p>

          {/* Only show Contact button if it's not your own card */}
          {!isOwnCard && (
            <button
              onClick={handleContactSeller}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              Contact Seller
            </button>
          )}
          
          {isOwnCard && (
            <div className="text-center text-sm text-gray-400 italic py-2">
              This is your listing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}