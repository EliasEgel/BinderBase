// In a real app, you'd fetch this user list from your backend
const mockUsers = ["Dave", "Admin", "JaneDoe"];

interface ChatSidebarProps {
  activeRecipient: string | null;
  onSelectRecipient: (username: string) => void;
  clerkUsername: string | null;
}

export default function ChatSidebar({
  activeRecipient,
  onSelectRecipient,
  clerkUsername,
}: ChatSidebarProps) {
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversations</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {mockUsers
          .filter((user) => user !== clerkUsername) 
          .map((user) => (
            <div
              key={user}
              onClick={() => onSelectRecipient(user)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                activeRecipient === user ? "bg-gray-200" : ""
              }`}
            >
              <p className="font-semibold">{user}</p>
            </div>
          ))}
      </div>
    </div>
  );
}