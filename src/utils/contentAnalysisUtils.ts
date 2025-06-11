
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

  // Enhanced subject detection based on content keywords
  const textLower = text.toLowerCase();
  let suggestedSubject = "Uncategorized";
  
  const subjectKeywords = {
    "Mathematics": [
      "math", "equation", "formula", "calculate", "algebra", "geometry", "trigonometry", 
      "calculus", "statistics", "probability", "derivative", "integral", "theorem", 
      "proof", "variable", "function", "graph", "matrix", "vector", "logarithm",
      "sine", "cosine", "tangent", "polynomial", "quadratic", "linear", "exponential",
      "+", "-", "×", "÷", "=", "∑", "∆", "π", "∞"
    ],
    "Science": [
      "experiment", "hypothesis", "theory", "chemistry", "physics", "biology", 
      "molecule", "atom", "cell", "lab", "scientific", "research", "observation",
      "chemical", "reaction", "element", "compound", "organism", "species",
      "evolution", "energy", "force", "motion", "gravity", "DNA", "RNA",
      "photosynthesis", "respiration", "ecosystem", "biodiversity"
    ],
    "Technology": [
      "technology", "computer", "programming", "code", "software", "hardware",
      "algorithm", "database", "network", "internet", "website", "app", 
      "application", "system", "server", "cloud", "data", "digital",
      "artificial intelligence", "AI", "machine learning", "ML", "cybersecurity",
      "blockchain", "cryptocurrency", "IoT", "automation", "robotics",
      "python", "javascript", "java", "html", "css", "sql", "API",
      "framework", "library", "debugging", "testing", "deployment"
    ],
    "English": [
      "essay", "paragraph", "grammar", "literature", "poem", "novel", "author", 
      "writing", "analysis", "rhetoric", "narrative", "character", "plot",
      "theme", "metaphor", "simile", "symbolism", "irony", "alliteration",
      "shakespeare", "poetry", "prose", "fiction", "non-fiction", "genre",
      "syntax", "semantics", "linguistics", "vocabulary", "composition"
    ],
    "History": [
      "history", "war", "ancient", "century", "empire", "revolution", "timeline", 
      "historical", "period", "civilization", "culture", "society", "politics",
      "government", "democracy", "monarchy", "treaty", "battle", "conquest",
      "renaissance", "industrial revolution", "world war", "medieval",
      "dynasty", "colonial", "independence", "constitution", "amendment"
    ],
    "Geography": [
      "map", "country", "continent", "ocean", "mountain", "river", "climate", 
      "population", "capital", "geography", "topography", "landscape",
      "environment", "ecosystem", "natural resources", "agriculture",
      "urbanization", "migration", "demographics", "cartography",
      "latitude", "longitude", "hemisphere", "equator", "timezone"
    ],
    "Art": [
      "drawing", "painting", "color", "sketch", "design", "artistic", "canvas", 
      "brush", "creative", "sculpture", "gallery", "museum", "artist",
      "masterpiece", "portrait", "landscape", "abstract", "realistic",
      "perspective", "composition", "texture", "contrast", "harmony",
      "renaissance art", "modern art", "contemporary", "impressionism"
    ],
    "Music": [
      "song", "melody", "rhythm", "instrument", "note", "chord", "tempo", 
      "harmony", "musical", "composition", "symphony", "orchestra",
      "piano", "guitar", "violin", "drums", "bass", "vocal", "singer",
      "scale", "key signature", "time signature", "dynamics", "acoustic"
    ],
    "Health": [
      "health", "medicine", "doctor", "treatment", "symptom", "exercise", 
      "nutrition", "wellness", "medical", "disease", "diagnosis", "therapy",
      "fitness", "diet", "vitamin", "protein", "carbohydrate", "calorie",
      "mental health", "physical therapy", "prevention", "healthcare",
      "anatomy", "physiology", "psychology", "psychiatry"
    ],
    "Languages": [
      "language", "translation", "vocabulary", "pronunciation", "accent",
      "dialect", "bilingual", "multilingual", "foreign language", "native",
      "fluency", "comprehension", "speaking", "listening", "reading",
      "spanish", "french", "german", "chinese", "japanese", "korean",
      "arabic", "russian", "portuguese", "italian", "hindi"
    ]
  };

  let maxMatches = 0;
  let bestMatch = "";
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    let matches = 0;
    let weightedScore = 0;
    
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        matches++;
        // Give higher weight to longer, more specific keywords
        weightedScore += keyword.length > 5 ? 2 : 1;
      }
    }
    
    // Use weighted score for better accuracy
    if (weightedScore > maxMatches) {
      maxMatches = weightedScore;
      bestMatch = subject;
    }
  }

  if (maxMatches > 0) {
    suggestedSubject = bestMatch;
    // Increase confidence based on number and quality of matches
    confidence = Math.min(0.95, confidence + (maxMatches * 0.05));
  }

  console.log('Content analysis result:', {
    text: text.substring(0, 100) + '...',
    suggestedSubject,
    maxMatches,
    confidence
  });

  return {
    suggestedTitle,
    suggestedSubject,
    confidence
  };
};
