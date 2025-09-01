-- Final security cleanup - ensure all extensions are properly secured
-- This addresses the remaining "Extension in Public" warning

-- Check for any remaining extensions in the public schema and move them
DO $$
DECLARE
    ext_record RECORD;
BEGIN
    -- Move any remaining extensions from public to extensions schema
    FOR ext_record IN 
        SELECT e.extname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
        AND e.extname NOT IN ('plpgsql') -- Keep plpgsql in public as it's system default
    LOOP
        EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_record.extname);
        RAISE NOTICE 'Moved extension % from public to extensions schema', ext_record.extname;
    END LOOP;
END;
$$;

-- Verify that we haven't missed any critical extensions
-- This is just for logging, no changes
DO $$
DECLARE
    ext_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ext_count
    FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE n.nspname = 'public'
    AND e.extname NOT IN ('plpgsql');
    
    IF ext_count > 0 THEN
        RAISE WARNING 'Still found % extensions in public schema that may need attention', ext_count;
    ELSE
        RAISE NOTICE 'All non-system extensions successfully moved to secure schemas';
    END IF;
END;
$$;