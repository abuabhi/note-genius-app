
-- Clear all reminders/todos and related data
DELETE FROM reminders;

-- Clear any todo templates
DELETE FROM todo_templates;

-- Clear email digest preferences (since they reference todos)
DELETE FROM email_digest_preferences;

-- Clear digest content cache
DELETE FROM digest_content_cache;

-- Clear any study goals that might reference todos
DELETE FROM study_goals;

-- Clear any events that might be task-related
DELETE FROM events;
