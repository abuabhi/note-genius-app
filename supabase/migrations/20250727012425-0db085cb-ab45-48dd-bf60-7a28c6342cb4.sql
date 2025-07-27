-- Remove collaboration-related columns from tier_limits table if they exist
DO $$ 
BEGIN
    -- Check if collaboration_enabled column exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tier_limits' AND column_name = 'collaboration_enabled') THEN
        ALTER TABLE tier_limits DROP COLUMN collaboration_enabled;
    END IF;
    
    -- Check if chat_enabled column exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tier_limits' AND column_name = 'chat_enabled') THEN
        ALTER TABLE tier_limits DROP COLUMN chat_enabled;
    END IF;
    
    -- Check if max_collaborations column exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tier_limits' AND column_name = 'max_collaborations') THEN
        ALTER TABLE tier_limits DROP COLUMN max_collaborations;
    END IF;
END $$;