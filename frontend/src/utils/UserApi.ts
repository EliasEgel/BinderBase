const BACKEND_API = import.meta.env.VITE_BACKEND_API;

export interface UserDto {
  username: string;
  clerkId: string;
}

export async function fetchChatPartners(clerkToken: string): Promise<ApiResponse<UserDto[]>> {
  const endpoint = `${BACKEND_API}/api/v1/users/chat-partners`; // Updated Endpoint

  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Authorization: `Bearer ${clerkToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch chat partners");
  return response.json();
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}