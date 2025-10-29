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

interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  clerkUsername: string | null;
  subscribeToPrivateMessages: (
    onMessageReceived: (message: ChatMessage) => void
  ) => () => void; // Returns an unsubscribe function
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const BACKEND_HTTP_API = import.meta.env.VITE_BACKEND_API;

// Helper to get the best available username from Clerk
const getClerkUsername = (
  user: ReturnType<typeof useUser>["user"]
): string | null => {
  if (!user) return null;
  // Use the first available truthy value
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
  const clerkUsername = getClerkUsername(user);

  useEffect(() => {
    if (isSignedIn && clerkUsername && !clientRef.current) {
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
  }, [isSignedIn, getToken, clerkUsername]);

  const subscribeToPrivateMessages = (
    onMessageReceived: (message: ChatMessage) => void
  ) => {
    if (stompClient && clerkUsername && isConnected) {
      const destination = `/user/${clerkUsername}/private`;
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
        clerkUsername,
        subscribeToPrivateMessages,
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
