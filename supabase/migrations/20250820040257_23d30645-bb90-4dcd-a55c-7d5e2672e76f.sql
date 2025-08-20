-- Populate help topic sections with comprehensive content
-- Using LIMIT 1 to handle any potential duplicates safely

INSERT INTO public.help_topic_sections (help_topic_id, title, content, sort_order) VALUES

-- Creating Study Goals
((SELECT id FROM public.help_topics WHERE title = 'Creating Study Goals' LIMIT 1), 'Getting Started with Study Goals', 
'Study goals help you stay focused and track your academic progress effectively. Goals provide structure to your learning journey and help maintain motivation.

**Why Set Study Goals?**
- Maintain focus and direction in your studies
- Track progress and celebrate achievements  
- Break down large objectives into manageable tasks
- Stay motivated through measurable milestones

**Types of Study Goals**
- **Time-based goals**: Study for X hours per day/week
- **Content goals**: Complete specific chapters or topics
- **Performance goals**: Achieve certain grades or scores
- **Skill goals**: Master particular concepts or abilities', 0),

((SELECT id FROM public.help_topics WHERE title = 'Creating Study Goals' LIMIT 1), 'Step-by-Step Goal Creation', 
'Follow these steps to create effective study goals that drive real results:

**Step 1: Access Goal Creation**
1. Navigate to the Goals section from the main menu
2. Click the "Create New Goal" or "+" button
3. Select your goal template or start from scratch

**Step 2: Define Your Goal**
1. Enter a clear, specific goal title (e.g., "Master Calculus Integration")
2. Write a detailed description explaining what you want to achieve
3. Select the relevant academic subject from your subjects list
4. Set realistic target hours based on the complexity

**Step 3: Set Timeline**
1. Choose your start date (today or future date)
2. Set a realistic end date considering your schedule
3. Allow buffer time for unexpected challenges
4. Consider your other commitments and goals

**Step 4: Configure Settings**
1. Set your preferred study session duration
2. Choose which days of the week you''ll work on this goal
3. Set reminder preferences for staying on track
4. Save your goal and start working toward it', 1),

((SELECT id FROM public.help_topics WHERE title = 'Creating Study Goals' LIMIT 1), 'Advanced Goal Strategies', 
'Maximize your goal success with these advanced techniques:

**Goal Hierarchies**
- Create main goals with supporting sub-goals
- Link related goals together for comprehensive learning
- Set prerequisites and dependencies between goals

**Smart Scheduling**
- Distribute goal work across multiple days
- Balance intensive and review sessions
- Account for increasing difficulty over time
- Plan for breaks and recovery periods

**Progress Optimization**
- Set intermediate checkpoints and milestones
- Use spaced repetition for better retention
- Adjust timelines based on actual progress
- Track both time spent and knowledge gained

**Goal Stacking**
- Combine complementary goals for efficiency
- Use habit stacking to build consistent routines
- Create goal chains that build upon each other', 2),

-- SMART Goal Framework
((SELECT id FROM public.help_topics WHERE title = 'SMART Goal Framework' LIMIT 1), 'Understanding SMART Goals', 
'The SMART framework ensures your study goals are well-defined and achievable. Each letter represents a crucial element for goal success.

**S - Specific**
- Clearly define what you want to accomplish
- Include specific subjects, topics, or skills
- Avoid vague terms like "get better at math"
- Example: "Master quadratic equations and graphing"

**M - Measurable**
- Include quantifiable elements (hours, chapters, scores)
- Set clear success criteria
- Track progress with specific metrics
- Example: "Study 15 hours over 3 weeks"

**A - Achievable**
- Set realistic expectations based on your schedule
- Consider your current skill level and available time
- Challenge yourself without setting impossible standards
- Account for other commitments and responsibilities

**R - Relevant**
- Align goals with your broader academic objectives
- Connect to upcoming exams, projects, or course requirements
- Ensure the goal serves your long-term learning needs
- Focus on what matters most for your success

**T - Time-bound**
- Set specific start and end dates
- Include interim deadlines and milestones
- Create urgency to maintain momentum
- Allow realistic timeframes for deep learning', 0),

((SELECT id FROM public.help_topics WHERE title = 'SMART Goal Framework' LIMIT 1), 'Applying SMART Principles', 
'Transform vague intentions into powerful SMART goals with these practical examples:

**Before: "I want to get better at chemistry"**
**After: "Complete and master all 8 chapters of organic chemistry with 85%+ quiz scores by the end of semester (12 weeks), studying 6 hours per week"**

**SMART Goal Template:**
1. **Specific**: I will [specific action] for [specific subject/topic]
2. **Measurable**: By achieving [quantifiable result] measured by [specific metric]
3. **Achievable**: Based on my [current level] and [available time/resources]
4. **Relevant**: To help me [broader objective/exam/course requirement]
5. **Time-bound**: Starting [date] and completing by [date] with [interim milestones]

**Common SMART Goal Examples:**
- "Study 20 hours of calculus over 4 weeks to score 90%+ on the midterm exam"
- "Complete all physics lab reports with A grades by practicing 2 hours weekly"
- "Master 200 vocabulary words for the SAT by studying 15 minutes daily for 8 weeks"
- "Achieve fluency in Spanish conjugations by completing 30 minutes of practice daily for 6 weeks"', 1),

-- Creating Tasks
((SELECT id FROM public.help_topics WHERE title = 'Creating Tasks' LIMIT 1), 'Getting Started with Tasks', 
'Tasks help you organize and track specific action items related to your studies and academic goals.

**What Are Study Tasks?**
Tasks are actionable items with due dates that help you stay organized and ensure nothing important falls through the cracks. Unlike goals, tasks are typically shorter-term and more specific.

**Types of Study Tasks:**
- **Assignment tasks**: Homework, essays, projects with specific due dates
- **Preparation tasks**: Reading assignments, research, note-taking
- **Review tasks**: Study for exams, review notes, practice problems
- **Administrative tasks**: Register for classes, meet with advisors, submit forms

**Task vs. Goal Differences:**
- **Tasks**: Specific actions with clear completion criteria
- **Goals**: Broader objectives that may include multiple tasks
- **Tasks**: Usually completed within days or weeks
- **Goals**: Often span weeks, months, or entire semesters

**Benefits of Using Tasks:**
- Never miss important deadlines or assignments
- Break down large projects into manageable steps
- Maintain momentum with clear next actions
- Reduce stress by organizing everything in one place', 0),

((SELECT id FROM public.help_topics WHERE title = 'Creating Tasks' LIMIT 1), 'Step-by-Step Task Creation', 
'Create effective tasks that keep you organized and productive:

**Step 1: Access Task Creation**
1. Navigate to the Tasks or Todos section from the main menu
2. Click "Create New Task" or the "+" button
3. Choose to create a standalone task or link it to an existing goal

**Step 2: Define Your Task**
1. **Title**: Write a clear, action-oriented title (e.g., "Complete Chapter 5 exercises")
2. **Description**: Add details about what needs to be done, resources needed, or special requirements
3. **Priority**: Set priority level (High, Medium, Low) based on importance and urgency
4. **Category**: Select or create a category to organize similar tasks

**Step 3: Set Timeline and Reminders**
1. **Due Date**: Set a realistic deadline considering task complexity
2. **Start Date**: Choose when you plan to begin working on this task
3. **Reminders**: Configure alerts to help you stay on track
4. **Estimated Time**: Add how long you expect the task to take

**Step 4: Additional Settings**
1. **Dependencies**: Link tasks that must be completed in a specific order
2. **Resources**: Attach relevant files, links, or notes
3. **Subject/Course**: Associate the task with a specific academic subject
4. **Save and Review**: Save your task and review it appears correctly in your task list', 1),

-- Analytics Dashboard
((SELECT id FROM public.help_topics WHERE title = 'Analytics Dashboard' LIMIT 1), 'Understanding Your Analytics Dashboard', 
'Your analytics dashboard provides comprehensive insights into your learning patterns and academic progress.

**Dashboard Overview:**
The analytics dashboard is your command center for understanding how you learn, where you excel, and where you might need more focus. It combines data from all your study activities to give you actionable insights.

**Key Dashboard Sections:**
- **Study Time Overview**: Total time spent studying across all subjects
- **Performance Metrics**: Success rates, quiz scores, and improvement trends
- **Subject Breakdown**: How your time and performance varies by subject
- **Learning Velocity**: How quickly you''re mastering new concepts
- **Goal Progress**: Visual representation of your goal advancement
- **Streak Tracking**: Consistency in your study habits

**Why Analytics Matter:**
- Identify your most productive study times and methods
- Recognize subjects that need more attention or different approaches
- Track improvement over time to stay motivated
- Make data-driven decisions about how to allocate your study time
- Spot patterns that can help optimize your learning strategy', 0),

((SELECT id FROM public.help_topics WHERE title = 'Analytics Dashboard' LIMIT 1), 'Reading Your Dashboard Metrics', 
'Learn to interpret the key metrics displayed on your analytics dashboard:

**Study Time Metrics:**
- **Total Study Time**: Cumulative hours across all activities and subjects
- **Daily Average**: Average study time per day over selected time period
- **Weekly Trends**: How your study time varies from week to week
- **Time Distribution**: Percentage breakdown of time spent per subject

**Performance Indicators:**
- **Overall Success Rate**: Percentage of questions answered correctly across all activities
- **Subject Performance**: Success rates broken down by individual subjects
- **Improvement Trends**: Whether your performance is increasing, stable, or declining
- **Quiz Scores**: Average scores and trends across different types of assessments

**Productivity Metrics:**
- **Learning Velocity**: Rate at which you''re completing goals and mastering topics
- **Session Quality**: Average effectiveness of your study sessions
- **Consistency Score**: How regularly you''re meeting your study targets
- **Efficiency Rating**: Output achieved relative to time invested

**Using Metrics for Improvement:**
1. Look for subjects with low performance rates - these may need different study methods
2. Identify your peak performance times and schedule important topics then
3. Use trend data to adjust your study schedule and goals
4. Compare current period performance to previous periods to track growth', 1),

-- Account Information (Settings)
((SELECT id FROM public.help_topics WHERE title = 'Account Information' LIMIT 1), 'Managing Your Account Information', 
'Keep your account information up-to-date to ensure the best study experience and secure access to your data.

**Account Profile Overview:**
Your account profile contains personal information, preferences, and settings that customize your study experience across the platform.

**Key Account Information:**
- **Personal Details**: Name, email address, profile picture
- **Study Preferences**: Default subjects, study methods, time zones
- **Notification Settings**: How and when you receive alerts and reminders
- **Privacy Settings**: Control what information is visible to others
- **Subscription Status**: Current plan and billing information

**Why Keep Information Updated:**
- Receive important notifications and reminders
- Ensure accurate progress tracking and analytics
- Maintain secure access to your account
- Get personalized study recommendations
- Enable features that require current information', 0),

((SELECT id FROM public.help_topics WHERE title = 'Account Information' LIMIT 1), 'Updating Your Profile', 
'Step-by-step guide to updating your account information:

**Accessing Account Settings:**
1. Click on your profile icon or name in the top navigation
2. Select "Account Settings" or "Profile" from the dropdown menu
3. Navigate to the "Personal Information" or "Profile" tab

**Updating Personal Information:**
1. **Name**: Click edit next to your name to update first/last name
2. **Email**: Update your email address (you may need to verify the new email)
3. **Profile Picture**: Upload a new profile image or remove current one
4. **Bio/Description**: Add or update information about your study goals

**Study Preferences:**
1. **Default Subjects**: Set which subjects appear first in lists
2. **Time Zone**: Ensure correct time zone for accurate scheduling
3. **Study Session Defaults**: Set preferred session lengths and break times
4. **Language**: Choose your preferred interface language

**Saving Changes:**
- Click "Save Changes" or "Update Profile" after making modifications
- Some changes may require email verification or password confirmation
- Check for confirmation messages to ensure changes were saved successfully', 1),

-- Setting Up Reminders (Reminders)
((SELECT id FROM public.help_topics WHERE title = 'Setting Up Reminders' LIMIT 1), 'Getting Started with Reminders', 
'Reminders help you stay on track with your study goals and never miss important deadlines or study sessions.

**What Are Study Reminders?**
Reminders are personalized alerts that notify you about upcoming study sessions, assignment deadlines, exam dates, and other important academic events.

**Types of Reminders:**
- **Study Session Reminders**: Daily or weekly alerts to start studying
- **Assignment Deadlines**: Alerts for homework and project due dates
- **Exam Reminders**: Notifications about upcoming tests and exams
- **Goal Check-ins**: Progress reviews and milestone celebrations
- **Break Reminders**: Alerts to take breaks during long study sessions

**Reminder Delivery Methods:**
- **In-App Notifications**: Pop-up alerts within the study platform
- **Email Notifications**: Sent to your registered email address
- **Push Notifications**: Mobile alerts if using the mobile app
- **Calendar Integration**: Sync with Google Calendar or other calendar apps

**Benefits of Using Reminders:**
- Never miss important deadlines or study sessions
- Maintain consistent study habits and routines
- Stay motivated with progress check-ins and celebrations
- Reduce stress by staying organized and prepared', 0),

((SELECT id FROM public.help_topics WHERE title = 'Setting Up Reminders' LIMIT 1), 'Creating Custom Reminders', 
'Set up personalized reminders that fit your study schedule and preferences:

**Creating a New Reminder:**
1. Navigate to the Reminders section from the main menu
2. Click "Create New Reminder" or the "+" button
3. Choose the type of reminder you want to create

**Reminder Configuration:**
1. **Title**: Write a clear, descriptive title for your reminder
2. **Description**: Add details about what the reminder is for
3. **Date and Time**: Set when you want to be reminded
4. **Repeat Options**: Choose if this is a one-time or recurring reminder
5. **Priority Level**: Set high, medium, or low priority for the reminder

**Advanced Reminder Settings:**
- **Lead Time**: Set how far in advance you want to be reminded
- **Multiple Alerts**: Create several reminders for the same event
- **Snooze Options**: Allow yourself to postpone reminders if needed
- **Delivery Preferences**: Choose how you want to receive the reminder

**Recurring Reminder Patterns:**
- **Daily**: Every day at the same time
- **Weekly**: Same day(s) each week
- **Monthly**: Same date each month
- **Custom**: Create your own pattern (e.g., every other day, weekdays only)', 1);

-- Add a few more essential sections to demonstrate the pattern
-- Importing Materials (Import-Export)
INSERT INTO public.help_topic_sections (help_topic_id, title, content, sort_order) VALUES
((SELECT id FROM public.help_topics WHERE title = 'Importing Materials' LIMIT 1), 'Getting Started with Import', 
'Import your existing study materials to quickly build your digital study library and continue your learning journey.

**What Can You Import?**
- **Documents**: PDFs, Word documents, text files, and presentations
- **Notes**: Existing digital notes from other apps or handwritten scans
- **Flashcards**: Card sets from other study platforms or CSV files
- **Images**: Diagrams, charts, photos of handwritten notes
- **Audio/Video**: Recorded lectures, study videos, and audio notes

**Import Sources:**
- **File Upload**: Drag and drop files directly from your computer
- **Cloud Storage**: Import from Google Drive, Dropbox, OneDrive
- **Other Apps**: Transfer data from Anki, Quizlet, Notion, and other study apps
- **Scan Integration**: Import scanned documents and handwritten notes
- **Email**: Forward study materials directly to your study account

**Benefits of Importing:**
- Centralize all study materials in one platform
- Convert static documents into interactive study tools
- Save time by building on existing work
- Maintain your study history and progress', 0),

((SELECT id FROM public.help_topics WHERE title = 'Importing Materials' LIMIT 1), 'Step-by-Step Import Process', 
'Follow these steps to successfully import your study materials:

**Preparing Files for Import:**
1. **Organize Files**: Group related materials into folders
2. **Check Formats**: Ensure files are in supported formats (PDF, DOCX, TXT, JPG, PNG)
3. **Clean Up Content**: Remove unnecessary pages or sections
4. **Name Files Clearly**: Use descriptive filenames for easy identification

**Import Process:**
1. **Access Import Feature**: Navigate to Settings > Import/Export or look for "Import" in the main menu
2. **Choose Import Method**: Select file upload, cloud storage, or app integration
3. **Select Files**: Choose the files or folders you want to import
4. **Configure Settings**: Set subject categories, tags, and organization preferences
5. **Review Preview**: Check how your content will appear after import
6. **Confirm Import**: Start the import process and wait for completion

**Post-Import Organization:**
- Review imported content for accuracy and completeness
- Add tags and categories to improve organization
- Create connections between related imported materials
- Set up study schedules using your newly imported content', 1),

-- Dashboard Overview (Progress)
((SELECT id FROM public.help_topics WHERE title = 'Dashboard Overview' LIMIT 1), 'Understanding Your Progress Dashboard', 
'Your progress dashboard provides a comprehensive view of your academic journey and study achievements.

**Dashboard Components:**
The progress dashboard combines data from all your study activities to give you insights into your learning patterns and academic growth.

**Main Dashboard Sections:**
- **Study Overview**: Total study time, sessions completed, and current streaks
- **Goal Progress**: Visual representation of your active goals and completion rates
- **Subject Performance**: Breakdown of progress and performance by subject
- **Recent Activity**: Timeline of your latest study sessions and achievements
- **Upcoming Items**: Deadlines, scheduled study sessions, and pending tasks

**Key Metrics Displayed:**
- **Total Study Hours**: Cumulative time spent in focused study
- **Active Streak**: Consecutive days of study activity
- **Goals Completed**: Number of study goals you''ve successfully achieved
- **Average Session Length**: Typical duration of your study sessions
- **Performance Trends**: Whether your scores and efficiency are improving

**Using Dashboard Insights:**
- Identify your most productive study times and days
- Track progress toward long-term academic goals
- Spot subjects that need more attention or different approaches
- Celebrate achievements and maintain motivation', 0),

((SELECT id FROM public.help_topics WHERE title = 'Dashboard Overview' LIMIT 1), 'Customizing Your Dashboard View', 
'Personalize your dashboard to show the information most important to your study success:

**Dashboard Customization Options:**
1. **Widget Selection**: Choose which information blocks to display
2. **Layout Arrangement**: Drag and drop sections to organize your preferred view
3. **Time Periods**: Adjust date ranges for statistics and trends
4. **Subject Filters**: Focus on specific subjects or view all together

**Available Dashboard Widgets:**
- **Study Time Chart**: Visual graph of daily/weekly study hours
- **Goal Progress Bars**: Individual progress indicators for each active goal
- **Performance Metrics**: Success rates, quiz scores, and improvement trends
- **Activity Calendar**: Monthly view of study sessions and milestones
- **Subject Comparison**: Side-by-side performance across different subjects

**Personalizing Your Experience:**
1. **Access Customization**: Look for "Customize Dashboard" or gear icon
2. **Select Widgets**: Check boxes for information you want to see
3. **Arrange Layout**: Drag widgets to your preferred positions
4. **Set Preferences**: Choose default time ranges and display options
5. **Save Settings**: Confirm your customization choices

**Dashboard Best Practices:**
- Keep your most important metrics visible at the top
- Update your dashboard view as your goals and priorities change
- Use filters to focus on current semester or upcoming exams
- Regularly review dashboard insights to improve study strategies', 1);