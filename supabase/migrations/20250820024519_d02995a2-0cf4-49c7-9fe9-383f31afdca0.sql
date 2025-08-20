-- Populate comprehensive help content for all categories

-- GOALS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Creating Study Goals', 'Learn how to create effective, achievable study goals that drive your learning success', 'goals', 1, '["goal-setting", "SMART-goals", "planning", "objectives"]'::jsonb, '["Start with specific, measurable objectives", "Set realistic deadlines based on your schedule", "Break large goals into smaller milestones", "Review and adjust goals regularly", "Celebrate achievements to stay motivated"]'::jsonb, true, false),

('SMART Goal Framework', 'Master the SMART methodology for creating Specific, Measurable, Achievable, Relevant, and Time-bound study goals', 'goals', 2, '["SMART", "framework", "methodology", "goal-structure"]'::jsonb, '["Make goals Specific with clear outcomes", "Ensure goals are Measurable with metrics", "Keep goals Achievable and realistic", "Align goals with your learning objectives", "Set Time-bound deadlines for accountability"]'::jsonb, true, false),

('Daily and Weekly Targets', 'Set up short-term targets that build momentum and create consistent study habits', 'goals', 3, '["daily-goals", "weekly-targets", "short-term", "habits", "consistency"]'::jsonb, '["Start with small daily targets (15-30 minutes)", "Build weekly targets around your schedule", "Track completion rates to adjust difficulty", "Use targets to build study momentum", "Review weekly progress every Sunday"]'::jsonb, true, false),

('Subject-specific Goals', 'Create targeted goals for individual subjects and learning areas', 'goals', 4, '["subjects", "specialized-goals", "learning-areas", "focus"]'::jsonb, '["Set different goals for each subject", "Align goals with curriculum requirements", "Consider subject difficulty when setting timelines", "Track progress separately per subject", "Adjust goals based on subject performance"]'::jsonb, true, false),

('Goal Progress Tracking', 'Monitor and update your goal progress effectively to stay on track', 'goals', 5, '["progress", "tracking", "monitoring", "updates", "metrics"]'::jsonb, '["Check progress weekly, not daily", "Use visual progress indicators", "Document obstacles and solutions", "Adjust timelines when needed", "Celebrate milestone achievements"]'::jsonb, true, false),

('Goal Reminders', 'Set up automated notifications to keep your goals top of mind', 'goals', 6, '["reminders", "notifications", "automation", "alerts", "accountability"]'::jsonb, '["Set daily goal review reminders", "Use deadline alerts for important goals", "Create weekly progress check notifications", "Set motivational milestone reminders", "Customize reminder frequency per goal type"]'::jsonb, true, false),

('Achievement System', 'Understand badges, rewards, and gamification features that motivate learning', 'goals', 7, '["achievements", "badges", "rewards", "gamification", "motivation"]'::jsonb, '["Check achievements regularly for motivation", "Use badges to track learning milestones", "Share achievements to stay accountable", "Set personal achievement challenges", "Review achievement history for inspiration"]'::jsonb, true, false);

-- TODOS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Creating Tasks', 'Learn how to add, organize, and categorize your study tasks effectively', 'todos', 1, '["task-creation", "organization", "categorization", "productivity"]'::jsonb, '["Use clear, action-oriented task titles", "Add due dates to create urgency", "Include context or notes for complex tasks", "Categorize tasks by subject or priority", "Start with small, manageable tasks"]'::jsonb, true, false),

('Task Management', 'Master priority levels, due dates, and task dependencies for optimal workflow', 'todos', 2, '["task-management", "priorities", "due-dates", "workflow", "dependencies"]'::jsonb, '["Use High/Medium/Low priority system", "Set realistic due dates with buffer time", "Handle urgent tasks first thing daily", "Group similar tasks together", "Review and update priorities weekly"]'::jsonb, true, false),

('Progress Tracking', 'Track task completion and update status to maintain momentum', 'todos', 3, '["progress", "completion", "status", "tracking", "momentum"]'::jsonb, '["Check off completed tasks immediately", "Update task status regularly", "Review incomplete tasks weekly", "Break large tasks into subtasks", "Use progress to build daily momentum"]'::jsonb, true, false),

('Reminders Integration', 'Connect your todos with smart notifications and alerts', 'todos', 4, '["reminders", "notifications", "integration", "alerts", "automation"]'::jsonb, '["Set reminders for important deadlines", "Use recurring reminders for regular tasks", "Customize notification timing", "Link tasks to calendar events", "Balance reminder frequency to avoid overwhelm"]'::jsonb, true, false),

