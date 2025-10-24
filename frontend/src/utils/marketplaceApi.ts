const BACKEND_API = import.meta.env.VITE_BACKEND_API;

interface ApiArgs {
  cardDbId: number;
  clerkToken: string;
  userId: string;
}

interface ListCardArgs extends ApiArgs {
  price: string;
}

// Helper function for making authenticated PUT requests
async function makePutRequest(endpoint: string, clerkToken: string, body: object) {
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update card status");
  }

  return response.json();
}

/**
 * Lists a card for sale on the marketplace.
 */
export async function listCardForSale({ cardDbId, price, userId, clerkToken }: ListCardArgs) {
  const endpoint = `${BACKEND_API}/api/v1/marketplace/list/${cardDbId}`;
  // The backend expects a numeric price, so we parse it here
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    throw new Error("Invalid price format. Please enter a positive number.");
  }
  return makePutRequest(endpoint, clerkToken, { price: numericPrice, userId });
}

/**
 * Removes a card from the marketplace listing.
 */
export async function unlistCard({ cardDbId, userId, clerkToken }: ApiArgs) {
  const endpoint = `${BACKEND_API}/api/v1/marketplace/unlist/${cardDbId}`;
  return makePutRequest(endpoint, clerkToken, { userId });
}

/**
 * Marks a card as sold.
 */
export async function markCardAsSold({ cardDbId, userId, clerkToken }: ApiArgs) {
  const endpoint = `${BACKEND_API}/api/v1/marketplace/sold/${cardDbId}`;
  return makePutRequest(endpoint, clerkToken, { userId });
}