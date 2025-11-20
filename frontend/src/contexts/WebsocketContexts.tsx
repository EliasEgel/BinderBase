import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "../pages/ChatPage";

interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  clerkId: string | null;
  currentUsername: string | null;
  unreadSenders: Set<string>;
  clearNotificationsFor: (senderId: string) => void;
  setActiveChatPartner: (partnerId: string | null) => void;
  registerOnMessageCallback: (
    callback: ((message: ChatMessage) => void) | null
  ) => void;
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

  const [unreadSenders, setUnreadSenders] = useState(new Set<string>());


  const activePartnerIdRef = useRef<string | null>(null);
  const onMessageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );

  useEffect(() => {
    if (isSignedIn && clerkId && !clientRef.current) {
      const connect = async () => {
        const token = await getToken();
        if (!token) return;
        const client = new Client({
          webSocketFactory: () => new SockJS(`${BACKEND_HTTP_API}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
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


  useEffect(() => {
    if (isConnected && stompClient && clerkId) {
      // Subscribe ONLY if we haven't already
      if (!subscriptionRef.current) {
        const destination = `/user/${clerkId}/private`;
        
        console.log("Subscribing to:", destination);
        
        subscriptionRef.current = stompClient.subscribe(
          destination,
          (message: IMessage) => {
            const incomingMessage: ChatMessage = JSON.parse(message.body);
            
            // 1. Access the current callback via Ref
            if (onMessageCallbackRef.current) {
              onMessageCallbackRef.current(incomingMessage);
            }

            // 2. Access the current active partner via Ref
            const currentPartner = activePartnerIdRef.current;

            // Notification Logic
            if (incomingMessage.senderClerkId !== currentPartner) {
              setUnreadSenders((prev) =>
                new Set(prev.add(incomingMessage.senderClerkId))
              );
            }
          }
        );
      }
    }

    return () => {
      if (!isConnected && subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [isConnected, stompClient, clerkId]);

  const setActiveChatPartner = useCallback((partnerId: string | null) => {
    activePartnerIdRef.current = partnerId;
  }, []);

  const registerOnMessageCallback = useCallback(
    (callback: ((message: ChatMessage) => void) | null) => {
      onMessageCallbackRef.current = callback;
    },
    []
  );

  const clearNotificationsFor = useCallback((senderId: string) => {
    setUnreadSenders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(senderId);
      return newSet;
    });
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        stompClient,
        isConnected,
        clerkId,
        currentUsername,
        unreadSenders,
        clearNotificationsFor,
        setActiveChatPartner,
        registerOnMessageCallback,
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