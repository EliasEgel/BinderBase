
import ChatSidebar from "../components/ChatSidebar";
import ChatMessageView from "../components/ChatMessageView";
import { useWebSocket } from "../contexts/WebsocketContexts";
import { useEffect, useRef, useState } from "react";

// This type MUST match your backend ChatMessage DTO
export interface ChatMessage {
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: string;
}

// State shape to hold all conversations, mapped by recipient username
type Conversations = Record<string, ChatMessage[]>;

export default function ChatPage() {
  const {
    isConnected,
    stompClient,
    clerkUsername,
    subscribeToPrivateMessages,
  } = useWebSocket();
  
  // This state holds all messages, for all chats
  const [conversations, setConversations] = useState<Conversations>({});
  
  // This tracks which chat is currently being viewed
  const [activeRecipient, setActiveRecipient] = useState<string | null>(null);
  
  // The content of the input box
  const [currentMessage, setCurrentMessage] = useState("");
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Subscribe to your private message queue when the component mounts
  useEffect(() => {
    if (isConnected && clerkUsername) {
      // Start listening for messages
      const unsubscribe = subscribeToPrivateMessages((message) => {
        // When a message arrives, find out who it's from
        const chatPartner = message.senderUsername;
        
        // Add the new message to the correct conversation in state
        setConversations((prev) => ({
          ...prev,
          [chatPartner]: [...(prev[chatPartner] || []), message],
        }));
      });
      
      // Unsubscribe when the component unmounts
      return unsubscribe;
    }
  }, [isConnected, clerkUsername, subscribeToPrivateMessages]);

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeRecipient]); // Re-run if the active chat or messages change

  const sendMessage = () => {
    if (currentMessage && stompClient && clerkUsername && activeRecipient) {
      const chatMessage: ChatMessage = {
        senderUsername: clerkUsername,
        recipientUsername: activeRecipient,
        content: currentMessage,
        timestamp: new Date().toISOString(),
      };

      // 1. Send the message to the backend via WebSocket
      stompClient.publish({
        destination: "/app/private-message", // The @MessageMapping in Spring
        body: JSON.stringify(chatMessage),
      });

      // 2. Add message to local state immediately (optimistic update)
      setConversations((prev) => ({
        ...prev,
        [activeRecipient]: [...(prev[activeRecipient] || []), chatMessage],
      }));
      setCurrentMessage("");
    }
  };

  // Get the messages for the currently active chat
  const activeMessages = activeRecipient ? conversations[activeRecipient] || [] : [];

  if (!isConnected) {
    return (
      <div className="p-8 text-center h-screen flex items-center justify-center">
        Connecting to chat server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex h-screen">
      {/* Sidebar for selecting users */}
      <ChatSidebar
        activeRecipient={activeRecipient}
        onSelectRecipient={setActiveRecipient}
        clerkUsername={clerkUsername}
      />

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeRecipient ? `Chat with ${activeRecipient}` : "Select a Chat"}
          </h2>
        </div>

        {/* Chat Window */}
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          {activeRecipient ? (
            activeMessages.length > 0 ? (
              activeMessages.map((msg, index) => (
                <ChatMessageView
                  key={index}
                  message={msg}
                  isSender={msg.senderUsername === clerkUsername}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                Say hello to {activeRecipient}!
              </p>
            )
          ) : (
            <p className="text-center text-gray-500">
              Select a user from the left to start chatting.
            </p>
          )}
          {/* Empty div to scroll to */}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Form */}
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