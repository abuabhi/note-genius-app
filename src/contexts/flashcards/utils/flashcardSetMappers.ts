
import { FlashcardSet } from '@/types/flashcard';

/**
 * Converts database response to a FlashcardSet object
 */
export const convertToFlashcardSet = (data: any): FlashcardSet => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_built_in: data.is_built_in,
    card_count: data.card_count || 0,
    subject: data.subject,
    topic: data.topic,
    country_id: data.country_id,
    category_id: data.category_id,
    education_system: data.education_system,
    section_id: data.section_id,
    subject_categories: data.subject_categories ? {
      id: data.subject_categories.id,
      name: data.subject_categories.name
    } : undefined
  };
};
