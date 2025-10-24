import type { CardResponseDto } from "../utils/cardApi";
import CollectionCard from "./CollectionCard";

/**
 * A reusable component that displays a titled section with a grid of cards.
 * It renders nothing if the provided card list is empty.
 */
const CardSection = ({
  title,
  cards,
}: {
  title: string;
  cards: CardResponseDto[];
}) => {
  // Don't render the section at all if there are no cards
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-2 mb-6">
        {title}{" "}
        <span className="text-lg font-normal text-gray-500">
          ({cards.length})
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <CollectionCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
};

export default CardSection;