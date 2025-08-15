/**
 * Content analysis utilities for intelligent title and subject generation
 */

interface ContentAnalysis {
  suggestedTitle: string;
  suggestedSubject: string;
  confidence: number;
  topics: string[];
}

interface UserSubject {
  id: string;
  name: string;
}

/**
 * Analyze document content using OpenAI to generate title and subject
 */
export async function analyzeDocumentContent(
  text: string,
  existingSubjects: UserSubject[],
  openaiApiKey: string
): Promise<ContentAnalysis> {
  try {
    // Truncate text to avoid token limits (keep first 3000 characters for analysis)
    const analysisText = text.length > 3000 ? text.substring(0, 3000) + "..." : text;
    
    // Create subject list for matching
    const subjectNames = existingSubjects.map(s => s.name).join(', ');
    
    const prompt = `Analyze this document content and provide:
1. A concise, descriptive title (max 8 words)
2. The most appropriate subject from this list: ${subjectNames || 'Mathematics, Science, English, History, Geography, Art, Music, Technology, Health, Languages, Other'}
3. Main topics covered (max 5)

Content:
${analysisText}

Respond in JSON format:
{
  "title": "Generated title here",
  "subject": "Best matching subject",
  "topics": ["topic1", "topic2", "topic3"],
  "confidence": 0.85
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes document content and generates metadata. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(content.trim());
    
    // Validate and match subject to existing ones
    const matchedSubject = findBestSubjectMatch(analysis.subject, existingSubjects);
    
    return {
      suggestedTitle: analysis.title || generateFallbackTitle(text),
      suggestedSubject: matchedSubject,
      confidence: analysis.confidence || 0.7,
      topics: analysis.topics || []
    };
    
  } catch (error) {
    console.error('Content analysis failed:', error);
    
    // Fallback to simple analysis
    return {
      suggestedTitle: generateFallbackTitle(text),
      suggestedSubject: findBestSubjectMatch("", existingSubjects) || "Uncategorized",
      confidence: 0.3,
      topics: []
    };
  }
}

/**
 * Find the best matching subject from user's existing subjects
 */
function findBestSubjectMatch(suggestedSubject: string, existingSubjects: UserSubject[]): string {
  if (!suggestedSubject || existingSubjects.length === 0) {
    return "Uncategorized";
  }
  
  const suggestion = suggestedSubject.toLowerCase();
  
  // Exact match
  for (const subject of existingSubjects) {
    if (subject.name.toLowerCase() === suggestion) {
      return subject.name;
    }
  }
  
  // Partial match
  for (const subject of existingSubjects) {
    if (subject.name.toLowerCase().includes(suggestion) || 
        suggestion.includes(subject.name.toLowerCase())) {
      return subject.name;
    }
  }
  
  // Fuzzy matching for common subjects
  const commonMappings: Record<string, string[]> = {
    'mathematics': ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics'],
    'science': ['science', 'physics', 'chemistry', 'biology', 'scientific'],
    'english': ['english', 'literature', 'writing', 'language arts', 'grammar'],
    'history': ['history', 'historical', 'social studies', 'geography'],
    'art': ['art', 'arts', 'drawing', 'painting', 'creative'],
    'technology': ['technology', 'computer', 'programming', 'tech', 'it'],
    'health': ['health', 'medical', 'biology', 'medicine', 'fitness']
  };
  
  for (const subject of existingSubjects) {
    const subjectLower = subject.name.toLowerCase();
    for (const [category, keywords] of Object.entries(commonMappings)) {
      if (keywords.includes(suggestion) && keywords.includes(subjectLower)) {
        return subject.name;
      }
    }
  }
  
  // Default fallback
  return existingSubjects.length > 0 ? existingSubjects[0].name : "Uncategorized";
}

/**
 * Generate a fallback title from document content
 */
function generateFallbackTitle(text: string): string {
  if (!text || text.trim().length === 0) {
    return "Imported Document";
  }
  
  // Extract first meaningful sentence or line
  const lines = text.split('\n').filter(line => line.trim().length > 10);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Limit to reasonable title length
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + "...";
    }
    return firstLine;
  }
  
  // Extract first few words
  const words = text.trim().split(/\s+/).slice(0, 8);
  return words.join(' ') + (words.length === 8 ? '...' : '');
}

/**
 * Fetch user's existing subjects for matching
 */
export async function fetchUserSubjects(userId: string, supabase: any): Promise<UserSubject[]> {
  try {
    const { data, error } = await supabase
      .from('user_subjects')
      .select('id, name')
      .eq('user_id', userId)
      .order('name');
    
    if (error) {
      console.warn('Failed to fetch user subjects:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching user subjects:', error);
    return [];
  }
}
