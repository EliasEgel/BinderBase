import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../contexts/WebsocketContexts";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessageView from "../components/ChatMessageView";
import { type UserDto } from "../utils/UserApi";
import { fetchChatHistory } from "../utils/chatApi";
import { useAuth } from "@clerk/clerk-react";

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
    clearNotificationsFor,
    // --- CHANGE 1: Use the new context functions ---
    setActiveChatPartner,
    registerOnMessageCallback,
  } = useWebSocket();

  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversations>({});
  const [activeRecipient, setActiveRecipient] = useState<UserDto | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // --- CHANGE 2: Register/unregister the message handler ---
  useEffect(() => {
    // This is the function the context will call with a new message
    const onMessage = (message: ChatMessage) => {
      const chatPartnerId =
        message.senderClerkId === clerkId
          ? message.recipientClerkId
          : message.senderClerkId;

      setConversations((prev) => ({
        ...prev,
        [chatPartnerId]: [...(prev[chatPartnerId] || []), message],
      }));
    };

    // Tell the context to send us messages
    registerOnMessageCallback(onMessage);

    // On unmount, tell the context to stop sending us messages
    return () => {
      registerOnMessageCallback(null);
    };
  }, [clerkId, registerOnMessageCallback]); // Only depends on these

  // --- CHANGE 3: Tell the context who we are chatting with ---
  useEffect(() => {
    if (activeRecipient) {
      setActiveChatPartner(activeRecipient.clerkId);
    }
    // On cleanup, tell context we aren't chatting with anyone
    return () => {
      setActiveChatPartner(null);
    };
  }, [activeRecipient, setActiveChatPartner]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeRecipient]);

  // --- CHANGE 4: Update the select handler ---
  const handleSelectRecipient = async (user: UserDto) => {
    setActiveRecipient(user); // This will trigger the useEffect above
    clearNotificationsFor(user.clerkId); // Clear notifications

    if (conversations[user.clerkId]) {
      return; // History already loaded
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

  // --- (sendMessage and layout are unchanged) ---
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Chat</h1>
        <p className="text-gray-600">
          Connect with other collectors and sellers.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[75vh]">
          <ChatSidebar
            activeRecipient={activeRecipient}
            onSelectRecipient={handleSelectRecipient}
          />
          <div className="flex-grow flex flex-col">
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
      </div>
    </div>
  );
}