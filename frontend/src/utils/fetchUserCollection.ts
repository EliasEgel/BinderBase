const BACKEND_API = import.meta.env.VITE_BACKEND_API;

// Fetch user's collection with Clerk token
export async function fetchUserCollection(userId: string, clerkToken: string) {
  const endpoint = `${BACKEND_API}/api/v1/collection?userId=${userId}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  });
  const result = await response.json();
  return result;
}
