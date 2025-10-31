import type { ChatMessage } from "../pages/ChatPage";

export default function ChatMessageView({
  message,
  currentUserClerkId, // Pass down the current user's ID
}: {
  message: ChatMessage;
  currentUserClerkId: string | null;
}) {
  const { content, senderUsername, timestamp, senderClerkId } = message;

  // Determine if the sender is the current logged-in user
  const isSender = senderClerkId === currentUserClerkId;

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSender) {
    // Your message (align right)
    return (
      <div className="flex justify-end mb-3">
        <div className="mr-2 py-3 px-4 bg-indigo-600 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white max-w-xs md:max-w-md">
          <p className="text-sm">{content}</p>
          <p className="text-xs text-indigo-200 text-right mt-1">{formattedTime}</p>
        </div>
      </div>
    );
  }

  // Their message (align left)
  return (
    <div className="flex justify-start mb-3">
      <div className="ml-2 py-3 px-4 bg-gray-200 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-gray-800 max-w-xs md:max-w-md">
        <p className="font-semibold text-sm">{senderUsername}</p>
        <p className="text-sm">{content}</p>
        <p className="text-xs text-gray-500 text-right mt-1">{formattedTime}</p>
      </div>
    </div>
  );
}

