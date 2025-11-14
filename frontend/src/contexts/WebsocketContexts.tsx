import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "../pages/ChatPage";

// --- Context Shape Update ---
interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  clerkId: string | null;
  currentUsername: string | null;
  unreadSenders: Set<string>; // Unread messages
  clearNotificationsFor: (senderId: string) => void;
  setActiveChatPartner: (partnerId: string | null) => void; // Tell context who we're chatting with
  registerOnMessageCallback: (
    callback: ((message: ChatMessage) => void) | null
  ) => void; // Allow ChatPage to listen
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const BACKEND_HTTP_API = import.meta.env.VITE_BACKEND_API;

const getClerkUsername = (
  user: ReturnType<typeof useUser>["user"]
): string | null => {
  if (!user) return null;
  return user.username || user.firstName || user.lastName || user.fullName;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const clerkId = user?.id ?? null;
  const currentUsername = getClerkUsername(user);

  // --- NEW STATE MANAGED BY CONTEXT ---
  const [unreadSenders, setUnreadSenders] = useState(new Set<string>());
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  // This holds the callback function from ChatPage.tsx
  const [onMessageCallback, setOnMessageCallback] =
    useState<((message: ChatMessage) => void) | null>(null);

  useEffect(() => {
    if (isSignedIn && clerkId && !clientRef.current) {
      // ... (connection logic is unchanged) ...
      const connect = async () => {
        const token = await getToken();
        if (!token) return;
        const client = new Client({
          webSocketFactory: () => new SockJS(`${BACKEND_HTTP_API}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          debug: (str) => console.log("STOMP: " + str),
          onConnect: () => {
            setIsConnected(true);
            setStompClient(client);
            clientRef.current = client;
            console.log("WebSocket connected!");
          },
          onDisconnect: () => {
            setIsConnected(false);
            setStompClient(null);
            clientRef.current = null;
            console.log("WebSocket disconnected.");
          },
          onStompError: (frame) => console.error("Broker error", frame),
        });
        client.activate();
      };
      connect();
    } else if (!isSignedIn && clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, [isSignedIn, getToken, clerkId]);

  // --- NEW: Global subscription logic ---
  useEffect(() => {
    if (isConnected && stompClient && clerkId) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      const destination = `/user/${clerkId}/private`;
      subscriptionRef.current = stompClient.subscribe(
        destination,
        (message: IMessage) => {
          const incomingMessage: ChatMessage = JSON.parse(message.body);

          // 1. If ChatPage is listening, send the message to it
          if (onMessageCallback) {
            onMessageCallback(incomingMessage);
          }

          // 2. Handle notification logic
          // If the message is NOT from the person we are actively chatting with
          if (incomingMessage.senderClerkId !== activePartnerId) {
            setUnreadSenders((prev) =>
              new Set(prev.add(incomingMessage.senderClerkId))
            );
          }
        }
      );

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
    }
  }, [isConnected, stompClient, clerkId, onMessageCallback, activePartnerId]);

  // Function for ChatPage to set the active partner
  const setActiveChatPartner = (partnerId: string | null) => {
    setActivePartnerId(partnerId);
  };

  // Function for ChatPage to register its listener
  const registerOnMessageCallback = (
    callback: ((message: ChatMessage) => void) | null
  ) => {
    setOnMessageCallback(() => callback);
  };

  const clearNotificationsFor = (senderId: string) => {
    setUnreadSenders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(senderId);
      return newSet;
    });
  };

  return (
    <WebSocketContext.Provider
      value={{
        stompClient,
        isConnected,
        clerkId,
        currentUsername,
        unreadSenders,
        clearNotificationsFor,
        setActiveChatPartner, // Expose new function
        registerOnMessageCallback, // Expose new function
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};