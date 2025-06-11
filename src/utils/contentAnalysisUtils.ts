
interface ContentAnalysis {
  suggestedTitle: string;
  suggestedSubject: string;
  confidence: number;
}

/**
 * Analyze content to generate automatic title and subject suggestions
 */
export const analyzeContentForTitleAndSubject = (text: string): ContentAnalysis => {
  if (!text || text.trim().length === 0) {
    return {
      suggestedTitle: "Scanned Note",
      suggestedSubject: "Uncategorized",
      confidence: 0.3
    };
  }

  // Extract potential title from first line or heading
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let suggestedTitle = "Scanned Note";
  let confidence = 0.5;

  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^#+\s*/, '').trim(); // Remove markdown headers
    
    // If first line is short and looks like a title (under 50 chars)
    if (firstLine.length > 0 && firstLine.length <= 50) {
      suggestedTitle = firstLine;
      confidence = 0.8;
    } else if (firstLine.length > 50) {
      // Take first 47 characters and add ellipsis
      suggestedTitle = firstLine.substring(0, 47) + "...";
      confidence = 0.6;
    }
  }

  // Subject detection based on content keywords
  const textLower = text.toLowerCase();
  let suggestedSubject = "Uncategorized";
  
  const subjectKeywords = {
    "Mathematics": ["math", "equation", "formula", "calculate", "algebra", "geometry", "trigonometry", "+", "-", "×", "÷", "="],
    "Science": ["experiment", "hypothesis", "theory", "chemistry", "physics", "biology", "molecule", "atom", "cell", "lab"],
    "History": ["history", "war", "ancient", "century", "empire", "revolution", "timeline", "historical", "period"],
    "English": ["essay", "paragraph", "grammar", "literature", "poem", "novel", "author", "writing", "analysis"],
    "Geography": ["map", "country", "continent", "ocean", "mountain", "river", "climate", "population", "capital"],
    "Art": ["drawing", "painting", "color", "sketch", "design", "artistic", "canvas", "brush", "creative"],
    "Music": ["song", "melody", "rhythm", "instrument", "note", "chord", "tempo", "harmony", "musical"],
    "Technology": ["computer", "software", "programming", "code", "digital", "internet", "app", "tech", "device"],
    "Health": ["health", "medicine", "doctor", "treatment", "symptom", "exercise", "nutrition", "wellness", "medical"]
  };

  let maxMatches = 0;
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      suggestedSubject = subject;
    }
  }

  // Increase confidence if we found subject matches
  if (maxMatches > 0) {
    confidence = Math.min(0.9, confidence + (maxMatches * 0.1));
  }

  return {
    suggestedTitle,
    suggestedSubject,
    confidence
  };
};
