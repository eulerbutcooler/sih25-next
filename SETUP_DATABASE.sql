-- Ocean Hazard Messaging System Database Setup
-- Run this script in your Supabase SQL Editor

-- Create ENUMs first
CREATE TYPE user_role AS ENUM (
  'citizen',
  'official',
  'emergency',
  'scientist',
  'authority'
);

CREATE TYPE media_file_type AS ENUM (
  'image',
  'video'
);

CREATE TYPE post_verification_status AS ENUM (
  'pending',
  'under_review',
  'verified',
  'rejected'
);

CREATE TYPE severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE hazard_type AS ENUM (
  'cyclone',
  'hurricane',
  'flood',
  'tidal-flooding',
  'red-tide',
  'jellyfish',
  'high-waves',
  'oil-spill',
  'debris',
  'pollution',
  'erosion',
  'other'
);

-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  supabase_id UUID NOT NULL UNIQUE,
  role user_role DEFAULT 'citizen' NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name TEXT,
  email VARCHAR(255) NOT NULL UNIQUE,
  organization TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create posts table
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type media_file_type NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_name TEXT,
  hazard_type hazard_type NOT NULL,
  status post_verification_status DEFAULT 'pending' NOT NULL,
  severity severity DEFAULT 'low' NOT NULL,
  sentiment_score REAL,
  verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create followers table
CREATE TABLE followers (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- Create likes table
CREATE TABLE likes (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- Create conversations table
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' NOT NULL,
  metadata TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance

-- Posts indexes
CREATE INDEX idx_posts_location ON posts USING GIST (location);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at_desc ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status) WHERE status IN ('pending', 'under_review');

-- Followers indexes
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Likes indexes
CREATE INDEX idx_likes_post_id ON likes(post_id);

-- Conversation indexes
CREATE INDEX conversation_user_idx ON conversation_participants(conversation_id, user_id);

-- Messages indexes
CREATE INDEX messages_conversation_idx ON messages(conversation_id);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_created_at_idx ON messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = supabase_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = supabase_id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = (SELECT supabase_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = (SELECT supabase_id FROM users WHERE id = user_id));

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
        )
    );

CREATE POLICY "Users can add themselves to conversations" ON conversation_participants
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM users WHERE supabase_id = auth.uid()) AND
        conversation_id IN (
            SELECT conversation_id 
            FROM conversation_participants 
            WHERE user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        sender_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

-- Followers policies
CREATE POLICY "Users can view all follows" ON followers
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON followers
    FOR INSERT WITH CHECK (
        follower_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

CREATE POLICY "Users can unfollow" ON followers
    FOR DELETE USING (
        follower_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

-- Likes policies
CREATE POLICY "Users can view all likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON likes
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

CREATE POLICY "Users can unlike posts" ON likes
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
    );

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Insert some sample data for testing (optional)
-- You can comment out this section if you don't want sample data

-- Insert sample users (these will be connected to real Supabase auth users later)
INSERT INTO users (supabase_id, username, full_name, email, role, organization) VALUES
('00000000-0000-0000-0000-000000000001', 'coastguard_mumbai', 'Coast Guard Mumbai', 'coastguard@mumbai.gov.in', 'official', 'Indian Coast Guard'),
('00000000-0000-0000-0000-000000000002', 'dr_priya_nair', 'Dr. Priya Nair', 'priya.nair@marine.institute', 'scientist', 'Marine Research Institute'),
('00000000-0000-0000-0000-000000000003', 'emergency_services', 'Emergency Response Team', 'emergency@mumbai.gov.in', 'emergency', 'Mumbai Emergency Services');

-- Success message
SELECT 'Ocean Hazard Messaging Database Setup Complete! 🎉' as status;
