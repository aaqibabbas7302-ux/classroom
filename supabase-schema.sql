-- Supabase SQL Schema for AI Teacher Application
-- Run this in your Supabase SQL Editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT 'CBSE',
  webhook_url TEXT NOT NULL,
  emoji TEXT DEFAULT '👨‍🏫',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('sent', 'received')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_subject_id ON messages(subject_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subjects
-- Users can only see their own subjects
CREATE POLICY "Users can view their own subjects"
  ON subjects FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own subjects"
  ON subjects FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own subjects"
  ON subjects FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own subjects"
  ON subjects FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create RLS policies for messages
-- Users can only see messages from their subjects
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for subjects table
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- NOTE: For development without RLS, you can use these simpler policies:
-- DROP POLICY IF EXISTS "Users can view their own subjects" ON subjects;
-- DROP POLICY IF EXISTS "Users can insert their own subjects" ON subjects;
-- DROP POLICY IF EXISTS "Users can update their own subjects" ON subjects;
-- DROP POLICY IF EXISTS "Users can delete their own subjects" ON subjects;
-- DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
-- DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
-- DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- CREATE POLICY "Enable all for authenticated users" ON subjects FOR ALL USING (true);
-- CREATE POLICY "Enable all for authenticated users" ON messages FOR ALL USING (true);
