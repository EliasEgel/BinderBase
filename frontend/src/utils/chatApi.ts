import type { ChatMessage } from "../pages/ChatPage";

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

// Standard API response shape
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Fetches the persistent chat history for a conversation.
 * @param recipientClerkId The unique ID of the person being chatted with.
 * @param clerkToken The current user's authentication token.
 */
export async function fetchChatHistory(
  recipientClerkId: string,
  clerkToken: string
): Promise<ApiResponse<ChatMessage[]>> {
  const endpoint = `${BACKEND_API}/api/v1/chat/history/${recipientClerkId}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat history");
  }

  return response.json();
}