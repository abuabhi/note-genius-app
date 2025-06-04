
import { FlashcardType } from "../FlashcardTypeSelector";

// Helper function to strip HTML tags and decode HTML entities
export const stripHtmlAndDecode = (html: string): string => {
  // Create a temporary div element to decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content (this strips HTML tags and decodes entities)
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

export const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().split(/\W+/);
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
  
  return words
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 20); // Increased to support more cards
};

export const findContextForKeyword = (text: string, keyword: string): string => {
  const sentences = text.split(/[.!?]+/);
  const relevantSentence = sentences.find(sentence => 
    sentence.toLowerCase().includes(keyword.toLowerCase())
  );
  return relevantSentence?.trim() || `Related to ${keyword}`;
};

export const smartProcessContent = async (
  content: string, 
  title: string, 
  type: FlashcardType,
  desiredCount: number = 10
): Promise<Array<{ front: string; back: string; type: FlashcardType }>> => {
  // Enhanced content processing with desired count
  if (!content || content.trim().length === 0) {
    return [{
      front: `What is the main topic of: ${stripHtmlAndDecode(title)}?`,
      back: "This note appears to be empty or has no content to process.",
      type
    }];
  }
  
  // Strip HTML from content first
  const cleanContent = stripHtmlAndDecode(content);
  const cleanTitle = stripHtmlAndDecode(title);
  
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const cards = [];

  switch (type) {
    case 'question-answer':
      const maxQA = Math.min(sentences.length, desiredCount);
      for (let i = 0; i < maxQA; i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 10) {
          cards.push({
            front: `According to "${cleanTitle}", what can you tell me about: ${sentence.substring(0, 50)}...?`,
            back: sentence,
            type
          });
        }
      }
      
      // If we need more cards, create variations
      while (cards.length < desiredCount && sentences.length > 0) {
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        if (randomSentence.trim().length > 10) {
          cards.push({
            front: `Explain the concept: ${randomSentence.substring(0, 30)}...`,
            back: randomSentence.trim(),
            type
          });
        }
        if (cards.length >= sentences.length) break; // Prevent infinite loop
      }
      break;
      
    case 'definition':
      const keywords = extractKeywords(cleanContent);
      const maxDef = Math.min(keywords.length, desiredCount);
      for (let i = 0; i < maxDef; i++) {
        const keyword = keywords[i];
        const context = findContextForKeyword(cleanContent, keyword);
        cards.push({
          front: `Define: ${keyword}`,
          back: context || `A concept from: ${cleanTitle}`,
          type
        });
      }
      break;
      
    case 'fill-blank':
      const maxFill = Math.min(sentences.length, desiredCount);
      for (let i = 0; i < maxFill; i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(' ');
        if (words.length > 5) {
          const blankIndex = Math.floor(words.length / 2);
          const blankedSentence = words.map((word, index) => 
            index === blankIndex ? '______' : word
          ).join(' ');
          
          cards.push({
            front: `Fill in the blank: ${blankedSentence}`,
            back: words[blankIndex],
            type
          });
        }
      }
      break;
      
    case 'concept':
      // For concept cards, create multiple cards based on different aspects
      const conceptsToCreate = Math.min(desiredCount, 5);
      
      for (let i = 0; i < conceptsToCreate; i++) {
        if (i === 0) {
          const conceptText = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
          cards.push({
            front: `Explain the main concept from: ${cleanTitle}`,
            back: conceptText,
            type
          });
        } else if (i === 1 && sentences.length > 1) {
          cards.push({
            front: `What are the key details mentioned in: ${cleanTitle}?`,
            back: sentences.slice(0, 3).join('. '),
            type
          });
        } else if (sentences.length > i) {
          cards.push({
            front: `Describe this aspect of ${cleanTitle}: ${sentences[i-1].substring(0, 40)}...`,
            back: sentences[i-1].trim(),
            type
          });
        }
      }
      break;
  }

  // Ensure we always return at least one card and don't exceed desired count
  if (cards.length === 0) {
    cards.push({
      front: `What is the main topic of: ${cleanTitle}?`,
      back: cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : ''),
      type
    });
  }

  // Limit to desired count
  return cards.slice(0, desiredCount);
};
