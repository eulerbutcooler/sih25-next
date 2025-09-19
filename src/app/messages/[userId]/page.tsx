"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { useRealtimeMessaging } from "@/hooks/useRealtimeMessaging";
import type { User } from "@supabase/supabase-js";

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

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role?: string;
}

interface ChatPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRecord, setCurrentUserRecord] = useState<Profile | null>(
    null
  );
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Real-time messaging hook
  const { isConnected } = useRealtimeMessaging({
    conversationId: conversationId ? parseInt(conversationId) : null,
    currentUserId: currentUserRecord ? parseInt(currentUserRecord.id) : null,
    onNewMessage: useCallback((message: Message) => {
      console.log("🔔 Received new message via broadcast:", message);
      setMessages((prev) => {
        const exists = prev.some(
          (msg) => msg.id === message.id || msg.uuid === message.uuid
        );
        if (exists) {
          console.log("📋 Message already exists, preventing duplicate");
          return prev;
        }
        console.log("✨ Adding new message from broadcast");
        const newMessages = [...prev, message];

        // Scroll to bottom after adding new message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        return newMessages;
      });
    }, []),
  });

  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Auth user:", user);
      setUser(user);

      if (user) {
        console.log("Looking up user record with UUID:", user.id);
        console.log("User email from auth:", user.email);

        // Get user record from database using admin client
        const { data: userRecord, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("supabase_id", user.id)
          .single();

        if (userRecord) {
          console.log("✅ Current user record found:", userRecord);
          setCurrentUserRecord({
            id: userRecord.id.toString(),
            display_name:
              userRecord.full_name || userRecord.username || "Unknown User",
            avatar_url: userRecord.avatar_url,
            email: userRecord.email || "",
            role: userRecord.role,
          });
        } else {
          console.error("❌ Error getting user record by UUID:", error);
          console.log("🔄 Attempting fallback lookup by email:", user.email);

          // Fallback: try to find user by email
          if (user.email) {
            const { data: fallbackUserRecord, error: fallbackError } =
              await supabaseAdmin
                .from("users")
                .select("*")
                .eq("email", user.email)
                .single();

            if (fallbackUserRecord) {
              console.log("✅ Found user record by email:", fallbackUserRecord);
              setCurrentUserRecord({
                id: fallbackUserRecord.id.toString(),
                display_name:
                  fallbackUserRecord.full_name ||
                  fallbackUserRecord.username ||
                  "Unknown User",
                avatar_url: fallbackUserRecord.avatar_url,
                email: fallbackUserRecord.email || "",
                role: fallbackUserRecord.role,
              });

              // Update the UUID in the database to match auth
              const { error: updateError } = await supabaseAdmin
                .from("users")
                .update({ uuid: user.id })
                .eq("id", fallbackUserRecord.id);

              if (updateError) {
                console.error("❌ Error updating UUID:", updateError);
              } else {
                console.log("✅ Updated user UUID in database");
              }
            } else {
              console.error(
                "❌ Fallback email lookup also failed:",
                fallbackError
              );
              console.log("🚨 No user record found for authenticated user");
            }
          } else {
            console.error("🚨 No email available for fallback lookup");
          }
        }
      }
    };

    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!resolvedParams.userId) return;

      console.log("Fetching user with ID:", resolvedParams.userId);

      try {
        // Fetch real user from database
        let userRecord = null;
        let error = null;

        // First try UUID lookup (most common from conversations)
        console.log("Trying UUID search for:", resolvedParams.userId);
        const { data: uuidData } = await supabaseAdmin
          .from("users")
          .select("id, username, full_name, avatar_url, email, role, uuid")
          .eq("uuid", resolvedParams.userId)
          .single();

        if (uuidData) {
          userRecord = uuidData;
          console.log("✅ Found user by UUID:", userRecord);
        } else {
          console.log("UUID search failed, trying numeric ID");

          // Fallback to numeric ID lookup
          if (!isNaN(Number(resolvedParams.userId))) {
            console.log("Searching by numeric ID:", resolvedParams.userId);
            const { data, error: idError } = await supabaseAdmin
              .from("users")
              .select("id, username, full_name, avatar_url, email, role, uuid")
              .eq("id", parseInt(resolvedParams.userId))
              .single();

            userRecord = data;
            error = idError;
          }

          // Final fallback to username lookup
          if (!userRecord) {
            console.log("Trying username search for:", resolvedParams.userId);
            const { data, error: usernameError } = await supabaseAdmin
              .from("users")
              .select("id, username, full_name, avatar_url, email, role, uuid")
              .eq("username", resolvedParams.userId)
              .single();

            userRecord = data;
            error = usernameError;
          }
        }

        if (userRecord) {
          console.log("Found user in database:", userRecord);
          const profile: Profile = {
            id: userRecord.id.toString(),
            display_name:
              userRecord.full_name || userRecord.username || "Unknown User",
            avatar_url: userRecord.avatar_url,
            email: userRecord.email || "",
            role: userRecord.role,
          };
          setOtherUser(profile);
        } else {
          console.error("User not found:", error);
          router.push("/messages");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/messages");
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [resolvedParams.userId, router]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUserRecord || !otherUser) return;

      console.log("Loading existing messages for conversation...");

      try {
        // Find conversation between users using conversation_participants table
        const { data: conversations, error: convError } = await supabaseAdmin
          .from("conversation_participants")
          .select(
            `
            conversation_id,
            conversations!inner(id, created_at)
          `
          )
          .eq("user_id", parseInt(currentUserRecord.id));

        if (convError) {
          console.error("Error fetching conversations:", convError);
          return;
        }

        console.log("Found conversations for current user:", conversations);

        // Find conversation that includes the other user
        let foundConversationId = null;

        if (conversations && conversations.length > 0) {
          for (const conv of conversations) {
            const { data: otherParticipants, error: participantError } =
              await supabaseAdmin
                .from("conversation_participants")
                .select("user_id")
                .eq("conversation_id", conv.conversation_id)
                .eq("user_id", parseInt(otherUser.id));

            if (
              !participantError &&
              otherParticipants &&
              otherParticipants.length > 0
            ) {
              foundConversationId = conv.conversation_id;
              console.log("Found existing conversation:", foundConversationId);
              break;
            }
          }
        }

        if (foundConversationId) {
          setConversationId(foundConversationId.toString());

          // Use the new API to load messages
          const response = await fetch(
            `/api/messages?conversationId=${foundConversationId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Loaded messages from API:", data.messages);
            setMessages(data.messages || []);
          } else {
            console.error(
              "Error loading messages from API:",
              response.statusText
            );
          }
        } else {
          console.log("No existing conversation found");
          setMessages([]);
          setConversationId(null);
        }
      } catch (error) {
        console.error("Error in loadMessages:", error);
      }
    };

    loadMessages();
  }, [currentUserRecord, otherUser]);

  const sendMessage = async () => {
    if (!currentUserRecord || !newMessage.trim() || !otherUser || sending)
      return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      console.log("📤 Sending message to user:", otherUser.display_name);
      console.log("📤 Message content:", messageContent);
      console.log("📤 Conversation ID:", conversationId);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recipientId: otherUser.id,
          content: messageContent,
          messageType: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Message sent successfully:", data.message);
        console.log("✅ Server response:", data);

        // Update conversation ID if it's a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId.toString());
          console.log("🆕 Set new conversation ID:", data.conversationId);
        }

        // Add message to local state immediately for sender
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              msg.id === data.message.id || msg.uuid === data.message.uuid
          );
          if (!exists) {
            console.log("➕ Adding sent message to local state");
            return [...prev, data.message];
          }
          console.log("📋 Sent message already exists in local state");
          return prev;
        });

        // Scroll to bottom after sending
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("❌ Error sending message:", errorData.error);
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center max-w-md mx-auto">
        <div className="text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-2xl mb-4"></i>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center max-w-md mx-auto">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to chat</p>
          <Link href="/signin" className="text-amber-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center max-w-md mx-auto">
        <div className="text-center text-gray-400">
          <i className="fas fa-user-slash text-4xl mb-4"></i>
          <p className="text-lg mb-2">User not found</p>
          <Link href="/messages" className="text-amber-300 hover:underline">
            ← Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-[#27272a] p-4 flex-shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <Link
            href="/messages"
            className="p-2 hover:bg-[#27272a] rounded-full transition-colors"
          >
            <i className="fas fa-arrow-left text-white"></i>
          </Link>

          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-[#27272a] rounded-full mr-3 flex border-amber-300 border items-center justify-center text-white font-bold text-sm">
              {(otherUser.display_name || "UN").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-white truncate">
                {otherUser.display_name}
              </h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
                <p className="text-xs text-gray-400">
                  {isConnected ? "Online" : "Connecting..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <i className="fas fa-comments text-4xl mb-4"></i>
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">
                Send a message to {otherUser.display_name}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => {
              const isOwn =
                message.senderId === parseInt(currentUserRecord?.id || "0");
              const messageTime = new Date(
                message.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-amber-300 text-black"
                        : "bg-[#27272a] text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-black/70" : "text-gray-400"
                      }`}
                    >
                      {messageTime}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Message Input */}
      <footer className="sticky bottom-0 bg-black border-t border-[#27272a] flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherUser.display_name}...`}
                className="w-full pl-4 pr-12 py-3 bg-[#27272a] border border-[#27272a] rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-transparent"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-amber-300 hover:text-amber-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
