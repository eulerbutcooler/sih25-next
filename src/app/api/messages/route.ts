import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db";
import {
  conversations,
  conversationParticipants,
  messages,
  users,
} from "@/utils/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, content, messageType = "text" } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json(
        { error: "Recipient ID and content are required" },
        { status: 400 }
      );
    }

    // Get current user's database record
    const currentUser = await db
      .select({
        id: users.id,
        uuid: users.uuid,
        username: users.username,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser[0].id;
    const currentUserData = currentUser[0];

    // Get recipient user data
    const recipient = await db
      .select({
        id: users.id,
        uuid: users.uuid,
        username: users.username,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, parseInt(recipientId)))
      .limit(1);

    if (recipient.length === 0) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // const recipientData = recipient[0];

    // Find existing conversation between the two users
    const userConversations = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, currentUserId));

    let conversationId = null;

    if (userConversations.length > 0) {
      for (const conv of userConversations) {
        const otherParticipant = await db
          .select({ userId: conversationParticipants.userId })
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conv.conversationId),
              eq(conversationParticipants.userId, parseInt(recipientId))
            )
          )
          .limit(1);

        if (otherParticipant.length > 0) {
          conversationId = conv.conversationId;
          break;
        }
      }
    }

    // Create conversation if it doesn't exist
    if (!conversationId) {
      const newConversation = await db
        .insert(conversations)
        .values({})
        .returning({ id: conversations.id });

      conversationId = newConversation[0].id;

      // Add participants
      await db.insert(conversationParticipants).values([
        {
          conversationId: conversationId,
          userId: currentUserId,
        },
        {
          conversationId: conversationId,
          userId: parseInt(recipientId),
        },
      ]);
    }

    // Insert the message
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId: conversationId,
        senderId: currentUserId,
        content: content.trim(),
        messageType: messageType,
      })
      .returning({
        id: messages.id,
        uuid: messages.uuid,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        createdAt: messages.createdAt,
      });

    const messageData = newMessage[0];

    // Broadcast the message to all participants using Supabase Realtime
    const broadcastData = {
      type: "NEW_MESSAGE",
      message: {
        ...messageData,
        sender: {
          id: currentUserData.id,
          uuid: currentUserData.uuid,
          username: currentUserData.username,
          fullName: currentUserData.fullName,
          avatarUrl: currentUserData.avatarUrl,
        },
      },
      conversationId: conversationId,
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Broadcasting message to conversation channel...");

    // Create and send broadcast for realtime messaging
    try {
      const channelName = `conversation-${conversationId}`;
      console.log(`📡 Sending to channel: ${channelName}`);

      const channel = supabase.channel(channelName);

      const broadcastResult = await channel.send({
        type: "broadcast",
        event: "message",
        payload: broadcastData,
      });

      console.log("📡 Broadcast result:", broadcastResult);

      if (broadcastResult === "ok") {
        console.log("✅ Broadcast sent successfully");
      } else {
        console.warn(
          "⚠️ Broadcast may not have been delivered:",
          broadcastResult
        );
      }
    } catch (broadcastError) {
      console.error("❌ Error broadcasting message:", broadcastError);
    }

    console.log("✅ Message processing complete");

    return NextResponse.json({
      success: true,
      message: {
        ...messageData,
        sender: currentUserData,
      },
      conversationId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// GET method to retrieve messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Get current user's database record
    const currentUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = currentUser[0].id;

    // Verify user is a participant in this conversation
    const participation = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, parseInt(conversationId)),
          eq(conversationParticipants.userId, currentUserId)
        )
      )
      .limit(1);

    if (participation.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to access this conversation" },
        { status: 403 }
      );
    }

    // Get messages with sender information
    const messagesData = await db
      .select({
        id: messages.id,
        uuid: messages.uuid,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        senderUuid: users.uuid,
        senderUsername: users.username,
        senderFullName: users.fullName,
        senderAvatarUrl: users.avatarUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, parseInt(conversationId)))
      .orderBy(messages.createdAt)
      .limit(limit)
      .offset(offset);

    const formattedMessages = messagesData.map((msg) => ({
      id: msg.id,
      uuid: msg.uuid,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      messageType: msg.messageType,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      sender: {
        id: msg.senderId,
        uuid: msg.senderUuid,
        username: msg.senderUsername,
        fullName: msg.senderFullName,
        avatarUrl: msg.senderAvatarUrl,
      },
    }));

    return NextResponse.json({
      messages: formattedMessages,
      hasMore: messagesData.length === limit,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return NextResponse.json(
      { error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}
