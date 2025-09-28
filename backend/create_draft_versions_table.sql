-- SQL to create the draft_versions table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS draft_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draft_id UUID NOT NULL,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key to drafts table
    CONSTRAINT fk_draft_versions_draft_id 
        FOREIGN KEY (draft_id) 
        REFERENCES drafts(id) 
        ON DELETE CASCADE
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_draft_versions_draft_id ON draft_versions(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_versions_created_at ON draft_versions(created_at DESC);

-- Row Level Security (RLS) - same pattern as your drafts table
ALTER TABLE draft_versions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see versions of their own drafts
CREATE POLICY "Users can view their own draft versions" ON draft_versions
    FOR SELECT USING (
        draft_id IN (
            SELECT id FROM drafts WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to insert versions for their own drafts
CREATE POLICY "Users can create versions for their own drafts" ON draft_versions
    FOR INSERT WITH CHECK (
        draft_id IN (
            SELECT id FROM drafts WHERE user_id = auth.uid()
        )
    );