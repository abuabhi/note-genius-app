-- First, let's check for and remove any duplicate help topics, keeping only the first one
WITH duplicates AS (
  SELECT title, MIN(id) as keep_id
  FROM public.help_topics 
  GROUP BY title
  HAVING COUNT(*) > 1
)
DELETE FROM public.help_topics 
WHERE id NOT IN (SELECT keep_id FROM duplicates)
AND title IN (SELECT title FROM duplicates);

-- Now populate help topic sections with comprehensive content, using LIMIT 1 to ensure single results
INSERT INTO public.help_topic_sections (help_topic_id, title, content, sort_order) VALUES

-- Creating Study Goals (1)
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

-- SMART Goal Framework (2)
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

-- Creating Tasks (from Todos category)
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
4. **Save and Review**: Save your task and review it appears correctly in your task list', 1);

-- Continue with more essential topics for initial population
-- Analytics Dashboard 
INSERT INTO public.help_topic_sections (help_topic_id, title, content, sort_order) VALUES
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
4. Compare current period performance to previous periods to track growth', 1);