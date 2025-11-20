import { type UserDto } from "../utils/UserApi";

interface ChatSidebarProps {
  activeRecipient: UserDto | null;
  onSelectRecipient: (user: UserDto) => void;
  users: UserDto[]; // Now accepts the list of users as a prop
}

export default function ChatSidebar({
  activeRecipient,
  onSelectRecipient,
  users,
}: ChatSidebarProps) {
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversations</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No recent chats.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.clerkId}
              onClick={() => onSelectRecipient(user)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                activeRecipient?.clerkId === user.clerkId ? "bg-gray-200" : ""
              }`}
            >
              <p className="font-semibold">{user.username}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}