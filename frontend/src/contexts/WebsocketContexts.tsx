import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "../pages/ChatPage";

// --- CHANGE 1: Update the context's shape ---
interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  clerkId: string | null; // Use clerkId as the primary unique identifier
  currentUsername: string | null; // Keep username for display
  subscribeToPrivateMessages: (
    onMessageReceived: (message: ChatMessage) => void
  ) => () => void; // Returns an unsubscribe function
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const BACKEND_HTTP_API = import.meta.env.VITE_BACKEND_API;

// Helper to get the best available username from Clerk (this function is unchanged)
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

  // --- CHANGE 2: Get both clerkId and username from the Clerk user object ---
  const clerkId = user?.id ?? null;
  const currentUsername = getClerkUsername(user);

  useEffect(() => {
    // --- CHANGE 3: Use the unique clerkId to decide when to connect ---
    if (isSignedIn && clerkId && !clientRef.current) {
      const connect = async () => {
        const token = await getToken();
        if (!token) {
          console.error("No auth token for WebSocket, aborting.");
          return;
        }

        const client = new Client({
          webSocketFactory: () => new SockJS(`${BACKEND_HTTP_API}/ws`),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          debug: (str) => {
            console.log("STOMP: " + str);
          },
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
          onStompError: (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
          },
        });

        client.activate();
      };

      connect();
    } else if (!isSignedIn && clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, [isSignedIn, getToken, clerkId]); // useEffect now depends on clerkId

  const subscribeToPrivateMessages = (
    onMessageReceived: (message: ChatMessage) => void
  ) => {
    // --- CHANGE 4: Subscribe to the private queue using the unique clerkId ---
    if (stompClient && clerkId && isConnected) {
      // This destination MUST match the user identifier on the backend (Principal.getName())
      const destination = `/user/${clerkId}/private`;
      const subscription = stompClient.subscribe(
        destination,
        (message: IMessage) => {
          const incomingMessage: ChatMessage = JSON.parse(message.body);
          onMessageReceived(incomingMessage);
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    }
    return () => {};
  };

  return (
    <WebSocketContext.Provider
      value={{
        stompClient,
        isConnected,
        clerkId, // Provide clerkId to consumers
        currentUsername, // Provide username to consumers
        subscribeToPrivateMessages,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// This hook remains unchanged but now provides the updated context value
// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};