('Categories and Organization', 'Use tagging, filtering, and grouping to organize your task list', 'todos', 5, '["categories", "organization", "tagging", "filtering", "grouping"]'::jsonb, '["Create categories by subject or task type", "Use tags for quick filtering", "Group related tasks together", "Archive completed categories", "Maintain consistent categorization system"]'::jsonb, true, false),

('Advanced Features', 'Explore recurring tasks, bulk operations, and productivity features', 'todos', 6, '["advanced", "recurring", "bulk-operations", "productivity", "automation"]'::jsonb, '["Set up recurring tasks for regular activities", "Use bulk actions for efficiency", "Create task templates for common activities", "Link tasks to study goals", "Automate routine task creation"]'::jsonb, true, false);

-- ANALYTICS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Analytics Dashboard', 'Navigate and understand your comprehensive learning analytics overview', 'analytics', 1, '["dashboard", "overview", "analytics", "metrics", "insights"]'::jsonb, '["Check dashboard weekly for key insights", "Focus on trending metrics", "Use filters to drill down into specific periods", "Compare current vs. previous periods", "Export data for deeper analysis"]'::jsonb, true, false),

('Study Time Tracking', 'Analyze your study sessions, time logs, and learning patterns', 'analytics', 2, '["time-tracking", "study-sessions", "patterns", "duration", "habits"]'::jsonb, '["Review daily study time consistency", "Identify your most productive hours", "Track session quality, not just duration", "Monitor break patterns for optimization", "Set time-based learning goals"]'::jsonb, true, false),

('Performance Trends', 'Understand your learning progress through charts and trend analysis', 'analytics', 3, '["performance", "trends", "progress", "charts", "analysis"]'::jsonb, '["Look for consistent upward trends", "Identify seasonal learning patterns", "Compare performance across subjects", "Use trends to predict future outcomes", "Address declining trends quickly"]'::jsonb, true, false),

('Subject-wise Analytics', 'Compare and analyze performance across different study subjects', 'analytics', 4, '["subjects", "comparison", "performance", "analysis", "breakdown"]'::jsonb, '["Compare time investment vs. performance", "Identify strongest and weakest subjects", "Balance study time across subjects", "Track improvement rates per subject", "Use insights to prioritize study time"]'::jsonb, true, false),

('Learning Velocity', 'Monitor your learning speed, efficiency, and knowledge acquisition rate', 'analytics', 5, '["velocity", "speed", "efficiency", "acquisition", "pace"]'::jsonb, '["Track concepts learned per study session", "Monitor time-to-mastery for topics", "Identify factors that boost learning speed", "Adjust pace based on complexity", "Use velocity to plan study schedules"]'::jsonb, true, false),

('Retention and Memory Metrics', 'Analyze memory strength and knowledge retention patterns', 'analytics', 6, '["retention", "memory", "recall", "forgetting-curve", "strength"]'::jsonb, '["Review retention rates regularly", "Identify topics needing reinforcement", "Use spaced repetition for weak areas", "Track long-term vs. short-term retention", "Monitor forgetting curve patterns"]'::jsonb, true, false),

('Predictive Insights', 'Leverage AI-powered predictions for optimized learning outcomes', 'analytics', 7, '["predictions", "AI", "insights", "optimization", "forecasting"]'::jsonb, '["Use predictions to plan study schedules", "Follow AI recommendations for topic review", "Monitor prediction accuracy over time", "Adjust study habits based on insights", "Trust but verify AI suggestions"]'::jsonb, true, false),

('Custom Reports', 'Generate personalized analytics reports for detailed learning analysis', 'analytics', 8, '["reports", "custom", "personalized", "detailed", "export"]'::jsonb, '["Create weekly progress reports", "Generate subject-specific analyses", "Export data for external tools", "Share reports with study partners", "Schedule automated report generation"]'::jsonb, true, false);

-- SETTINGS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Account Information', 'Manage your profile, personal details, and account preferences', 'settings', 1, '["profile", "account", "personal", "details", "preferences"]'::jsonb, '["Keep profile information up to date", "Use a clear profile picture", "Update contact information regularly", "Set accurate timezone for scheduling", "Complete all profile sections for better experience"]'::jsonb, true, false),

('Adding/Deleting Subjects', 'Organize and manage your study subjects and learning areas', 'settings', 2, '["subjects", "organization", "management", "learning-areas", "curriculum"]'::jsonb, '["Add subjects as you start new courses", "Use clear, descriptive subject names", "Archive completed subjects instead of deleting", "Organize subjects by semester or category", "Review and clean up subjects regularly"]'::jsonb, true, false),

