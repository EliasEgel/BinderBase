import type { Card } from "./cardApi";

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

// Clerk token must be passed in to authenticate the request
export async function addCardToCollection(
  card: Card,
  userId: string,
  username: string,
  clerkToken: string
) {
  const endpoint = `${BACKEND_API}/api/v1/collection`;
  // Format according to saveCardDto
  const payload = {
    cardName: card.name,
    cardId: card.id,
    userId,
    username,
  };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return result;
}
