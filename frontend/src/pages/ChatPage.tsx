import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "../contexts/WebsocketContexts";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessageView from "../components/ChatMessageView";
import { fetchChatPartners, type UserDto } from "../utils/UserApi"; // Updated import
import { fetchChatHistory } from "../utils/chatApi";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "@tanstack/react-router";

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
    setActiveChatPartner,
    registerOnMessageCallback,
  } = useWebSocket();

  const { getToken } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversations>({});
  const [activeRecipient, setActiveRecipient] = useState<UserDto | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sidebarUsers, setSidebarUsers] = useState<UserDto[]>([]); 
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const hasInitializedFromUrl = useRef(false);

  useEffect(() => {
    async function loadPartners() {
      try {
        const token = await getToken();
        if (token) {
          const res = await fetchChatPartners(token);
          setSidebarUsers(res.data);
        }
      } catch (e) {
        console.error("Failed to load chat partners", e);
      }
    }
    loadPartners();
  }, [getToken]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const partnerId = searchParams.get("partnerId");
    const partnerName = searchParams.get("partnerName");

    if (partnerId && partnerName && !hasInitializedFromUrl.current && clerkId) {
      hasInitializedFromUrl.current = true;

      const sellerDto: UserDto = {
        clerkId: partnerId,
        username: partnerName,
      };

      handleSelectRecipient(sellerDto);

      setSidebarUsers((prev) => {
        const exists = prev.some((u) => u.clerkId === partnerId);
        if (!exists) {
          return [sellerDto, ...prev];
        }
        return prev;
      });

      window.history.replaceState({}, "", "/chat");
    }
  }, [location.search, clerkId]);

  const onMessageReceived = useCallback(
    (message: ChatMessage) => {
      if (!clerkId) return;

      const chatPartnerId =
        message.senderClerkId === clerkId
          ? message.recipientClerkId
          : message.senderClerkId;

      setConversations((prev) => {
        const existingMessages = prev[chatPartnerId] || [];
        const isDuplicate = existingMessages.some(
          (m) => m.timestamp === message.timestamp && m.content === message.content
        );
        if (isDuplicate) return prev;
        return { ...prev, [chatPartnerId]: [...existingMessages, message] };
      });

      setSidebarUsers((prev) => {
        const exists = prev.some((u) => u.clerkId === chatPartnerId);
        if (!exists) {

          const newUser: UserDto = {
            clerkId: chatPartnerId,
            username: message.senderClerkId === clerkId ? message.recipientUsername : message.senderUsername
          };
          return [newUser, ...prev];
        }
        return prev;
      });
    },
    [clerkId]
  );

  useEffect(() => {
    registerOnMessageCallback(onMessageReceived);
    return () => {
      registerOnMessageCallback(null);
    };
  }, [registerOnMessageCallback, onMessageReceived]);

  useEffect(() => {
    if (activeRecipient) setActiveChatPartner(activeRecipient.clerkId);
    return () => setActiveChatPartner(null);
  }, [activeRecipient, setActiveChatPartner]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeRecipient]);

  const handleSelectRecipient = async (user: UserDto) => {
    setActiveRecipient(user);
    clearNotificationsFor(user.clerkId);

    if (conversations[user.clerkId]) return;

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
    if (!currentMessage.trim() || !stompClient || !clerkId || !activeRecipient) return;

    const senderName = currentUsername || "Me";
    const chatMessage: ChatMessage = {
      senderUsername: senderName,
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

    setConversations((prev) => {
      const previousMessages = prev[activeRecipient.clerkId] || [];
      return { ...prev, [activeRecipient.clerkId]: [...previousMessages, chatMessage] };
    });

    setCurrentMessage("");
  };

  const activeMessages = activeRecipient ? conversations[activeRecipient.clerkId] || [] : [];

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
        <p className="text-gray-600">Connect with other collectors and sellers.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[75vh]">
          {/* Pass the sidebarUsers state to the sidebar */}
          <ChatSidebar
            activeRecipient={activeRecipient}
            onSelectRecipient={handleSelectRecipient}
            users={sidebarUsers} 
          />
          <div className="flex-grow flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeRecipient ? `Chat with ${activeRecipient.username}` : "Select a Chat"}
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
                <p className="text-center text-gray-500">Select a user to start chatting.</p>
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
                    disabled={!currentMessage.trim()}
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