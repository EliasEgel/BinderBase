const BACKEND_API = import.meta.env.VITE_BACKEND_API;

export interface UserDto {
  username: string;
  clerkId: string;
}

/**
 * Fetches the list of all users available for chat.
 * Requires the user's auth token.
 */
export async function fetchChatUsers(clerkToken: string): Promise<ApiResponse<UserDto[]>> {
  const endpoint = `${BACKEND_API}/api/v1/users`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}