('Subscription Management', 'Handle your plan details, billing, and account upgrades', 'settings', 3, '["subscription", "billing", "plans", "upgrades", "payment"]'::jsonb, '["Review plan features regularly", "Upgrade before hitting limits", "Keep payment information current", "Monitor usage against plan limits", "Contact support for billing questions"]'::jsonb, true, false),

('Notifications Management', 'Customize alert preferences, frequency, and delivery methods', 'settings', 4, '["notifications", "alerts", "preferences", "frequency", "delivery"]'::jsonb, '["Balance helpful vs. overwhelming notifications", "Set quiet hours for focused study", "Customize notifications per activity type", "Use email for important alerts only", "Review and adjust settings monthly"]'::jsonb, true, false),

('Study Preferences', 'Configure your learning style, difficulty preferences, and study habits', 'settings', 5, '["learning-style", "difficulty", "preferences", "study-habits", "customization"]'::jsonb, '["Set realistic difficulty levels", "Choose preferences matching your learning style", "Update preferences as you improve", "Experiment with different settings", "Use preferences to guide content recommendations"]'::jsonb, true, false),

('Adaptive Learning Settings', 'Configure AI algorithms and personalized learning features', 'settings', 6, '["adaptive", "AI", "algorithms", "personalization", "machine-learning"]'::jsonb, '["Allow AI to collect learning data", "Provide feedback on recommendations", "Adjust AI sensitivity settings", "Review AI performance regularly", "Trust the adaptive system to improve over time"]'::jsonb, true, false),

('Password Security', 'Manage password changes, two-factor authentication, and account security', 'settings', 7, '["password", "security", "2FA", "authentication", "account-safety"]'::jsonb, '["Use strong, unique passwords", "Enable two-factor authentication", "Change passwords regularly", "Don\'t share login credentials", "Review login activity for suspicious access"]'::jsonb, true, false);

-- PROGRESS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Dashboard Overview', 'Navigate and understand your comprehensive progress dashboard', 'progress', 1, '["dashboard", "overview", "interface", "navigation", "summary"]'::jsonb, '["Check dashboard daily for motivation", "Focus on key metrics first", "Use quick actions for common tasks", "Customize dashboard layout for your needs", "Bookmark frequently viewed sections"]'::jsonb, true, false),

('Performance Metrics', 'Understand key learning indicators and performance measurements', 'progress', 2, '["metrics", "indicators", "performance", "measurements", "KPIs"]'::jsonb, '["Focus on consistency over perfection", "Track leading indicators (study time) vs. lagging (test scores)", "Set benchmarks for key metrics", "Monitor metric trends over time", "Use metrics to identify improvement areas"]'::jsonb, true, false),

('Subject Progress Tracking', 'Monitor individual subject progress and learning outcomes', 'progress', 3, '["subjects", "individual", "tracking", "outcomes", "monitoring"]'::jsonb, '["Track progress per subject separately", "Set subject-specific milestones", "Compare progress across subjects", "Identify subjects needing more attention", "Celebrate subject-level achievements"]'::jsonb, true, false),

('Learning Streaks', 'Build and maintain consistent study habits and learning momentum', 'progress', 4, '["streaks", "consistency", "habits", "momentum", "discipline"]'::jsonb, '["Start with small, achievable daily streaks", "Don\'t break the chain mentality", "Plan for potential streak-breaking events", "Focus on consistency over intensity", "Use streaks as motivation, not pressure"]'::jsonb, true, false),

('Weekly/Monthly Reports', 'Generate and review comprehensive progress reports', 'progress', 5, '["reports", "weekly", "monthly", "comprehensive", "review"]'::jsonb, '["Schedule regular report review sessions", "Compare reports across time periods", "Share reports with study partners", "Use reports to plan next period goals", "Document insights and action items"]'::jsonb, true, false),

('Comparative Analysis', 'Use progress comparison tools to identify patterns and improvements', 'progress', 6, '["comparison", "analysis", "patterns", "improvements", "benchmarking"]'::jsonb, '["Compare current vs. previous periods", "Analyze seasonal learning patterns", "Benchmark against personal bests", "Use comparisons to motivate improvement", "Focus on personal progress, not competition"]'::jsonb, true, false);

