'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { supabaseAdmin } from '@/utils/supabase/admin';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at: string | null;
  message_type: string;
  metadata: string | null;
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
  const [currentUserRecord, setCurrentUserRecord] = useState<any>(null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user:', user);
      setUser(user);
      
      if (user) {
        console.log('Looking up user record with UUID:', user.id);
        console.log('User email from auth:', user.email);
        
        // Debug: Check what users exist in database
        const { data: allUsers, error: allUsersError } = await supabaseAdmin
          .from('users')
          .select('id, username, email, uuid')
          .limit(10);
        
        if (allUsers) {
          console.log('Available users in database:', allUsers);
        } else {
          console.error('Error fetching all users:', allUsersError);
        }
        
        // Get user record from database using admin client
        const { data: userRecord, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('uuid', user.id)
          .single();
        
        if (userRecord) {
          console.log('✅ Current user record found:', userRecord);
          setCurrentUserRecord(userRecord);
        } else {
          console.error('❌ Error getting user record by UUID:', error);
          console.log('🔄 Attempting fallback lookup by email:', user.email);
          
          // Fallback: try to find user by email
          if (user.email) {
            const { data: fallbackUserRecord, error: fallbackError } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('email', user.email)
              .single();
            
            if (fallbackUserRecord) {
              console.log('✅ Found user record by email:', fallbackUserRecord);
              setCurrentUserRecord(fallbackUserRecord);
              
              // Update the UUID in the database to match auth
              const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ uuid: user.id })
                .eq('id', fallbackUserRecord.id);
              
              if (updateError) {
                console.error('❌ Error updating UUID:', updateError);
              } else {
                console.log('✅ Updated user UUID in database');
              }
            } else {
              console.error('❌ Fallback email lookup also failed:', fallbackError);
              console.log('🚨 No user record found for authenticated user');
            }
          } else {
            console.error('🚨 No email available for fallback lookup');
          }
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!resolvedParams.userId) return;
      
      console.log('Fetching user with ID:', resolvedParams.userId);
      
      try {
        // Fetch real user from database
        let userRecord = null;
        let error = null;
        
        if (!isNaN(Number(resolvedParams.userId))) {
          console.log('Searching by numeric ID:', resolvedParams.userId);
          const { data, error: idError } = await supabaseAdmin
            .from('users')
            .select('id, username, full_name, avatar_url, email, role, uuid')
            .eq('id', parseInt(resolvedParams.userId))
            .single();
          
          userRecord = data;
          error = idError;
        }
        
        if (!userRecord) {
          console.log('Trying username search for:', resolvedParams.userId);
          const { data, error: usernameError } = await supabaseAdmin
            .from('users')
            .select('id, username, full_name, avatar_url, email, role, uuid')
            .eq('username', resolvedParams.userId)
            .single();
          
          userRecord = data;
          error = usernameError;
        }
        
        if (userRecord) {
          console.log('Found user in database:', userRecord);
          const profile: Profile = {
            id: userRecord.id.toString(),
            display_name: userRecord.full_name || userRecord.username || 'Unknown User',
            avatar_url: userRecord.avatar_url,
            email: userRecord.email || '',
            role: userRecord.role
          };
          setOtherUser(profile);
        } else {
          console.error('User not found:', error);
          router.push('/messages');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/messages');
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [resolvedParams.userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUserRecord || !otherUser) return;
      
      console.log('Loading existing messages for real user conversation...');
      
      try {
        // Find conversation between users using conversation_participants table
        const { data: conversations, error: convError } = await supabaseAdmin
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations!inner(id, created_at)
          `)
          .eq('user_id', parseInt(currentUserRecord.id));

        if (convError) {
          console.error('Error fetching conversations:', convError);
          return;
        }

        console.log('Found conversations for current user:', conversations);

        // Find conversation that includes the other user
        let foundConversationId = null;
        
        if (conversations && conversations.length > 0) {
          for (const conv of conversations) {
            const { data: otherParticipants, error: participantError } = await supabaseAdmin
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conv.conversation_id)
              .eq('user_id', parseInt(otherUser.id));

            if (!participantError && otherParticipants && otherParticipants.length > 0) {
              foundConversationId = conv.conversation_id;
              console.log('Found existing conversation:', foundConversationId);
              break;
            }
          }
        }

        if (foundConversationId) {
          setConversationId(foundConversationId);
          
          // Load messages for this conversation
          const { data: messagesData, error: messagesError } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', foundConversationId)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error loading messages:', messagesError);
          } else {
            console.log('Loaded messages:', messagesData);
            setMessages(messagesData || []);
          }
        } else {
          console.log('No existing conversation found');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error in loadMessages:', error);
      }
    };

    loadMessages();
  }, [currentUserRecord, otherUser]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !currentUserRecord) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserRecord]);

  const sendMessage = async () => {
    if (!currentUserRecord || !newMessage.trim() || !otherUser || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      console.log('Sending message to REAL USER:', otherUser.display_name);

      let currentConversationId = conversationId;

      // Create conversation if it doesn't exist
      if (!currentConversationId) {
        console.log('Creating new conversation...');
        
        const { data: newConversation, error: conversationError } = await supabaseAdmin
          .from('conversations')
          .insert({
            // Only include fields that exist in the database
            // created_at and updated_at will be set automatically
          })
          .select()
          .single();

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
          throw conversationError;
        }

        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);

        // Add participants (removing is_active field that doesn't exist)
        const participants = [
          {
            conversation_id: currentConversationId,
            user_id: parseInt(currentUserRecord.id),
            joined_at: new Date().toISOString()
          },
          {
            conversation_id: currentConversationId,
            user_id: parseInt(otherUser.id),
            joined_at: new Date().toISOString()
          }
        ];

        const { error: participantError } = await supabaseAdmin
          .from('conversation_participants')
          .insert(participants);

        if (participantError) {
          console.error('Error adding participants:', participantError);
          throw participantError;
        }

        console.log('Created conversation with ID:', currentConversationId);
      }

      // Send the message
      const { data: messageData, error: messageError } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          sender_id: parseInt(currentUserRecord.id),
          content: messageContent,
          message_type: 'text',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }

      console.log('Message sent successfully:', messageData);
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-2xl mb-4"></i>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
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
      <div className="max-w-md mx-auto h-screen bg-black flex items-center justify-center">
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
    <div className="max-w-md mx-auto h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-lg z-10 p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/messages" className="text-gray-400 hover:text-white">
            <i className="fas fa-arrow-left text-xl"></i>
          </Link>
          <img
            src={otherUser.avatar_url || `https://placehold.co/40x40/18181b/fcd34d?text=${otherUser.display_name?.charAt(0)}`}
            alt={otherUser.display_name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-white font-semibold">{otherUser.display_name}</h1>
            <p className="text-xs text-gray-400">{otherUser.email}</p>
          </div>
          <div className="text-xs text-gray-400">
            {otherUser.role && (
              <span className="capitalize bg-gray-800 px-2 py-1 rounded">
                {otherUser.role}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <i className="fas fa-comments text-4xl mb-4"></i>
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Send a message to {otherUser.display_name}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserRecord?.id?.toString();
            const messageTime = new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-amber-500 text-black' 
                    : 'bg-gray-800 text-white'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-black/70' : 'text-gray-400'
                  }`}>
                    {messageTime}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input */}
      <footer className="sticky bottom-0 bg-black/90 backdrop-blur-lg p-4 border-t border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherUser.display_name}...`}
              className="w-full pl-4 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
            >
              {sending ? (
                <i className="fas fa-spinner fa-spin text-black text-sm"></i>
              ) : (
                <i className="fas fa-paper-plane text-black text-sm"></i>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}