import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string | number;
  uuid: string;
  content: string;
  senderId: number;
  conversationId: number;
  messageType: string;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: number;
    uuid: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

interface BroadcastMessage {
  type: "NEW_MESSAGE" | "TEST_MESSAGE";
  message: Message;
  conversationId: number;
  timestamp: string;
}

interface UseRealtimeMessagingProps {
  conversationId: number | null;
  currentUserId: number | null;
  onNewMessage?: (message: Message) => void;
}

export function useRealtimeMessaging({
  conversationId,
  currentUserId,
  onNewMessage,
}: UseRealtimeMessagingProps) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    console.log(
      `🔄 Setting up broadcast channel for conversation: ${conversationId}`
    );

    // Create a unique channel name for this conversation
    const channelName = `conversation-${conversationId}`;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel optimized for broadcast
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: false, // Don't receive our own broadcasts
          ack: true, // Request acknowledgment for better reliability
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to broadcast messages only
    channel
      .on("broadcast", { event: "message" }, (payload) => {
        console.log("🔔 Received broadcast message:", payload);

        const broadcastData = payload.payload as BroadcastMessage;

        if (
          broadcastData.type === "NEW_MESSAGE" ||
          broadcastData.type === "TEST_MESSAGE"
        ) {
          const message = broadcastData.message;

          // Only process messages that aren't from the current user (except test messages)
          if (
            message.senderId !== currentUserId ||
            broadcastData.type === "TEST_MESSAGE"
          ) {
            console.log("✨ Adding new message from broadcast");
            onNewMessage?.(message);
          } else {
            console.log("📤 Ignoring own message from broadcast");
          }
        }
      })
      .subscribe((status, error) => {
        console.log(
          `📡 Channel subscription status for ${channelName}:`,
          status
        );
        console.log(`🕐 Timestamp: ${new Date().toISOString()}`);

        if (error) {
          console.error("❌ Channel subscription error:", error);
          setIsConnected(false);
        }

        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to broadcast channel");
          console.log(`🔗 Channel details:`, {
            channelName,
            conversationId,
            currentUserId,
            timestamp: new Date().toISOString(),
          });
          setIsConnected(true);
        } else if (status === "CHANNEL_ERROR" || status === "CLOSED") {
          //   console.error("❌ Channel connection failed");
          setIsConnected(false);
        }
      });

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up broadcast channel subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [conversationId, currentUserId, onNewMessage, supabase]);

  return {
    isConnected,
    channel: channelRef.current,
  };
}