-- REMINDERS CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Setting Up Reminders', 'Create effective notifications that support your study routine', 'reminders', 1, '["setup", "notifications", "routine", "creation", "configuration"]'::jsonb, '["Start with just a few key reminders", "Choose specific, actionable reminder text", "Set reminders 15-30 minutes before tasks", "Test reminder timing and adjust as needed", "Use positive, motivating reminder language"]'::jsonb, true, false),

('Reminder Types', 'Understand different formats, schedules, and reminder categories', 'reminders', 2, '["types", "formats", "schedules", "categories", "varieties"]'::jsonb, '["Use goal reminders for long-term objectives", "Set task reminders for specific actions", "Create study session reminders for consistency", "Use deadline alerts for important dates", "Customize reminder types per activity"]'::jsonb, true, false),

('Study Schedule Reminders', 'Automate your study schedule with smart scheduling notifications', 'reminders', 3, '["schedule", "automation", "study-sessions", "scheduling", "routine"]'::jsonb, '["Set recurring study session reminders", "Include buffer time in study reminders", "Set reminders for study breaks", "Use location-based reminders when helpful", "Adjust schedule reminders based on effectiveness"]'::jsonb, true, false),

('Goal and Deadline Alerts', 'Stay on track with important dates and milestone notifications', 'reminders', 4, '["goals", "deadlines", "alerts", "milestones", "dates"]'::jsonb, '["Set multiple alerts for important deadlines", "Create milestone celebration reminders", "Use escalating urgency for approaching deadlines", "Set goal review reminders weekly", "Include actionable next steps in deadline alerts"]'::jsonb, true, false),

('Notification Preferences', 'Customize reminder delivery methods and timing preferences', 'reminders', 5, '["preferences", "delivery", "timing", "customization", "methods"]'::jsonb, '["Choose notification methods that you actually check", "Set quiet hours for focused study time", "Customize urgency levels per reminder type", "Use sound and vibration settings effectively", "Review and adjust preferences regularly"]'::jsonb, true, false),

('Managing Reminder Overload', 'Balance helpful notifications without overwhelming your focus', 'reminders', 6, '["balance", "overload", "focus", "management", "optimization"]'::jsonb, '["Limit total daily reminders to 5-7", "Group related reminders together", "Use snooze functionality wisely", "Turn off non-essential reminders", "Regularly clean up outdated reminders"]'::jsonb, true, false);

-- IMPORT-EXPORT CATEGORY --
INSERT INTO public.help_topics (title, description, category, priority, tags, quick_tips, is_active, show_video) VALUES
('Importing Study Materials', 'Bring your existing study content into the platform efficiently', 'import-export', 1, '["import", "materials", "content", "migration", "upload"]'::jsonb, '["Organize files before importing", "Use consistent naming conventions", "Import in small batches for better management", "Review imported content for accuracy", "Keep original files as backup"]'::jsonb, true, false),

('Supported File Formats', 'Understand compatible formats and file limitations for uploads', 'import-export', 2, '["formats", "compatibility", "limitations", "file-types", "support"]'::jsonb, '["Use PDF for text documents", "Import images in JPG or PNG format", "Keep file sizes under recommended limits", "Convert unsupported formats before importing", "Check file format requirements before uploading"]'::jsonb, true, false),

('Bulk Import Operations', 'Handle multiple files and large content imports effectively', 'import-export', 3, '["bulk", "multiple", "large", "operations", "efficiency"]'::jsonb, '["Organize files in folders before bulk import", "Use batch processing for large imports", "Monitor import progress and errors", "Verify all files imported successfully", "Plan bulk imports during low-usage times"]'::jsonb, true, false),

('Exporting Your Data', 'Download and backup your study data and content', 'import-export', 4, '["export", "download", "backup", "data", "archive"]'::jsonb, '["Export data regularly for backup", "Choose appropriate export formats", "Include metadata in exports", "Test exported files before relying on them", "Store exports in multiple secure locations"]'::jsonb, true, false),

('Data Migration', 'Move your content from other study platforms seamlessly', 'import-export', 5, '["migration", "platforms", "transfer", "conversion", "transition"]'::jsonb, '["Export data from old platform first", "Map content types between platforms", "Test migration with small sample first", "Verify all data migrated correctly", "Keep old platform access during transition"]'::jsonb, true, false),

('Backup and Restore', 'Protect your study data with regular backups and recovery options', 'import-export', 6, '["backup", "restore", "protection", "recovery", "safety"]'::jsonb, '["Schedule automatic regular backups", "Test restore procedures regularly", "Store backups in multiple locations", "Include all content types in backups", "Document backup and restore procedures"]'::jsonb, true, false);