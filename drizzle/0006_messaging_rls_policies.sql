-- Enable RLS on messaging tables (if not already enabled)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Conversations table policies
CREATE POLICY "Users can insert conversations" ON conversations 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view conversations they participate in" ON conversations 
FOR SELECT TO authenticated 
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
  )
);

-- Conversation participants table policies  
CREATE POLICY "Users can insert participants" ON conversation_participants 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view participants in their conversations" ON conversation_participants 
FOR SELECT TO authenticated 
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
  )
);

-- Messages table policies
CREATE POLICY "Users can insert messages" ON messages 
FOR INSERT TO authenticated 
WITH CHECK (
  sender_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
);

CREATE POLICY "Users can view messages in their conversations" ON messages 
FOR SELECT TO authenticated 
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
  )
);
