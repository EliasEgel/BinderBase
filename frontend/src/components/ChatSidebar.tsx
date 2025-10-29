import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
// Note: Your file path was "UserApi", so I'm matching that casing.
import { fetchChatUsers } from "../utils/UserApi";

interface ChatSidebarProps {
  activeRecipient: string | null;
  onSelectRecipient: (username: string) => void;
  clerkUsername: string | null;
}

export default function ChatSidebar({
  activeRecipient,
  onSelectRecipient,
}: ChatSidebarProps) {
  const { getToken } = useAuth();
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chatUsers"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const apiResponse = await fetchChatUsers(token);
      return apiResponse.data; 
    },
    
    enabled: !!getToken,
  });

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversations</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        )}
        {error && (
          <div className="p-4 text-center text-red-500">
            Error loading users.
          </div>
        )}
        {usersData &&
          usersData.map((user) => (
            <div
              key={user.clerkId}
              onClick={() => onSelectRecipient(user.username)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                activeRecipient === user.username ? "bg-gray-200" : ""
              }`}
            >
              <p className="font-semibold">{user.username}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
