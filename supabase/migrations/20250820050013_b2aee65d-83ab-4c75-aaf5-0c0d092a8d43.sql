-- Remove duplicate help topics that have no sections
DELETE FROM help_topics 
WHERE id IN (
  '18070516-3977-4822-8ee8-0b87aa1723da', -- Duplicate Creating Notes Manually
  'cde8cc65-0073-4c1d-9bfa-33c6ec08f159'  -- Duplicate Note Organisation  
);

-- Add detailed sections for AI Note Enhancement
INSERT INTO help_topic_sections (help_topic_id, title, content, sort_order) VALUES
('30b11710-def6-408c-bdb7-2bf09be18a3b', 'Understanding AI Note Enhancement', 
'AI Note Enhancement leverages artificial intelligence to automatically improve your notes through:

• **Content Summarization**: Generate concise summaries of lengthy notes
• **Key Point Extraction**: Identify and highlight the most important information
• **Question Generation**: Create study questions based on your notes
• **Content Enrichment**: Add relevant context and explanations
• **Grammar and Spelling Fixes**: Automatically correct errors in your text

**Prerequisites:**
- Existing note with content
- Premium subscription (AI features require GRADUATE tier or higher)
- Active internet connection', 0),

('30b11710-def6-408c-bdb7-2bf09be18a3b', 'Step-by-Step AI Enhancement Process',
'**Step 1: Access AI Enhancement**
- Open any existing note in the editor
- Look for the "Enhance" button in the toolbar (sparkle icon)
- Click the dropdown arrow next to "Enhance"

**Step 2: Choose Enhancement Type**
- **Summarize**: Creates a concise summary of your note content
- **Extract Key Points**: Identifies and lists the main concepts
- **Generate Questions**: Creates study questions for testing knowledge
- **Enrich Content**: Adds explanations and context to existing content

**Step 3: Review AI Suggestions**
- Wait for AI processing (usually 10-30 seconds)
- Review the enhanced content in the preview panel
- The original content remains unchanged until you approve

**Step 4: Apply Enhancements**
- Click "Apply to Note" to merge the AI content
- Choose to replace original content or append to it
- Save your note to preserve the enhancements

**Step 5: Fine-tune Results**
- Edit the AI-generated content as needed
- Combine multiple enhancement types for comprehensive improvement
- Use the undo feature if you''re not satisfied with results', 1),

('30b11710-def6-408c-bdb7-2bf09be18a3b', 'Advanced AI Enhancement Features',
'**Batch Enhancement**
- Select multiple notes for simultaneous enhancement
- Apply consistent enhancement types across related notes
- Use templates to standardize enhancement approaches

**Custom AI Prompts**
- Provide specific instructions for content enhancement
- Target particular aspects of your notes for improvement
- Create personalized enhancement workflows

**Integration with Study Tools**
- Enhanced notes automatically sync with flashcard creation
- AI-generated questions integrate with quiz systems
- Summary content appears in study session recommendations

**Usage Monitoring**
- Track your monthly AI enhancement usage
- View remaining credits for your subscription tier
- Upgrade notifications when approaching limits

**Quality Controls**
- Rate AI enhancement quality to improve future results
- Report inappropriate or inaccurate AI suggestions
- Access enhancement history for each note', 2),

('30b11710-def6-408c-bdb7-2bf09be18a3b', 'AI Enhancement Troubleshooting',
'**Common Issues:**

**"Enhancement Failed" Error**
- Check internet connection stability
- Verify subscription tier supports AI features
- Ensure note content is not empty or corrupted
- Try refreshing the page and attempting again

**Poor Quality Enhancements**
- Ensure original note content is clear and well-structured
- Avoid notes with excessive formatting or special characters
- Provide more context in longer notes for better AI understanding
- Use specific subject tags to help AI understand the domain

**Usage Limit Reached**
- Check your current subscription tier limits
- Monitor usage in account settings
- Consider upgrading to higher tier for more AI credits
- Wait for monthly reset if at limit

**Slow Processing Times**
- AI enhancement typically takes 10-30 seconds
- Large notes (>5000 words) may take longer
- High server load during peak times may cause delays
- Cancel and retry if processing exceeds 2 minutes

**Content Not Saving**
- Ensure you clicked "Apply to Note" before navigating away
- Check browser storage permissions
- Verify internet connection during save process
- Use browser refresh if interface becomes unresponsive', 3);

-- Add detailed sections for Converting YouTube Videos
INSERT INTO help_topic_sections (help_topic_id, title, content, sort_order) VALUES
('e6f2d146-fd22-4b1d-b055-050fa47b2b3c', 'YouTube Video Conversion Overview',
'Convert YouTube videos into structured study notes automatically:

**What It Does:**
• **Transcript Extraction**: Retrieves accurate video transcripts
• **Content Summarization**: Creates organized notes from video content
• **Timestamp Integration**: Links note sections to specific video moments
• **Key Concept Identification**: Highlights important terms and concepts
• **Chapter Creation**: Breaks long videos into digestible sections

**Supported Video Types:**
- Educational content with clear audio
- Lectures, tutorials, and instructional videos
- Videos with auto-generated or manual captions
- Content in supported languages (English, Spanish, French, German)
- Videos up to 3 hours in length

**Requirements:**
- Valid YouTube URL (public videos only)
- Video must have captions/transcripts available
- Premium subscription for advanced features
- Stable internet connection for processing', 0),

('e6f2d146-fd22-4b1d-b055-050fa47b2b3c', 'Step-by-Step Video Conversion',
'**Step 1: Access Video Import Feature**
- Navigate to "Create New Note" section
- Select "Import from YouTube" option
- Look for the YouTube URL input field

**Step 2: Enter Video Information**
- Paste the YouTube video URL
- Verify the video is publicly accessible
- Check that captions are available (CC button visible on YouTube)
- Ensure video is educational/instructional content

**Step 3: Configure Import Settings**
- Choose import quality: Quick, Standard, or Detailed
- Select language for transcript processing
- Set chapter detection sensitivity (auto-detect or manual)
- Choose whether to include timestamps

**Step 4: Process the Video**
- Click "Convert Video" to start processing
- Wait for transcript extraction (1-5 minutes depending on length)
- Monitor progress indicator for completion status
- Review any warnings or errors during processing

**Step 5: Review and Edit Generated Notes**
- Examine the automatically generated note structure
- Verify accuracy of key concepts and summaries
- Edit section titles and content as needed
- Add personal insights or additional information
- Save the completed note to your collection', 1),

('e6f2d146-fd22-4b1d-b055-050fa47b2b3c', 'Advanced Video Processing Options',
'**Custom Processing Settings**
- Adjust transcript accuracy sensitivity
- Filter out common filler words and pauses
- Set minimum section length for chapter creation
- Configure keyword extraction parameters

**Multi-Video Projects**
- Combine multiple related videos into single note
- Create video series compilations
- Link related video concepts across different notes
- Build comprehensive study guides from video playlists

**Integration Features**
- Automatic flashcard generation from video content
- Quiz question creation based on key concepts
- Study session recommendations from video notes
- Progress tracking for video-based learning

**Quality Enhancement**
- Manual transcript correction tools
- Community-contributed caption improvements
- AI-powered content enhancement post-conversion
- Custom formatting templates for different video types

**Export and Sharing**
- Export video notes with embedded timestamps
- Share notes with clickable video links
- Create study guides with video references
- Generate citations for academic use', 2),

('e6f2d146-fd22-4b1d-b055-050fa47b2b3c', 'Video Conversion Troubleshooting',
'**Common Conversion Issues:**

**"Video Not Found" Error**
- Ensure YouTube URL is correct and complete
- Verify video is publicly accessible (not private/unlisted)
- Check if video has been removed or restricted
- Try copying URL directly from YouTube address bar

**"No Captions Available" Warning**
- Check if video has auto-generated captions on YouTube
- Look for manual captions uploaded by creator
- Try videos from educational channels (usually have captions)
- Contact video creator to request caption addition

**Poor Transcript Quality**
- Choose videos with clear, professional audio
- Avoid videos with heavy background music or noise
- Select content in supported languages
- Use manual caption videos when available

**Processing Timeout**
- Long videos (2+ hours) may require multiple attempts
- Break down processing by using specific time ranges
- Check internet connection stability during processing
- Try processing during off-peak hours for better performance

**Incomplete Note Generation**
- Review original video for consistent audio quality
- Check if video contains mostly visual content without speech
- Verify video language matches selected processing language
- Try different import quality settings for better results', 3);

-- Add detailed sections for Note Chat Feature  
INSERT INTO help_topic_sections (help_topic_id, title, content, sort_order) VALUES
('4f24a0f7-9ae5-434a-991c-f24b0ce56103', 'Note Chat Feature Introduction',
'The Note Chat feature enables interactive conversations with your notes using AI:

**Key Capabilities:**
• **Ask Questions**: Get instant answers about your note content
• **Request Explanations**: Clarify complex concepts within your notes
• **Generate Ideas**: Brainstorm related topics and connections
• **Content Expansion**: Add details to existing note sections
• **Study Assistance**: Create practice questions and quiz content

**How It Works:**
- AI analyzes your entire note content as context
- Maintains conversation history for coherent discussions
- Provides responses based specifically on your note information
- Integrates suggestions directly back into note content

**Access Requirements:**
- Any existing note with content
- Premium subscription (GRADUATE tier or higher)
- Internet connection for AI processing
- Modern web browser with JavaScript enabled', 0),

('4f24a0f7-9ae5-434a-991c-f24b0ce56103', 'Using Note Chat Step-by-Step',
'**Step 1: Open Note Chat**
- Open any note in the editor
- Look for the "Chat" icon in the note toolbar
- Click to open the chat panel on the right side
- Wait for AI to analyze your note content

**Step 2: Start a Conversation**
- Type your question in the chat input field
- Examples: "Summarize the main points", "Explain this concept", "Create quiz questions"
- Press Enter or click Send to submit your question
- Wait for AI response (typically 5-15 seconds)

**Step 3: Interactive Discussion**
- Ask follow-up questions based on AI responses
- Request clarification on specific note sections
- Ask for examples or additional details
- Maintain natural conversation flow

**Step 4: Apply Chat Insights**
- Copy useful responses to your note content
- Use "Add to Note" button for direct integration
- Save important chat insights for later reference
- Continue editing your note with new information

**Step 5: Manage Chat History**
- Review previous chat conversations for this note
- Clear chat history when starting fresh topics
- Export chat transcripts for external use
- Rate AI responses to improve future interactions', 1),

('4f24a0f7-9ae5-434a-991c-f24b0ce56103', 'Advanced Chat Interactions',
'**Specialized Chat Commands**
- "Summarize [section]": Get focused summaries of specific parts
- "Explain like I''m 5": Request simplified explanations
- "Give examples": Ask for practical examples of concepts
- "Create flashcards": Generate study cards from note content
- "Find connections": Identify relationships between different topics

**Multi-Turn Conversations**
- Build complex discussions over multiple exchanges
- Reference previous chat responses in new questions
- Maintain context across extended chat sessions
- Ask for progressively deeper explanations

**Content Integration**
- Directly insert AI responses into your notes
- Merge chat insights with existing content
- Create new note sections from chat discussions
- Use chat to expand on brief note outlines

**Collaboration Features**
- Share chat transcripts with study partners
- Export conversations for group discussions
- Use chat insights to improve shared notes
- Create collaborative study materials from chat interactions

**Personalization Options**
- Set chat response length preferences
- Choose explanation complexity levels
- Customize AI personality for different subjects
- Save frequently used question templates', 2),

('4f24a0f7-9ae5-434a-991c-f24b0ce56103', 'Note Chat Troubleshooting',
'**Common Chat Issues:**

**Chat Not Loading**
- Refresh the note page and try again
- Check internet connection stability  
- Verify premium subscription is active
- Clear browser cache and cookies if persistent

**AI Not Understanding Questions**
- Be specific about which part of the note you''re asking about
- Use clear, direct language in your questions
- Reference specific sections or concepts by name
- Try rephrasing questions if initial response is unclear

**Slow Response Times**
- Chat typically responds within 15 seconds
- Complex questions may take longer to process
- High server load during peak times causes delays
- Try shorter, more focused questions for faster responses

**Inaccurate or Irrelevant Responses**
- Ensure your note content is clear and well-organized
- Provide more context in your questions
- Rate poor responses to help improve AI quality
- Try different phrasing if responses seem off-topic

**Chat History Issues**
- Chat history is saved per note automatically
- Clear browser storage if history appears corrupted
- Export important conversations before clearing history
- Contact support if chat data appears lost

**Integration Problems**
- "Add to Note" button requires editor permissions
- Ensure note is not in read-only mode
- Check browser popup blockers that might interfere
- Save note manually if auto-integration fails', 3);