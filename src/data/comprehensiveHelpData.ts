import { HelpContent } from '@/types/help';

export const comprehensiveHelpData: HelpContent[] = [
  // ============= GETTING STARTED =============
  {
    id: 'getting-started-welcome',
    title: 'Welcome to StudyFlow',
    description: 'Learn the basics of StudyFlow and get started with your learning journey',
    category: 'getting-started',
    context: ['dashboard'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'welcome-overview',
        title: 'What is StudyFlow?',
        content: 'StudyFlow is an AI-powered learning platform that helps you create, organize, and study your notes, flashcards, and quizzes. Whether you\'re a student, professional, or lifelong learner, StudyFlow adapts to your learning style and helps you achieve your goals faster.',
        sort_order: 1
      },
      {
        id: 'welcome-features',
        title: 'Key Features',
        content: '• **Smart Notes**: Create and enhance notes with AI assistance\n• **Adaptive Flashcards**: Spaced repetition system for optimal retention\n• **Intelligent Quizzes**: Auto-generated or custom quizzes\n• **Study Sessions**: Focused learning with progress tracking\n• **AI Enhancement**: Improve content with advanced AI features\n• **Progress Analytics**: Track your learning journey',
        sort_order: 2
      }
    ],
    quickTips: [
      'Start by creating your first note or importing existing content',
      'Use AI enhancements to improve your study materials',
      'Set up study goals to track your progress'
    ],
    tags: ['welcome', 'overview', 'features'],
    lastUpdated: '2024-01-15'
  },

  // ============= NOTES CATEGORY =============
  {
    id: 'notes-create-manual',
    title: 'How to Create Notes Manually',
    description: 'Learn how to create and format notes from scratch using our rich text editor',
    category: 'notes',
    context: ['note-creation', 'notes-list'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'manual-creation-basics',
        title: 'Creating Your First Note',
        content: '1. **Navigate to Notes**: Go to the Notes section from the main navigation\n2. **Click Create Note**: Select the "Create Note" button\n3. **Add Title**: Enter a descriptive title for your note\n4. **Choose Subject**: Select or create a subject category\n5. **Start Writing**: Use the rich text editor to add your content',
        sort_order: 1
      },
      {
        id: 'manual-formatting-options',
        title: 'Formatting Your Notes',
        content: 'Our rich text editor supports:\n• **Headers** (H1, H2, H3) for structure\n• **Bold**, *italic*, and underlined text\n• Bullet points and numbered lists\n• Code blocks and inline code\n• Tables for organizing data\n• Links to external resources\n• Images and media embedding',
        sort_order: 2
      },
      {
        id: 'manual-organization',
        title: 'Organization Tips',
        content: '• Use clear, descriptive titles\n• Add relevant tags for easy searching\n• Pin important notes to the top\n• Use subjects to group related notes\n• Break long notes into sections with headers',
        sort_order: 3
      }
    ],
    quickTips: [
      'Use Ctrl+S (Cmd+S on Mac) to save your notes quickly',
      'Add tags while creating to organize better',
      'Use headers to structure long notes'
    ],
    tags: ['notes', 'creation', 'manual', 'formatting'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-import-pdf',
    title: 'How to Import PDF Documents',
    description: 'Convert PDF documents into editable notes with automatic text extraction',
    category: 'notes',
    context: ['note-creation', 'import'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'pdf-import-process',
        title: 'Importing PDF Files',
        content: '1. **Click Import**: Select "Import from PDF" in the note creation menu\n2. **Upload File**: Choose your PDF file (max 50MB)\n3. **Select Pages**: Choose which pages to import (optional)\n4. **AI Processing**: Our AI extracts and formats the text\n5. **Review & Edit**: Check the imported content and make adjustments',
        sort_order: 1
      },
      {
        id: 'pdf-optimization-tips',
        title: 'Best Results Tips',
        content: '• Use clear, high-quality PDFs for better text extraction\n• Scanned documents work but may need more editing\n• Tables and complex layouts may require manual formatting\n• Images are preserved but may need repositioning\n• Mathematical formulas are converted to text',
        sort_order: 2
      }
    ],
    quickTips: [
      'PDFs with selectable text work better than scanned images',
      'Check the extracted content for formatting issues',
      'Use AI enhancement after import to improve structure'
    ],
    tags: ['notes', 'import', 'pdf', 'documents'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-import-handwritten',
    title: 'How to Import Handwritten Notes',
    description: 'Convert handwritten notes to digital text using OCR technology',
    category: 'notes',
    context: ['note-creation', 'import'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'handwritten-capture',
        title: 'Capturing Handwritten Notes',
        content: '1. **Take Clear Photos**: Use good lighting and steady hands\n2. **Upload Images**: Select "Import Handwritten" and upload your photos\n3. **OCR Processing**: Our AI converts handwriting to text\n4. **Review Results**: Check accuracy and make corrections\n5. **Enhance**: Use AI to improve structure and formatting',
        sort_order: 1
      },
      {
        id: 'handwritten-best-practices',
        title: 'Tips for Better OCR Results',
        content: '• Write clearly with good contrast (dark pen on light paper)\n• Avoid shadows and glare when photographing\n• Capture one page at a time for better accuracy\n• Ensure text is not at an angle or distorted\n• Clean, organized handwriting works best',
        sort_order: 2
      }
    ],
    quickTips: [
      'Good lighting is crucial for accurate text recognition',
      'Review OCR results carefully as handwriting recognition varies',
      'Use AI enhancement to clean up converted text'
    ],
    tags: ['notes', 'import', 'handwritten', 'ocr'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-import-google-docs',
    title: 'How to Import from Google Docs',
    description: 'Seamlessly import your Google Docs while preserving formatting and structure',
    category: 'notes',
    context: ['note-creation', 'import'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'google-docs-connection',
        title: 'Connecting Google Docs',
        content: '1. **Authorize Access**: Click "Import from Google Docs" and sign in\n2. **Grant Permissions**: Allow StudyFlow to access your documents\n3. **Browse Documents**: Select from your Google Drive files\n4. **Choose Import Options**: Decide what to include (comments, images, etc.)\n5. **Import & Convert**: Your document is converted to our format',
        sort_order: 1
      },
      {
        id: 'google-docs-formatting',
        title: 'What Gets Imported',
        content: '**Preserved Elements:**\n• Text formatting (bold, italic, underline)\n• Headers and structure\n• Lists and numbering\n• Tables and basic layouts\n• Images and embedded media\n\n**May Need Adjustment:**\n• Complex formatting and styles\n• Comments and suggestions\n• Advanced table features',
        sort_order: 2
      }
    ],
    quickTips: [
      'Make sure your Google Doc is not in suggestion mode',
      'Complex formatting may need manual adjustment',
      'Images import but may need repositioning'
    ],
    tags: ['notes', 'import', 'google-docs', 'integration'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-import-onenote',
    title: 'How to Import from Microsoft OneNote',
    description: 'Transfer your OneNote pages and sections into StudyFlow notes',
    category: 'notes',
    context: ['note-creation', 'import'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'onenote-export-process',
        title: 'Exporting from OneNote',
        content: '**Method 1: Export to PDF**\n1. Open OneNote and select your page/section\n2. Go to File → Export → PDF\n3. Import the PDF using our PDF import feature\n\n**Method 2: Copy & Paste**\n1. Select content in OneNote\n2. Copy (Ctrl+C)\n3. Paste into a new StudyFlow note\n4. Format as needed',
        sort_order: 1
      },
      {
        id: 'onenote-formatting-notes',
        title: 'Formatting Considerations',
        content: '• OneNote\'s freeform layout may need restructuring\n• Handwritten content requires OCR processing\n• Audio and video attachments need separate handling\n• Tags and categories can be recreated in StudyFlow\n• Drawing and sketches export as images',
        sort_order: 2
      }
    ],
    quickTips: [
      'Export complex OneNote pages as PDF for better results',
      'Use copy-paste for simple text content',
      'Recreate OneNote tags using our tagging system'
    ],
    tags: ['notes', 'import', 'onenote', 'microsoft'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-youtube-conversion',
    title: 'How to Convert YouTube Videos to Notes',
    description: 'Transform YouTube videos into structured, searchable notes automatically',
    category: 'notes',
    context: ['note-creation', 'import'],
    priority: 3,
    show_video: false,
    sections: [
      {
        id: 'youtube-import-process',
        title: 'Converting YouTube Videos',
        content: '1. **Copy Video URL**: Get the YouTube video link\n2. **Select Video Import**: Choose "Import from YouTube" in note creation\n3. **Paste URL**: Enter the video URL\n4. **AI Processing**: Our AI extracts transcript and key points\n5. **Review & Edit**: Check the generated notes and enhance as needed',
        sort_order: 1
      },
      {
        id: 'youtube-content-extraction',
        title: 'What Gets Extracted',
        content: '• **Transcript**: Full video transcript with timestamps\n• **Key Points**: Important concepts and topics\n• **Chapter Breakdown**: Video sections and topics\n• **Summary**: Concise overview of main ideas\n• **Actionable Items**: Tasks or next steps mentioned',
        sort_order: 2
      },
      {
        id: 'youtube-enhancement-options',
        title: 'Enhancement Options',
        content: 'After import, you can:\n• Generate flashcards from key concepts\n• Create quizzes from the content\n• Add personal notes and insights\n• Link to related study materials\n• Set study reminders for review',
        sort_order: 3
      }
    ],
    quickTips: [
      'Educational videos work better than entertainment content',
      'Videos with good audio quality produce better transcripts',
      'Use AI enhancement to structure the imported content'
    ],
    tags: ['notes', 'import', 'youtube', 'video', 'transcript'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-ai-enhancement',
    title: 'How to Enhance Notes with AI',
    description: 'Improve your notes using AI-powered features for better learning outcomes',
    category: 'notes',
    context: ['note-editing', 'note-enhancement'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'enhancement-overview',
        title: 'AI Enhancement Features',
        content: 'StudyFlow offers several AI enhancement options:\n• **Enhance Note**: Overall improvement of structure and clarity\n• **Generate Summary**: Concise overview of key points\n• **Extract Key Points**: Bullet-point highlights\n• **Create Top 10 Questions**: Study questions from content\n• **Improve Formatting**: Better structure and readability',
        sort_order: 1
      },
      {
        id: 'enhancement-process',
        title: 'How to Enhance Your Notes',
        content: '1. **Open Your Note**: Navigate to the note you want to enhance\n2. **Click Enhancement**: Select the AI enhancement button\n3. **Choose Feature**: Pick the enhancement type you need\n4. **Review Results**: Check the AI-generated improvements\n5. **Accept or Modify**: Keep changes or make adjustments',
        sort_order: 2
      },
      {
        id: 'enhancement-tips',
        title: 'Getting Best Results',
        content: '• Start with well-organized, complete content\n• Use specific subjects for context-aware enhancements\n• Review AI suggestions before accepting all changes\n• Combine multiple enhancement types for comprehensive improvement\n• Keep your original content as backup if needed',
        sort_order: 3
      }
    ],
    quickTips: [
      'AI enhancements work better with substantial content',
      'Try different enhancement types for various perspectives',
      'Use enhancements to create study materials from notes'
    ],
    tags: ['notes', 'ai', 'enhancement', 'improvement'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-enhancement-differences',
    title: 'Understanding Enhancement Types',
    description: 'Learn the differences between various AI enhancement features and when to use each',
    category: 'notes',
    context: ['note-enhancement', 'ai-features'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'enhance-note-feature',
        title: 'Enhance Note',
        content: '**Purpose**: Overall improvement of note quality and structure\n\n**What it does**:\n• Improves grammar and clarity\n• Reorganizes content for better flow\n• Adds missing context and explanations\n• Standardizes formatting\n• Enhances readability\n\n**Best for**: Rough drafts, imported content, unstructured notes',
        sort_order: 1
      },
      {
        id: 'summary-feature',
        title: 'Generate Summary',
        content: '**Purpose**: Creates concise overview of main points\n\n**What it does**:\n• Identifies key concepts and themes\n• Condenses lengthy content\n• Maintains important details\n• Creates structured overview\n• Highlights relationships between ideas\n\n**Best for**: Long notes, research papers, lecture transcripts',
        sort_order: 2
      },
      {
        id: 'key-points-feature',
        title: 'Extract Key Points',
        content: '**Purpose**: Creates bullet-point highlights of essential information\n\n**What it does**:\n• Lists main concepts as bullets\n• Removes redundant information\n• Organizes by importance\n• Creates scannable format\n• Preserves critical details\n\n**Best for**: Quick review materials, study guides, exam prep',
        sort_order: 3
      },
      {
        id: 'questions-feature',
        title: 'Top 10 Questions',
        content: '**Purpose**: Generates study questions from note content\n\n**What it does**:\n• Creates relevant study questions\n• Covers main topics comprehensively\n• Varies question difficulty\n• Tests understanding and recall\n• Includes thought-provoking queries\n\n**Best for**: Test preparation, self-assessment, active recall practice',
        sort_order: 4
      },
      {
        id: 'formatting-feature',
        title: 'Improve Formatting',
        content: '**Purpose**: Enhances visual structure and organization\n\n**What it does**:\n• Adds proper headers and subheaders\n• Creates consistent formatting\n• Improves visual hierarchy\n• Adds appropriate emphasis\n• Organizes content logically\n\n**Best for**: Presentation-ready notes, study materials, shared content',
        sort_order: 5
      }
    ],
    quickTips: [
      'Use "Enhance Note" for comprehensive improvement',
      'Try "Key Points" for quick study references',
      'Generate questions to test your understanding'
    ],
    tags: ['notes', 'ai', 'enhancement', 'features', 'comparison'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-chat-feature',
    title: 'How to Chat with Your Notes',
    description: 'Ask questions and get answers directly from your note content using AI chat',
    category: 'notes',
    context: ['note-study', 'ai-chat'],
    priority: 3,
    show_video: false,
    sections: [
      {
        id: 'chat-overview',
        title: 'What is Note Chat?',
        content: 'Note Chat allows you to have conversations with your notes using AI. You can ask questions about the content, request clarifications, get examples, or explore topics in more depth. The AI uses your note content as the knowledge base for accurate, contextual responses.',
        sort_order: 1
      },
      {
        id: 'chat-usage',
        title: 'How to Use Note Chat',
        content: '1. **Open Your Note**: Navigate to any note with substantial content\n2. **Click Chat Icon**: Look for the chat bubble in the note interface\n3. **Ask Questions**: Type questions about the note content\n4. **Get Answers**: Receive AI responses based on your notes\n5. **Continue Conversation**: Ask follow-up questions or dive deeper',
        sort_order: 2
      },
      {
        id: 'chat-question-types',
        title: 'Effective Questions to Ask',
        content: '**Understanding Questions:**\n• "Explain this concept in simpler terms"\n• "What are the key differences between X and Y?"\n• "How does this relate to previous topics?"\n\n**Application Questions:**\n• "Give me an example of this concept"\n• "How would I apply this in real life?"\n• "What are the practical implications?"\n\n**Study Questions:**\n• "Quiz me on this topic"\n• "What should I focus on for the exam?"\n• "Create practice problems for me"',
        sort_order: 3
      }
    ],
    quickTips: [
      'Be specific in your questions for better responses',
      'Use chat to clarify confusing concepts',
      'Ask for examples and real-world applications'
    ],
    tags: ['notes', 'chat', 'ai', 'questions', 'study'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-conversion-flashcards',
    title: 'How to Convert Notes to Flashcards',
    description: 'Transform your notes into effective flashcards for spaced repetition learning',
    category: 'notes',
    context: ['note-study', 'flashcard-creation'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'flashcard-conversion-process',
        title: 'Converting Notes to Flashcards',
        content: '1. **Open Your Note**: Navigate to the note you want to convert\n2. **Click Convert**: Select "Create Flashcards" from the note menu\n3. **AI Analysis**: Our AI identifies key concepts and facts\n4. **Review Suggestions**: Check the generated flashcard pairs\n5. **Customize**: Edit, add, or remove flashcards as needed\n6. **Create Set**: Save as a new flashcard set for study',
        sort_order: 1
      },
      {
        id: 'flashcard-types-created',
        title: 'Types of Flashcards Created',
        content: '**Definition Cards**: Term → Definition pairs\n**Concept Cards**: Question → Explanation pairs\n**Example Cards**: Concept → Real-world example\n**Process Cards**: Step → Description pairs\n**Fact Cards**: Question → Factual answer\n**Application Cards**: Scenario → Solution pairs',
        sort_order: 2
      },
      {
        id: 'flashcard-optimization-tips',
        title: 'Optimizing Your Flashcards',
        content: '• Review AI-generated cards for accuracy\n• Edit questions to be more specific\n• Add personal examples or mnemonics\n• Include images where helpful\n• Keep answers concise but complete\n• Group related cards into logical sets',
        sort_order: 3
      }
    ],
    quickTips: [
      'Well-structured notes create better flashcards',
      'Edit AI suggestions to match your learning style',
      'Create multiple flashcard sets from long notes'
    ],
    tags: ['notes', 'flashcards', 'conversion', 'study'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notes-conversion-quiz',
    title: 'How to Convert Notes to Quizzes',
    description: 'Generate comprehensive quizzes from your note content for self-assessment',
    category: 'notes',
    context: ['note-study', 'quiz-creation'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'quiz-conversion-process',
        title: 'Creating Quizzes from Notes',
        content: '1. **Select Your Note**: Choose a note with comprehensive content\n2. **Click Generate Quiz**: Select "Create Quiz" from the note options\n3. **Set Parameters**: Choose number of questions and difficulty\n4. **AI Generation**: Our AI creates varied question types\n5. **Review Questions**: Check questions and answers for accuracy\n6. **Publish Quiz**: Save for immediate use or future study sessions',
        sort_order: 1
      },
      {
        id: 'quiz-question-types',
        title: 'Question Types Generated',
        content: '**Multiple Choice**: 4-option questions testing recall and understanding\n**True/False**: Binary questions for quick fact checking\n**Fill-in-the-Blank**: Completion questions for key terms\n**Short Answer**: Open-ended questions requiring explanation\n**Matching**: Pairing related concepts or terms\n**Ordering**: Sequencing steps or chronological events',
        sort_order: 2
      },
      {
        id: 'quiz-customization',
        title: 'Customizing Your Quiz',
        content: '• Adjust difficulty levels for different learning stages\n• Mix question types for comprehensive assessment\n• Add time limits for exam-like practice\n• Include explanations for wrong answers\n• Create multiple versions for repeated practice\n• Set up automatic grading and feedback',
        sort_order: 3
      }
    ],
    quickTips: [
      'Longer, detailed notes generate better quizzes',
      'Review all questions before taking the quiz',
      'Use quizzes to identify knowledge gaps'
    ],
    tags: ['notes', 'quiz', 'conversion', 'assessment'],
    lastUpdated: '2024-01-15'
  },

  // ============= FLASHCARDS CATEGORY =============
  {
    id: 'flashcards-create-manual',
    title: 'How to Create Flashcards Manually',
    description: 'Learn to create effective flashcards from scratch with proven techniques',
    category: 'flashcards',
    context: ['flashcard-creation', 'flashcards-list'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'flashcard-creation-basics',
        title: 'Creating Your First Flashcard Set',
        content: '1. **Start New Set**: Click "Create Flashcard Set" from the flashcards page\n2. **Name Your Set**: Choose a descriptive name and subject\n3. **Add Description**: Include context about what the set covers\n4. **Create First Card**: Add your first question and answer pair\n5. **Continue Adding**: Build your set with related cards',
        sort_order: 1
      },
      {
        id: 'flashcard-best-practices',
        title: 'Effective Flashcard Design',
        content: '**Keep It Simple**:\n• One concept per card\n• Clear, concise questions\n• Direct, specific answers\n\n**Use Active Recall**:\n• Test understanding, not recognition\n• Ask "why" and "how" questions\n• Include application scenarios\n\n**Format Consistently**:\n• Use similar structure across cards\n• Include context when needed\n• Add memory aids or mnemonics',
        sort_order: 2
      },
      {
        id: 'flashcard-content-tips',
        title: 'Content Creation Tips',
        content: '• Use your own words for better retention\n• Include examples and counter-examples\n• Add images or diagrams when helpful\n• Create bidirectional cards (A→B and B→A)\n• Break complex concepts into multiple cards\n• Review and refine based on study results',
        sort_order: 3
      }
    ],
    quickTips: [
      'Start with 10-15 cards per set for manageable study sessions',
      'Test yourself as you create to ensure card quality',
      'Use consistent formatting for easier studying'
    ],
    tags: ['flashcards', 'creation', 'manual', 'study'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'flashcards-ai-generation',
    title: 'How to Generate Flashcards with AI',
    description: 'Use AI to automatically create flashcards from text, notes, or topics',
    category: 'flashcards',
    context: ['flashcard-creation', 'ai-chat'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'ai-generation-methods',
        title: 'AI Generation Options',
        content: '**From Existing Notes**:\n1. Select any note with good content\n2. Click "Generate Flashcards"\n3. Choose number of cards to create\n4. Review and customize generated cards\n\n**From Text Input**:\n1. Choose "AI Generate" when creating a set\n2. Paste or type your source material\n3. Specify focus areas or learning objectives\n4. Let AI create targeted flashcards\n\n**From Topics**:\n1. Enter a topic or subject area\n2. Specify difficulty level and scope\n3. AI generates comprehensive card set\n4. Review and enhance as needed',
        sort_order: 1
      },
      {
        id: 'ai-customization-options',
        title: 'Customizing AI Generation',
        content: '**Difficulty Levels**:\n• Beginner: Basic facts and definitions\n• Intermediate: Concepts and applications\n• Advanced: Analysis and synthesis questions\n\n**Focus Areas**:\n• Definitions and terminology\n• Processes and procedures\n• Examples and applications\n• Relationships and comparisons\n• Problem-solving scenarios',
        sort_order: 2
      },
      {
        id: 'ai-review-process',
        title: 'Reviewing AI-Generated Cards',
        content: '• Check accuracy of facts and definitions\n• Ensure questions are clear and unambiguous\n• Verify answers are complete but concise\n• Add personal context or examples\n• Remove duplicates or low-quality cards\n• Reorganize cards by difficulty or topic',
        sort_order: 3
      }
    ],
    quickTips: [
      'AI works better with clear, well-structured source material',
      'Always review and edit AI-generated cards',
      'Combine AI generation with manual refinement'
    ],
    tags: ['flashcards', 'ai', 'generation', 'automation'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'flashcards-spaced-repetition',
    title: 'Understanding Spaced Repetition',
    description: 'Master the science-backed study method for long-term retention',
    category: 'flashcards',
    context: ['flashcard-study'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'spaced-repetition-science',
        title: 'The Science Behind Spaced Repetition',
        content: 'Spaced repetition is based on the "forgetting curve" - the rate at which we lose information over time. By reviewing material at increasing intervals, we strengthen memory pathways and move knowledge from short-term to long-term memory.\n\n**Key Principles**:\n• Review before you forget\n• Increase intervals based on confidence\n• Focus more time on difficult material\n• Regular practice is more effective than cramming',
        sort_order: 1
      },
      {
        id: 'spaced-repetition-system',
        title: 'How Our System Works',
        content: '**Initial Learning**: New cards appear frequently until you know them\n\n**Graduated Intervals**: Successfully answered cards appear:\n• 1 day later\n• 3 days later  \n• 1 week later\n• 2 weeks later\n• 1 month later\n• And so on...\n\n**Difficulty Adjustment**: Wrong answers reset the interval, bringing cards back sooner',
        sort_order: 2
      },
      {
        id: 'spaced-repetition-optimization',
        title: 'Optimizing Your Study Sessions',
        content: '• Study daily for consistent reinforcement\n• Complete all due cards in each session\n• Be honest with your confidence ratings\n• Don\'t skip difficult cards - they need more review\n• Aim for 80-90% accuracy for optimal learning\n• Regular short sessions beat long cramming sessions',
        sort_order: 3
      }
    ],
    quickTips: [
      'Consistency is more important than session length',
      'Trust the system - it gets easier over time',
      'Review stats show your long-term progress'
    ],
    tags: ['flashcards', 'spaced-repetition', 'memory', 'science'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'flashcards-study-strategies',
    title: 'Effective Flashcard Study Strategies',
    description: 'Advanced techniques to maximize your flashcard study effectiveness',
    category: 'flashcards',
    context: ['flashcard-study'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'study-session-structure',
        title: 'Structuring Study Sessions',
        content: '**Before Studying**:\n• Review your study goals\n• Check which cards are due\n• Set a realistic time limit\n• Eliminate distractions\n\n**During Study**:\n• Focus on one card at a time\n• Think before revealing the answer\n• Rate your confidence honestly\n• Take notes on persistent mistakes\n\n**After Study**:\n• Review missed cards briefly\n• Track your progress and patterns\n• Plan your next session',
        sort_order: 1
      },
      {
        id: 'active-recall-techniques',
        title: 'Active Recall Techniques',
        content: '**Elaborative Interrogation**:\n• Ask "why" and "how" for each answer\n• Connect new information to existing knowledge\n• Create mental associations and examples\n\n**Self-Testing Strategies**:\n• Cover the answer and actively recall\n• Explain concepts out loud\n• Write answers before checking\n• Use the "feynman technique" - teach it simply\n\n**Metacognitive Awareness**:\n• Monitor your understanding level\n• Identify knowledge gaps quickly\n• Adjust study strategies based on performance',
        sort_order: 2
      },
      {
        id: 'difficulty-management',
        title: 'Managing Difficult Cards',
        content: '**For Consistently Missed Cards**:\n• Break complex cards into simpler parts\n• Add memory aids or mnemonics\n• Create related cards for context\n• Use visual associations or images\n• Practice with different phrasings\n\n**Progressive Difficulty**:\n• Start with easier cards to build confidence\n• Gradually introduce more challenging material\n• Mix review cards with new learning\n• Use success momentum for harder concepts',
        sort_order: 3
      }
    ],
    quickTips: [
      'Quality of attention matters more than time spent',
      'Mistakes are learning opportunities, not failures',
      'Adjust card difficulty based on your performance'
    ],
    tags: ['flashcards', 'study', 'strategies', 'active-recall'],
    lastUpdated: '2024-01-15'
  },

  // ============= QUIZ CATEGORY =============
  {
    id: 'quiz-create-manual',
    title: 'How to Create Quizzes Manually',
    description: 'Build effective quizzes from scratch with various question types',
    category: 'quiz',
    context: ['quiz-creation', 'quiz-list'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'quiz-creation-basics',
        title: 'Creating Your First Quiz',
        content: '1. **Start New Quiz**: Click "Create Quiz" from the quiz section\n2. **Add Title & Description**: Name your quiz and describe its purpose\n3. **Choose Subject**: Select the relevant academic subject\n4. **Add Questions**: Start building your question set\n5. **Set Parameters**: Configure time limits, attempts, and grading\n6. **Preview & Publish**: Test your quiz before sharing',
        sort_order: 1
      },
      {
        id: 'question-types-available',
        title: 'Available Question Types',
        content: '**Multiple Choice**:\n• 2-6 answer options\n• One correct answer\n• Good for testing recall and recognition\n\n**True/False**:\n• Binary choice questions\n• Quick to answer and grade\n• Effective for fact verification\n\n**Fill in the Blank**:\n• Complete the missing information\n• Tests specific knowledge\n• Can have multiple correct answers\n\n**Short Answer**:\n• Brief written responses\n• Tests understanding and application\n• Requires manual grading\n\n**Essay Questions**:\n• Extended written responses\n• Tests analysis and synthesis\n• Comprehensive understanding assessment',
        sort_order: 2
      },
      {
        id: 'quiz-design-best-practices',
        title: 'Quiz Design Best Practices',
        content: '**Question Writing**:\n• Use clear, unambiguous language\n• Avoid trick questions or gotchas\n• Test important concepts, not trivia\n• Include various difficulty levels\n• Provide meaningful distractors in multiple choice\n\n**Quiz Structure**:\n• Start with easier questions\n• Group similar question types\n• Balance different cognitive levels\n• Include 10-25 questions for optimal length\n• End with application or synthesis questions',
        sort_order: 3
      }
    ],
    quickTips: [
      'Test your own quiz before publishing',
      'Mix question types for comprehensive assessment',
      'Include explanations for wrong answers'
    ],
    tags: ['quiz', 'creation', 'manual', 'assessment'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'quiz-ai-generation',
    title: 'How to Generate Quizzes with AI',
    description: 'Use AI to automatically create comprehensive quizzes from your study materials',
    category: 'quiz',
    context: ['quiz-creation', 'ai-chat'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'ai-quiz-generation-process',
        title: 'AI Quiz Generation Process',
        content: '**From Notes**:\n1. Select a note with substantial content\n2. Choose "Generate Quiz" from note options\n3. Specify number of questions and difficulty\n4. AI analyzes content and creates varied questions\n5. Review and customize generated quiz\n\n**From Topics**:\n1. Enter subject area and specific topics\n2. Set learning objectives and difficulty level\n3. Choose question types and format preferences\n4. AI generates comprehensive quiz\n5. Edit and enhance as needed',
        sort_order: 1
      },
      {
        id: 'ai-customization-options',
        title: 'AI Generation Options',
        content: '**Question Parameters**:\n• Number of questions (5-50)\n• Difficulty level (Beginner/Intermediate/Advanced)\n• Question type distribution\n• Time limit recommendations\n\n**Content Focus**:\n• Key concepts and definitions\n• Practical applications\n• Problem-solving scenarios\n• Critical thinking questions\n• Fact recall and recognition\n\n**Assessment Style**:\n• Formative (learning-focused)\n• Summative (evaluation-focused)\n• Diagnostic (knowledge gaps)\n• Practice (skill building)',
        sort_order: 2
      },
      {
        id: 'ai-quiz-enhancement',
        title: 'Enhancing AI-Generated Quizzes',
        content: '**Quality Review**:\n• Verify factual accuracy\n• Check question clarity\n• Ensure answer completeness\n• Remove ambiguous items\n\n**Personalization**:\n• Add your own questions\n• Include specific examples from your notes\n• Adjust to your learning goals\n• Incorporate class-specific content\n\n**Optimization**:\n• Balance question difficulty\n• Add explanatory feedback\n• Include multimedia elements\n• Set appropriate time limits',
        sort_order: 3
      }
    ],
    quickTips: [
      'AI works best with comprehensive, well-structured content',
      'Always review generated questions for accuracy',
      'Combine AI generation with personal customization'
    ],
    tags: ['quiz', 'ai', 'generation', 'automation'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'quiz-taking-strategies',
    title: 'Effective Quiz-Taking Strategies',
    description: 'Master techniques for taking quizzes effectively and learning from results',
    category: 'quiz',
    context: ['quiz-taking'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'pre-quiz-preparation',
        title: 'Before Taking a Quiz',
        content: '**Review Strategy**:\n• Quickly scan all questions first\n• Note time limits and question types\n• Identify areas of confidence and uncertainty\n• Plan your time allocation\n\n**Mental Preparation**:\n• Find a quiet, distraction-free environment\n• Gather any allowed materials\n• Take a few deep breaths to reduce anxiety\n• Set realistic expectations for performance\n\n**Technical Setup**:\n• Ensure stable internet connection\n• Close unnecessary browser tabs\n• Have backup devices ready if needed\n• Save frequently if allowed',
        sort_order: 1
      },
      {
        id: 'during-quiz-techniques',
        title: 'During the Quiz',
        content: '**Question Approach**:\n• Read each question carefully and completely\n• Identify key words and requirements\n• Eliminate obviously wrong answers first\n• Use process of elimination for multiple choice\n• Answer easier questions first to build confidence\n\n**Time Management**:\n• Monitor time regularly\n• Don\'t spend too long on any single question\n• Mark uncertain answers for review\n• Leave time for final review\n• Submit before the deadline\n\n**Stress Management**:\n• Take brief pauses between sections\n• Use positive self-talk\n• Focus on what you know, not what you don\'t\n• Remember that one quiz doesn\'t define your knowledge',
        sort_order: 2
      },
      {
        id: 'post-quiz-learning',
        title: 'Learning from Quiz Results',
        content: '**Immediate Review**:\n• Review incorrect answers carefully\n• Understand why the correct answer is right\n• Identify patterns in mistakes\n• Note topics that need more study\n\n**Analysis and Improvement**:\n• Track performance over time\n• Identify weak knowledge areas\n• Adjust study methods based on results\n• Create focused review materials\n• Set specific goals for improvement\n\n**Follow-up Actions**:\n• Return to source materials for missed topics\n• Create flashcards for problem areas\n• Discuss difficult concepts with peers or instructors\n• Schedule targeted review sessions\n• Retake quizzes after additional study',
        sort_order: 3
      }
    ],
    quickTips: [
      'Read questions twice - once for understanding, once for details',
      'Trust your first instinct unless you have good reason to change',
      'Use quiz results as a study guide for future learning'
    ],
    tags: ['quiz', 'taking', 'strategies', 'test-taking'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'quiz-analysis-improvement',
    title: 'Quiz Performance Analysis & Improvement',
    description: 'Learn to analyze quiz results and use insights to improve your study methods',
    category: 'quiz',
    context: ['quiz-results', 'analytics'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'performance-metrics',
        title: 'Understanding Your Results',
        content: '**Key Metrics to Track**:\n• Overall score percentage\n• Time spent per question\n• Accuracy by question type\n• Performance trends over time\n• Comparison to previous attempts\n\n**Detailed Analysis**:\n• Which topics you consistently miss\n• Question types that challenge you most\n• Time management patterns\n• Confidence vs. actual performance\n• Common mistake patterns',
        sort_order: 1
      },
      {
        id: 'identifying-knowledge-gaps',
        title: 'Identifying Knowledge Gaps',
        content: '**Question-Level Analysis**:\n• Review each incorrect answer\n• Categorize mistakes by type (careless, knowledge gap, misunderstanding)\n• Identify underlying concept issues\n• Note questions answered correctly by guessing\n\n**Topic-Level Analysis**:\n• Group questions by subject area\n• Calculate accuracy rates per topic\n• Identify consistently weak areas\n• Find topics needing review vs. reinforcement\n\n**Skill-Level Analysis**:\n• Separate recall vs. application questions\n• Assess critical thinking performance\n• Evaluate time management skills\n• Review test-taking strategy effectiveness',
        sort_order: 2
      },
      {
        id: 'improvement-strategies',
        title: 'Creating Improvement Plans',
        content: '**Targeted Study Plans**:\n• Prioritize topics with lowest scores\n• Allocate more time to challenging areas\n• Use different study methods for different topics\n• Set specific improvement goals\n\n**Study Method Adjustments**:\n• Switch from passive to active learning\n• Increase practice question frequency\n• Focus on application rather than memorization\n• Seek additional resources for difficult topics\n\n**Progress Tracking**:\n• Retake quizzes periodically\n• Monitor improvement trends\n• Celebrate progress milestones\n• Adjust strategies based on results\n• Keep a learning journal',
        sort_order: 3
      }
    ],
    quickTips: [
      'Focus on understanding mistakes, not just correct answers',
      'Track patterns over time, not just individual quiz scores',
      'Use quiz analytics to guide future study priorities'
    ],
    tags: ['quiz', 'analysis', 'improvement', 'performance'],
    lastUpdated: '2024-01-15'
  },

  // ============= STUDY SESSIONS CATEGORY =============
  {
    id: 'study-sessions-overview',
    title: 'Understanding Study Sessions',
    description: 'Learn about different study session types and how to maximize their effectiveness',
    category: 'study-sessions',
    context: ['study-session', 'dashboard'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'session-types-overview',
        title: 'Types of Study Sessions',
        content: '**Focused Study**: Deep dive into specific topics with concentrated effort\n\n**Review Sessions**: Reinforcement of previously learned material\n\n**Practice Sessions**: Application of knowledge through exercises and problems\n\n**Assessment Sessions**: Self-testing to gauge understanding\n\n**Mixed Sessions**: Combination of different activities for comprehensive learning',
        sort_order: 1
      },
      {
        id: 'session-planning',
        title: 'Planning Effective Sessions',
        content: '• Set clear, specific learning objectives\n• Choose appropriate session length (25-90 minutes)\n• Gather all necessary materials beforehand\n• Eliminate distractions and interruptions\n• Plan breaks for longer sessions\n• Choose optimal time based on your energy levels',
        sort_order: 2
      }
    ],
    quickTips: [
      'Match session type to your learning goals',
      'Track session effectiveness to improve planning',
      'Adjust session length based on topic difficulty'
    ],
    tags: ['study-sessions', 'planning', 'overview'],
    lastUpdated: '2024-01-15'
  },

  // ============= IMPORT-EXPORT CATEGORY =============
  {
    id: 'import-export-overview',
    title: 'Import & Export Overview',
    description: 'Learn about all import and export options available in StudyFlow',
    category: 'import-export',
    context: ['import', 'export'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'import-options',
        title: 'Import Options',
        content: '**Supported Import Formats**:\n• PDF documents\n• Microsoft Word (.docx)\n• Google Docs\n• OneNote pages\n• YouTube videos (transcripts)\n• Plain text files\n• CSV data (for flashcards)\n• Images (with OCR)\n\n**Import Sources**:\n• Local files from your device\n• Cloud storage (Google Drive, OneDrive)\n• Direct URLs\n• Copy and paste content',
        sort_order: 1
      },
      {
        id: 'export-options',
        title: 'Export Options',
        content: '**Export Formats**:\n• PDF for notes and study guides\n• Word documents (.docx)\n• Plain text files\n• CSV for flashcard data\n• Printable study sheets\n• Anki-compatible formats\n\n**Export Destinations**:\n• Download to device\n• Save to cloud storage\n• Email directly\n• Share via links',
        sort_order: 2
      }
    ],
    quickTips: [
      'Check file size limits before importing large documents',
      'Export regularly to backup your study materials',
      'Use appropriate formats for your intended use'
    ],
    tags: ['import', 'export', 'files', 'backup'],
    lastUpdated: '2024-01-15'
  },

  // ============= AI FEATURES CATEGORY =============
  {
    id: 'ai-features-overview',
    title: 'AI Features Overview',
    description: 'Discover all AI-powered features available to enhance your learning',
    category: 'ai-features',
    context: ['ai-chat', 'note-enhancement'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'ai-capabilities',
        title: 'AI Capabilities',
        content: '**Content Enhancement**:\n• Note improvement and formatting\n• Summary generation\n• Key point extraction\n• Question generation\n\n**Content Creation**:\n• Flashcard generation from notes\n• Quiz creation from materials\n• Study plan suggestions\n• Practice problem generation\n\n**Interactive Features**:\n• Chat with your notes\n• Concept explanations\n• Study recommendations\n• Progress insights',
        sort_order: 1
      },
      {
        id: 'ai-best-practices',
        title: 'Getting Best AI Results',
        content: '• Provide clear, well-structured input\n• Use specific prompts and requests\n• Review and refine AI outputs\n• Combine AI suggestions with personal knowledge\n• Iterate and improve based on results',
        sort_order: 2
      }
    ],
    quickTips: [
      'AI enhances but doesn\'t replace your learning process',
      'Experiment with different AI features to find what works',
      'Always verify AI-generated content for accuracy'
    ],
    tags: ['ai', 'features', 'enhancement', 'automation'],
    lastUpdated: '2024-01-15'
  },

  // ============= SETTINGS CATEGORY =============
  {
    id: 'account-information',
    title: 'Account Information Management',
    description: 'Update your personal information and account details',
    category: 'settings',
    context: ['settings'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'personal-info',
        title: 'Personal Information',
        content: '**Profile Details**:\n• Update your display name\n• Change email address\n• Add profile picture\n• Set personal bio or description\n• Update contact information\n\n**Account Status**:\n• View account creation date\n• Check current subscription tier\n• Review usage statistics\n• Monitor account activity',
        sort_order: 1
      },
      {
        id: 'account-verification',
        title: 'Account Verification',
        content: '• Email verification status\n• Phone number verification\n• Two-factor authentication setup\n• Account recovery options\n• Security question management',
        sort_order: 2
      }
    ],
    quickTips: [
      'Keep your email address current for important notifications',
      'Add a profile picture to personalize your account',
      'Verify your email to ensure account security'
    ],
    tags: ['settings', 'account', 'profile', 'verification'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'subjects-management',
    title: 'Adding and Deleting Subjects',
    description: 'Organize your studies by managing subject categories',
    category: 'settings',
    context: ['settings', 'notes-list'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'adding-subjects',
        title: 'Adding New Subjects',
        content: '**Creating Subjects**:\n• Go to Settings > Subjects\n• Click "Add New Subject"\n• Enter subject name and description\n• Choose a color theme\n• Set subject-specific preferences\n\n**Subject Organization**:\n• Use clear, descriptive names\n• Group related topics together\n• Set up hierarchical structures if needed\n• Apply consistent naming conventions',
        sort_order: 1
      },
      {
        id: 'deleting-subjects',
        title: 'Removing Subjects',
        content: '**Safe Deletion Process**:\n• Review all content in the subject first\n• Move important notes to other subjects\n• Export data if needed for backup\n• Confirm deletion in settings\n• Content will be archived, not permanently deleted\n\n**Bulk Operations**:\n• Select multiple subjects\n• Merge subjects together\n• Reorganize subject hierarchies',
        sort_order: 2
      }
    ],
    quickTips: [
      'Review content before deleting subjects',
      'Use descriptive names for better organization',
      'Color-code subjects for quick visual identification'
    ],
    tags: ['settings', 'subjects', 'organization', 'management'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'subscription-management',
    title: 'Subscription Management',
    description: 'Manage your subscription plan, billing, and payment methods',
    category: 'settings',
    context: ['settings'],
    priority: 3,
    show_video: false,
    sections: [
      {
        id: 'plan-overview',
        title: 'Current Subscription Plan',
        content: '**Plan Information**:\n• Current tier (Scholar, Graduate, Master, Dean)\n• Subscription start and renewal dates\n• Features included in your plan\n• Usage limits and current usage\n• Next billing date and amount\n\n**Plan Comparison**:\n• View features of all tiers\n• Calculate potential savings\n• Understand upgrade benefits\n• Preview downgrade limitations',
        sort_order: 1
      },
      {
        id: 'payment-management',
        title: 'Payment Methods and Billing',
        content: '**Payment Options**:\n• Add or update credit cards\n• Set up PayPal payments\n• Configure automatic renewals\n• Download billing receipts\n• Update billing address\n\n**Billing History**:\n• View past transactions\n• Download invoices\n• Track payment status\n• Handle failed payments',
        sort_order: 2
      },
      {
        id: 'plan-changes',
        title: 'Upgrading or Downgrading',
        content: '**Upgrade Process**:\n• Select new tier from settings\n• Preview feature changes\n• Confirm upgrade and billing\n• Access new features immediately\n\n**Downgrade Process**:\n• Review feature limitations\n• Export data if needed\n• Confirm downgrade\n• Changes effective next billing cycle\n\n**Cancellation**:\n• Cancel anytime from settings\n• Access continues until period end\n• Data remains available for 30 days',
        sort_order: 3
      }
    ],
    quickTips: [
      'Upgrade anytime for immediate access to new features',
      'Downgrades take effect at the next billing cycle',
      'Export important data before canceling'
    ],
    tags: ['settings', 'subscription', 'billing', 'payment'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'notifications-management',
    title: 'Notifications Management',
    description: 'Control how and when you receive notifications',
    category: 'settings',
    context: ['settings', 'reminders'],
    priority: 4,
    show_video: false,
    sections: [
      {
        id: 'notification-types',
        title: 'Notification Categories',
        content: '**Study Reminders**:\n• Daily study session notifications\n• Spaced repetition alerts\n• Goal deadline reminders\n• Streak maintenance notifications\n\n**Progress Updates**:\n• Achievement notifications\n• Weekly progress summaries\n• Milestone celebrations\n• Performance insights\n\n**Account Notifications**:\n• Security alerts\n• Billing and subscription updates\n• Feature announcements\n• System maintenance notices',
        sort_order: 1
      },
      {
        id: 'delivery-methods',
        title: 'Notification Delivery',
        content: '**Delivery Options**:\n• In-app notifications\n• Email notifications\n• Push notifications (mobile)\n• Browser notifications\n\n**Timing Controls**:\n• Set quiet hours (no notifications)\n• Configure frequency limits\n• Set timezone for accurate timing\n• Schedule notification summaries',
        sort_order: 2
      },
      {
        id: 'customization',
        title: 'Notification Customization',
        content: '• Choose notification sounds\n• Set different tones for different types\n• Customize notification text\n• Set priority levels\n• Configure do-not-disturb periods\n• Create custom notification rules',
        sort_order: 3
      }
    ],
    quickTips: [
      'Set quiet hours to avoid interruptions during sleep',
      'Customize notification frequency to avoid overwhelm',
      'Enable important notifications like security alerts'
    ],
    tags: ['settings', 'notifications', 'reminders', 'customization'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'study-preferences',
    title: 'Study Preferences',
    description: 'Customize your learning experience and study behavior',
    category: 'settings',
    context: ['settings', 'study-session'],
    priority: 5,
    show_video: false,
    sections: [
      {
        id: 'session-preferences',
        title: 'Study Session Preferences',
        content: '**Default Settings**:\n• Preferred session duration\n• Break interval timing\n• Auto-pause behavior\n• Session goal types\n• Progress tracking preferences\n\n**Focus Mode Options**:\n• Distraction blocking settings\n• Background noise preferences\n• Screen dimming options\n• Notification blocking during sessions',
        sort_order: 1
      },
      {
        id: 'learning-preferences',
        title: 'Learning Method Preferences',
        content: '**Flashcard Settings**:\n• Spaced repetition intervals\n• Difficulty adjustment algorithms\n• Review scheduling preferences\n• Card presentation options\n\n**Quiz Preferences**:\n• Default question types\n• Time limits and pressure settings\n• Feedback timing\n• Retry and review options\n\n**Content Preferences**:\n• Font size and readability\n• Color themes and contrast\n• Layout and spacing options',
        sort_order: 2
      },
      {
        id: 'goal-preferences',
        title: 'Goal and Progress Preferences',
        content: '• Default goal types and durations\n• Progress measurement methods\n• Achievement celebration styles\n• Milestone notification preferences\n• Performance tracking granularity\n• Weekly/monthly review schedules',
        sort_order: 3
      }
    ],
    quickTips: [
      'Adjust settings based on your learning style',
      'Experiment with different session lengths',
      'Enable focus mode for distraction-free studying'
    ],
    tags: ['settings', 'preferences', 'customization', 'learning'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'adaptive-learning',
    title: 'Adaptive Learning Settings',
    description: 'Configure how the system adapts to your learning patterns',
    category: 'settings',
    context: ['settings', 'ai-features'],
    priority: 6,
    show_video: false,
    sections: [
      {
        id: 'adaptation-features',
        title: 'Adaptive Learning Features',
        content: '**Automatic Adjustments**:\n• Difficulty progression based on performance\n• Spaced repetition interval optimization\n• Content recommendation algorithms\n• Study schedule suggestions\n• Personalized learning path creation\n\n**Performance Tracking**:\n• Learning velocity monitoring\n• Retention rate analysis\n• Weakness pattern identification\n• Strength area recognition\n• Progress prediction modeling',
        sort_order: 1
      },
      {
        id: 'customization-controls',
        title: 'Adaptation Customization',
        content: '**Control Settings**:\n• Enable/disable automatic difficulty adjustment\n• Set learning pace preferences (fast, medium, slow)\n• Configure recommendation sensitivity\n• Override system suggestions when needed\n• Set adaptation boundaries and limits\n\n**Manual Overrides**:\n• Force specific difficulty levels\n• Skip suggested content\n• Adjust repetition schedules\n• Modify learning goals\n• Reset adaptation algorithms',
        sort_order: 2
      },
      {
        id: 'privacy-controls',
        title: 'Learning Data Privacy',
        content: '• Control what learning data is collected\n• Manage data sharing preferences\n• Export your learning analytics\n• Delete learning history if desired\n• Opt out of personalization features\n• Review data usage for improvements',
        sort_order: 3
      }
    ],
    quickTips: [
      'Let the system adapt for a few weeks before making manual adjustments',
      'Review adaptation suggestions before accepting them',
      'Use manual overrides when you know your needs better'
    ],
    tags: ['settings', 'adaptive', 'ai', 'personalization'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'password-security',
    title: 'Password and Security Settings',
    description: 'Manage your account security, passwords, and authentication',
    category: 'settings',
    context: ['settings'],
    priority: 7,
    show_video: false,
    sections: [
      {
        id: 'password-management',
        title: 'Password Management',
        content: '**Changing Your Password**:\n• Go to Settings > Security\n• Enter current password for verification\n• Create a strong new password\n• Confirm the password change\n• Log out of other devices if desired\n\n**Password Requirements**:\n• Minimum 8 characters\n• Include uppercase and lowercase letters\n• Add numbers and special characters\n• Avoid common dictionary words\n• Don\'t reuse previous passwords',
        sort_order: 1
      },
      {
        id: 'two-factor-auth',
        title: 'Two-Factor Authentication',
        content: '**Setting Up 2FA**:\n• Enable 2FA in security settings\n• Choose authentication method (app, SMS, email)\n• Scan QR code with authenticator app\n• Enter verification code to confirm\n• Save backup codes securely\n\n**Managing 2FA**:\n• Generate new backup codes\n• Change authentication methods\n• Temporarily disable for account recovery\n• Update phone number for SMS codes',
        sort_order: 2
      },
      {
        id: 'security-features',
        title: 'Advanced Security Features',
        content: '**Account Security**:\n• Review active sessions and devices\n• Monitor login history and locations\n• Set up login alerts for new devices\n• Configure session timeouts\n• Enable account lockout after failed attempts\n\n**Data Security**:\n• Encryption settings for stored data\n• Secure data export options\n• Account deletion and data removal\n• Privacy settings for shared content\n• Third-party app permissions',
        sort_order: 3
      }
    ],
    quickTips: [
      'Use a unique, strong password for your account',
      'Enable two-factor authentication for extra security',
      'Regularly review active sessions and devices'
    ],
    tags: ['settings', 'security', 'password', 'authentication'],
    lastUpdated: '2024-01-15'
  },

  // ============= UPGRADE & BILLING CATEGORY =============
  {
    id: 'upgrade-tiers-comparison',
    title: 'Understanding Subscription Tiers',
    description: 'Compare features across different subscription levels and choose the right tier',
    category: 'upgrade',
    context: ['settings'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'tier-features',
        title: 'Tier Features Comparison',
        content: '**Scholar (Free)**:\n• Basic notes and flashcards\n• Limited AI enhancements (5/month)\n• Basic progress tracking\n• Community support\n\n**Graduate ($9.99/month)**:\n• Unlimited notes and flashcards\n• Increased AI enhancements (50/month)\n• Advanced analytics\n• Priority support\n• Export capabilities\n\n**Master ($19.99/month)**:\n• Everything in Graduate\n• Unlimited AI enhancements\n• Advanced study planning\n• Collaboration features\n• Premium integrations\n\n**Dean ($39.99/month)**:\n• Everything in Master\n• Admin and management tools\n• Institution features\n• Custom branding\n• Dedicated support',
        sort_order: 1
      },
      {
        id: 'upgrade-process',
        title: 'How to Upgrade',
        content: '1. **Go to Settings**: Navigate to account settings\n2. **Select Billing**: Choose the billing section\n3. **Compare Plans**: Review tier features and pricing\n4. **Choose Tier**: Select the plan that fits your needs\n5. **Payment**: Complete secure payment process\n6. **Confirmation**: Receive upgrade confirmation and new features',
        sort_order: 2
      }
    ],
    quickTips: [
      'Start with a lower tier and upgrade as needed',
      'Annual billing offers significant savings',
      'You can downgrade or cancel anytime'
    ],
    tags: ['upgrade', 'billing', 'subscription', 'tiers'],
    lastUpdated: '2024-01-15'
  },

  // ============= PROGRESS & ANALYTICS =============
  {
    id: 'progress-tracking',
    title: 'Understanding Your Progress',
    description: 'Learn to interpret and use your learning analytics for better study outcomes',
    category: 'progress',
    context: ['progress-overview', 'analytics'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'progress-metrics',
        title: 'Key Progress Metrics',
        content: '**Study Consistency**:\n• Daily study streaks\n• Session frequency and duration\n• Goal completion rates\n\n**Learning Effectiveness**:\n• Retention rates for flashcards\n• Quiz performance trends\n• Knowledge gap identification\n\n**Content Mastery**:\n• Topics mastered over time\n• Difficulty progression\n• Subject-wise performance',
        sort_order: 1
      },
      {
        id: 'using-analytics',
        title: 'Using Analytics for Improvement',
        content: '• Identify your most productive study times\n• Track which study methods work best\n• Monitor long-term retention vs. short-term learning\n• Adjust study schedules based on performance data\n• Set realistic goals based on historical progress',
        sort_order: 2
      }
    ],
    quickTips: [
      'Check analytics weekly to identify patterns',
      'Focus on trends rather than daily fluctuations',
      'Use insights to optimize your study schedule'
    ],
    tags: ['progress', 'analytics', 'tracking', 'improvement'],
    lastUpdated: '2024-01-15'
  },

  // ============= GOALS =============
  {
    id: 'goals-setting',
    title: 'Setting and Managing Study Goals',
    description: 'Set, track, and achieve your learning goals effectively',
    category: 'goals',
    context: ['reminders', 'dashboard'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'setting-goals',
        title: 'Setting Effective Study Goals',
        content: '**SMART Goals Framework**:\n• **Specific**: Clear, well-defined objectives\n• **Measurable**: Quantifiable progress indicators\n• **Achievable**: Realistic and attainable\n• **Relevant**: Aligned with your learning needs\n• **Time-bound**: Clear deadlines and milestones\n\n**Goal Types**:\n• Course completion goals\n• Skill development targets\n• Exam preparation milestones\n• Daily/weekly study targets\n• Long-term learning objectives',
        sort_order: 1
      },
      {
        id: 'tracking-goals',
        title: 'Tracking Goal Progress',
        content: '• Monitor daily and weekly progress\n• Use visual progress indicators\n• Set milestone celebrations\n• Adjust timelines when needed\n• Review and reflect on achievements',
        sort_order: 2
      },
      {
        id: 'goal-strategies',
        title: 'Goal Achievement Strategies',
        content: '• Break large goals into smaller milestones\n• Create accountability systems\n• Use habit stacking for consistency\n• Set up environmental cues\n• Track both process and outcome goals',
        sort_order: 3
      }
    ],
    quickTips: [
      'Start with small, achievable goals to build momentum',
      'Review and adjust goals regularly based on progress',
      'Celebrate completions to maintain motivation'
    ],
    tags: ['goals', 'planning', 'achievement', 'motivation'],
    lastUpdated: '2024-01-15'
  },

  // ============= TODOS =============
  {
    id: 'todos-management',
    title: 'Managing Tasks and Todos',
    description: 'Organize and track your study tasks effectively',
    category: 'todos',
    context: ['reminders', 'dashboard'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'creating-todos',
        title: 'Creating Effective Todos',
        content: '**Todo Best Practices**:\n• Write clear, actionable task descriptions\n• Set specific deadlines\n• Assign priority levels (high, medium, low)\n• Break complex tasks into smaller steps\n• Include context or resources needed\n\n**Todo Categories**:\n• Study session tasks\n• Review and revision items\n• Assignment deadlines\n• Exam preparation tasks\n• Administrative tasks',
        sort_order: 1
      },
      {
        id: 'organizing-todos',
        title: 'Organizing Your Task List',
        content: '• Use priority matrices (urgent/important)\n• Group related tasks together\n• Set realistic daily task limits\n• Use tags for better categorization\n• Schedule tasks at optimal times',
        sort_order: 2
      },
      {
        id: 'completing-todos',
        title: 'Task Completion Strategies',
        content: '• Start with high-priority or quick wins\n• Use time-blocking for focused work\n• Set timers for task duration\n• Mark completed items immediately\n• Review incomplete tasks regularly',
        sort_order: 3
      }
    ],
    quickTips: [
      'Keep task descriptions specific and actionable',
      'Set realistic deadlines to avoid overwhelm',
      'Review and update your todo list daily'
    ],
    tags: ['todos', 'tasks', 'productivity', 'organization'],
    lastUpdated: '2024-01-15'
  },

  // ============= ANALYTICS =============
  {
    id: 'analytics-overview',
    title: 'Understanding Your Learning Analytics',
    description: 'Learn how to interpret and use your study data for better learning outcomes',
    category: 'analytics',
    context: ['analytics', 'progress-overview'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'analytics-dashboard',
        title: 'Analytics Dashboard Overview',
        content: '**Key Metrics Displayed**:\n• Study time and consistency\n• Learning streak information\n• Subject-wise performance\n• Quiz and flashcard accuracy\n• Progress toward goals\n• Weekly and monthly trends\n\n**Understanding the Data**:\n• Green indicators show positive trends\n• Red indicators suggest areas for improvement\n• Hover over charts for detailed information\n• Use date filters to analyze specific periods',
        sort_order: 1
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics Explained',
        content: '**Study Consistency Metrics**:\n• Daily study streaks\n• Average session duration\n• Study frequency patterns\n• Peak performance times\n\n**Learning Effectiveness Metrics**:\n• Retention rates for flashcards\n• Quiz accuracy trends\n• Concept mastery levels\n• Knowledge gap identification\n\n**Progress Indicators**:\n• Goal completion percentages\n• Milestone achievements\n• Subject progression rates\n• Skill development tracking',
        sort_order: 2
      },
      {
        id: 'using-analytics',
        title: 'Using Analytics for Improvement',
        content: '**Identify Patterns**:\n• Best study times and conditions\n• Most effective learning methods\n• Subject-specific challenges\n• Consistent weak areas\n\n**Make Data-Driven Decisions**:\n• Adjust study schedules based on peak times\n• Focus more time on challenging subjects\n• Modify study methods for better retention\n• Set realistic goals based on historical data\n\n**Track Long-Term Progress**:\n• Monitor improvement trends over time\n• Celebrate consistent achievements\n• Identify and address learning plateaus',
        sort_order: 3
      }
    ],
    quickTips: [
      'Check your analytics weekly to identify trends',
      'Focus on consistent patterns rather than daily variations',
      'Use insights to optimize your study schedule and methods'
    ],
    tags: ['analytics', 'data', 'performance', 'insights', 'optimization'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'analytics-study-patterns',
    title: 'Analyzing Your Study Patterns',
    description: 'Deep dive into your study habits and identify opportunities for optimization',
    category: 'analytics',
    context: ['analytics', 'study-session'],
    priority: 2,
    show_video: false,
    sections: [
      {
        id: 'time-analysis',
        title: 'Study Time Analysis',
        content: '**Time Distribution**:\n• Total study hours per week/month\n• Time spent per subject area\n• Session duration patterns\n• Break frequency and effectiveness\n• Peak productivity hours\n\n**Efficiency Metrics**:\n• Study time vs. learning outcomes\n• Quality of focused study time\n• Distraction frequency patterns\n• Most productive session types\n• Optimal study session length',
        sort_order: 1
      },
      {
        id: 'learning-velocity',
        title: 'Learning Velocity Tracking',
        content: '**Velocity Indicators**:\n• Concepts mastered per study hour\n• Flashcard progression rates\n• Quiz improvement speeds\n• Note creation and enhancement pace\n• Knowledge retention over time\n\n**Acceleration Strategies**:\n• Identify your fastest learning methods\n• Optimize content difficulty progression\n• Balance new learning with review\n• Leverage spaced repetition effectiveness',
        sort_order: 2
      }
    ],
    quickTips: [
      'Look for consistent patterns across multiple weeks',
      'Experiment with different study schedules based on your peak times',
      'Track both quantity and quality of study time'
    ],
    tags: ['analytics', 'patterns', 'efficiency', 'optimization'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'analytics-performance-insights',
    title: 'Performance Insights and Recommendations',
    description: 'Get personalized recommendations based on your learning data',
    category: 'analytics',
    context: ['analytics', 'progress-overview'],
    priority: 3,
    show_video: false,
    sections: [
      {
        id: 'strength-analysis',
        title: 'Identifying Your Learning Strengths',
        content: '**Strength Indicators**:\n• Subjects with highest retention rates\n• Most effective study methods for you\n• Optimal session durations\n• Best performance times of day\n• Most engaging content types\n\n**Leveraging Strengths**:\n• Apply successful methods to weaker subjects\n• Schedule difficult topics during peak times\n• Use preferred content formats when possible\n• Build confidence through strength areas',
        sort_order: 1
      },
      {
        id: 'improvement-opportunities',
        title: 'Identifying Areas for Improvement',
        content: '**Challenge Areas**:\n• Subjects with low retention rates\n• Inconsistent study patterns\n• Declining performance trends\n• Knowledge gaps and weak concepts\n• Time management inefficiencies\n\n**Improvement Strategies**:\n• Increase practice in weak areas\n• Vary study methods for difficult topics\n• Set up accountability systems\n• Break down complex concepts\n• Seek additional resources for challenges',
        sort_order: 2
      }
    ],
    quickTips: [
      'Focus on 1-2 improvement areas at a time',
      'Use your strengths to tackle challenging subjects',
      'Set small, measurable improvement goals'
    ],
    tags: ['analytics', 'insights', 'improvement', 'recommendations'],
    lastUpdated: '2024-01-15'
  },

  // ============= REMINDERS =============
  {
    id: 'reminders-setup',
    title: 'Setting Up Study Reminders',
    description: 'Configure reminders and notifications to stay on track with your learning schedule',
    category: 'reminders',
    context: ['reminders', 'settings'],
    priority: 1,
    show_video: false,
    sections: [
      {
        id: 'reminder-types',
        title: 'Types of Reminders',
        content: '**Study Session Reminders**: Scheduled study time notifications\n\n**Review Reminders**: Spaced repetition and review notifications\n\n**Goal Deadlines**: Important milestone and deadline alerts\n\n**Streak Maintenance**: Daily habit and consistency reminders\n\n**Custom Reminders**: Personalized notifications for specific needs',
        sort_order: 1
      },
      {
        id: 'reminder-configuration',
        title: 'Configuring Reminders',
        content: '• Choose notification methods (in-app, email, push)\n• Set optimal timing for your schedule\n• Configure frequency and repetition\n• Customize reminder content and tone\n• Set up different reminders for different activities',
        sort_order: 2
      }
    ],
    quickTips: [
      'Set reminders at times when you can actually study',
      'Use different reminder types for different goals',
      'Adjust reminder frequency based on your response patterns'
    ],
    tags: ['reminders', 'notifications', 'scheduling'],
    lastUpdated: '2024-01-15'
  }
];