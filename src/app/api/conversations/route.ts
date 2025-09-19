import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db';
import { conversations, conversationParticipants, messages, users } from '@/utils/db/schema';
import { eq, and, desc, ne, isNull } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's ID from our database
    const currentUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserId = currentUser[0].id;

    // Get all conversations where the current user is a participant
    const userConversations = await db
      .select({
        conversationId: conversationParticipants.conversationId,
        conversationUuid: conversations.uuid,
        conversationCreatedAt: conversations.createdAt,
      })
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
      .where(eq(conversationParticipants.userId, currentUserId));

    if (userConversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // For each conversation, get the other participant and last message
    const conversationDetails = await Promise.all(
      userConversations.map(async (conv) => {
        // Get the other participant in this conversation
        const otherParticipant = await db
          .select({
            id: users.id,
            uuid: users.uuid,
            username: users.username,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            avatarUrl: users.avatarUrl,
          })
          .from(conversationParticipants)
          .innerJoin(users, eq(conversationParticipants.userId, users.id))
          .where(
            and(
              eq(conversationParticipants.conversationId, conv.conversationId),
              ne(conversationParticipants.userId, currentUserId)
            )
          )
          .limit(1);

        // Get the last message in this conversation
        const lastMessage = await db
          .select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
          })
          .from(messages)
          .where(eq(messages.conversationId, conv.conversationId))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Count unread messages (messages sent by others that haven't been read)
        const unreadMessages = await db
          .select({
            count: messages.id,
          })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.conversationId),
              ne(messages.senderId, currentUserId),
              isNull(messages.readAt)
            )
          );

        if (otherParticipant.length === 0) {
          return null; // Skip conversations without other participants
        }

        return {
          id: conv.conversationUuid,
          other_user: {
            id: otherParticipant[0].uuid,
            display_name: otherParticipant[0].fullName || otherParticipant[0].username,
            email: otherParticipant[0].email,
            avatar_url: otherParticipant[0].avatarUrl,
            role: otherParticipant[0].role,
          },
          last_message: lastMessage.length > 0 ? lastMessage[0].content : 'No messages yet',
          last_message_time: lastMessage.length > 0 
            ? new Date(lastMessage[0].createdAt).toLocaleDateString()
            : new Date(conv.conversationCreatedAt).toLocaleDateString(),
          unread_count: unreadMessages.length,
        };
      })
    );

    // Filter out null conversations and sort by last message time
    const validConversations = conversationDetails
      .filter((conv) => conv !== null)
      .sort((a, b) => {
        const timeA = new Date(a.last_message_time).getTime();
        const timeB = new Date(b.last_message_time).getTime();
        return timeB - timeA; // Most recent first
      });

    return NextResponse.json({ conversations: validConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}