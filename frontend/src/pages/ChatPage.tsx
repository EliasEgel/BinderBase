import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../contexts/WebsocketContexts"; // Corrected path
import ChatSidebar from "../components/ChatSidebar";
import ChatMessageView from "../components/ChatMessageView";
import { type UserDto } from "../utils/UserApi";
import { fetchChatHistory } from "../utils/chatApi"; // 1. Import new API function
import { useAuth } from "@clerk/clerk-react"; // 2. Import useAuth to get token

export interface ChatMessage {
  senderClerkId: string;
  recipientClerkId: string;
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: string;
}

type Conversations = Record<string, ChatMessage[]>;

export default function ChatPage() {
  const {
    isConnected,
    stompClient,
    clerkId,
    currentUsername,
    subscribeToPrivateMessages,
  } = useWebSocket();

  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversations>({});
  const [activeRecipient, setActiveRecipient] = useState<UserDto | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected && clerkId) {
      const unsubscribe = subscribeToPrivateMessages((message) => {
        const chatPartnerId =
          message.senderClerkId === clerkId
            ? message.recipientClerkId
            : message.senderClerkId;

        setConversations((prev) => ({
          ...prev,
          [chatPartnerId]: [...(prev[chatPartnerId] || []), message],
        }));
      });
      return unsubscribe;
    }
  }, [isConnected, clerkId, subscribeToPrivateMessages]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeRecipient]);

  const handleSelectRecipient = async (user: UserDto) => {
    setActiveRecipient(user);

    if (conversations[user.clerkId]) {
      return;
    }

    setIsLoadingHistory(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetchChatHistory(user.clerkId, token);

      setConversations((prev) => ({
        ...prev,
        [user.clerkId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = () => {
    if (
      currentMessage &&
      stompClient &&
      clerkId &&
      currentUsername &&
      activeRecipient
    ) {
      const chatMessage: ChatMessage = {
        senderUsername: currentUsername,
        recipientUsername: activeRecipient.username,
        senderClerkId: clerkId,
        recipientClerkId: activeRecipient.clerkId,
        content: currentMessage,
        timestamp: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/private-message",
        body: JSON.stringify(chatMessage),
      });

      // Optimistic update
      setConversations((prev) => ({
        ...prev,
        [activeRecipient.clerkId]: [
          ...(prev[activeRecipient.clerkId] || []),
          chatMessage,
        ],
      }));
      setCurrentMessage("");
    }
  };

  const activeMessages = activeRecipient
    ? conversations[activeRecipient.clerkId] || []
    : [];

  if (!isConnected) {
    return (
      <div className="p-8 text-center h-screen flex items-center justify-center">
        Connecting to chat server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex h-screen">
      <div className="mb-6">
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
      <ChatSidebar
        activeRecipient={activeRecipient}
        onSelectRecipient={handleSelectRecipient}
      />
      <div className="flex-grow flex flex-col h-screen">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeRecipient
              ? `Chat with ${activeRecipient.username}`
              : "Select a Chat"}
          </h2>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          {activeRecipient ? (
            isLoadingHistory && activeMessages.length === 0 ? (
              <p className="text-center text-gray-500">Loading history...</p>
            ) : activeMessages.length > 0 ? (
              activeMessages.map((msg, index) => (
                <ChatMessageView
                  key={`${msg.senderClerkId}-${msg.timestamp}-${index}`}
                  message={msg}
                  currentUserClerkId={clerkId}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                {/* Display username from the object */}
                Say hello to {activeRecipient.username}!
              </p>
            )
          ) : (
            <p className="text-center text-gray-500">
              Select a user to start chatting.
            </p>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Form (no changes) */}
        {activeRecipient && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
