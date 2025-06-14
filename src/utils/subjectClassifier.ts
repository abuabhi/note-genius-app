
import { UserSubject } from "@/types/subject";

export class SubjectClassifier {
  private userSubjects: UserSubject[];

  constructor(userSubjects: UserSubject[]) {
    this.userSubjects = userSubjects;
  }

  classifyContent(content: string, suggestedSubject: string): string {
    // If user has no subjects, return the suggested subject
    if (!this.userSubjects || this.userSubjects.length === 0) {
      return suggestedSubject;
    }

    const contentLower = content.toLowerCase();
    
    // First try to match against user's existing subjects
    let bestMatch = "";
    let maxRelevance = 0;

    for (const userSubject of this.userSubjects) {
      const subjectName = userSubject.name.toLowerCase();
      const relevance = this.calculateRelevance(contentLower, subjectName);
      
      if (relevance > maxRelevance) {
        maxRelevance = relevance;
        bestMatch = userSubject.name;
      }
    }

    // If we found a good match with user's subjects, use it
    if (maxRelevance > 0.3) {
      return bestMatch;
    }

    // Try to find exact or partial matches with suggested subject
    const suggestedLower = suggestedSubject.toLowerCase();
    for (const userSubject of this.userSubjects) {
      const userSubjectLower = userSubject.name.toLowerCase();
      
      // Exact match
      if (userSubjectLower === suggestedLower) {
        return userSubject.name;
      }
      
      // Partial match
      if (userSubjectLower.includes(suggestedLower) || suggestedLower.includes(userSubjectLower)) {
        return userSubject.name;
      }
    }

    // If no good match found, return the first user subject or suggested subject
    return this.userSubjects.length > 0 ? this.userSubjects[0].name : suggestedSubject;
  }

  private calculateRelevance(content: string, subjectName: string): number {
    const subjectKeywords = subjectName.split(' ');
    let matches = 0;
    let totalWeight = 0;

    for (const keyword of subjectKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (content.includes(keywordLower)) {
        // Weight longer keywords more heavily
        const weight = Math.max(1, keyword.length / 3);
        matches += weight;
      }
      totalWeight += Math.max(1, keyword.length / 3);
    }

    return totalWeight > 0 ? matches / totalWeight : 0;
  }
}
