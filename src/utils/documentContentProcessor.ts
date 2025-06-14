import { GoogleDocContent } from "@/services/googleDocsImporter";

export interface ProcessedDocument {
  title: string;
  content: string;
  description: string;
  suggestedSubject: string;
}

export class DocumentContentProcessor {
  static processDocument(doc: GoogleDocContent): ProcessedDocument {
    const { title: originalTitle, content, plainText } = doc;
    
    // Generate appropriate title
    const processedTitle = this.generateTitle(originalTitle, plainText);
    
    // Generate description from first few lines
    const description = this.generateDescription(plainText);
    
    // Clean and format content
    const processedContent = this.cleanContent(content, plainText);
    
    // Suggest subject based on content
    const suggestedSubject = this.suggestSubject(plainText);
    
    return {
      title: processedTitle,
      content: processedContent,
      description,
      suggestedSubject
    };
  }

  private static generateTitle(originalTitle: string, content: string): string {
    // If original title is meaningful, use it
    if (originalTitle && 
        originalTitle !== 'Untitled Document' && 
        originalTitle !== 'Untitled document' &&
        originalTitle.length > 3 &&
        originalTitle.length <= 100) {
      return originalTitle;
    }

    // Try to extract title from first line of content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      // If first line looks like a title (short and descriptive)
      if (firstLine.length <= 100 && firstLine.length > 5) {
        return firstLine;
      }
    }

    // Fallback: use first 50 characters + ellipsis
    const excerpt = content.trim().substring(0, 47);
    return excerpt.length < content.trim().length ? excerpt + "..." : excerpt || "Imported Document";
  }

  private static generateDescription(content: string): string {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Take first 2-3 meaningful lines as description
    const descriptionLines = lines.slice(0, 3);
    let description = descriptionLines.join(' ').trim();
    
    // Limit description length
    if (description.length > 200) {
      description = description.substring(0, 197) + "...";
    }
    
    return description || "Imported from Google Docs";
  }

  private static cleanContent(htmlContent: string, plainText: string): string {
    // If we have HTML content, do basic cleaning
    if (htmlContent && htmlContent.trim().length > 0) {
      return htmlContent
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<head[^>]*>.*?<\/head>/gi, '')
        .trim();
    }
    
    // Otherwise return plain text
    return plainText || '';
  }

  private static suggestSubject(content: string): string {
    const textLower = content.toLowerCase();
    
    // Subject keyword mapping (expanded from contentAnalysisUtils)
    const subjectKeywords = {
      "Mathematics": [
        "math", "equation", "formula", "calculate", "algebra", "geometry", "trigonometry", 
        "calculus", "statistics", "probability", "derivative", "integral", "theorem"
      ],
      "Science": [
        "experiment", "hypothesis", "theory", "chemistry", "physics", "biology", 
        "molecule", "atom", "cell", "lab", "scientific", "research"
      ],
      "Technology": [
        "technology", "computer", "programming", "code", "software", "hardware",
        "algorithm", "database", "network", "internet"
      ],
      "English": [
        "essay", "paragraph", "grammar", "literature", "poem", "novel", "author", 
        "writing", "analysis", "rhetoric"
      ],
      "History": [
        "history", "war", "ancient", "century", "empire", "revolution", "timeline", 
        "historical", "period", "civilization"
      ]
    };

    let maxMatches = 0;
    let bestMatch = "General";
    
    for (const [subject, keywords] of Object.entries(subjectKeywords)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          matches++;
        }
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = subject;
      }
    }

    return bestMatch;
  }
}
