
import { SmartSuggestion } from "./types";

export const useSmartSuggestions = () => {
  const getSmartDateSuggestions = (): SmartSuggestion[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const thisWeekend = new Date(today);
    const daysUntilSaturday = 6 - today.getDay();
    thisWeekend.setDate(today.getDate() + daysUntilSaturday);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    return [
      { label: "Today", date: today, icon: "🔥" },
      { label: "Tomorrow", date: tomorrow, icon: "⏰" },
      { label: "This Weekend", date: thisWeekend, icon: "🏖️" },
      { label: "Next Week", date: nextWeek, icon: "📅" },
      { label: "Next Month", date: nextMonth, icon: "📆" },
    ];
  };

  const getAutoTags = (title: string, description?: string): string[] => {
    const content = `${title} ${description || ''}`.toLowerCase();
    const tags: string[] = [];

    // Work-related keywords
    if (content.match(/\b(meeting|call|presentation|project|deadline|email|report)\b/)) {
      tags.push('work');
    }

    // Personal keywords
    if (content.match(/\b(doctor|appointment|family|friend|personal|home)\b/)) {
      tags.push('personal');
    }

    // Health keywords
    if (content.match(/\b(exercise|gym|workout|health|vitamin|medical)\b/)) {
      tags.push('health');
    }

    // Shopping keywords
    if (content.match(/\b(buy|purchase|shop|store|grocery|market)\b/)) {
      tags.push('shopping');
    }

    // Learning keywords
    if (content.match(/\b(study|learn|course|book|research|education)\b/)) {
      tags.push('learning');
    }

    // Finance keywords
    if (content.match(/\b(bill|payment|bank|money|budget|finance)\b/)) {
      tags.push('finance');
    }

    return tags;
  };

  return {
    getSmartDateSuggestions,
    getAutoTags,
  };
};
