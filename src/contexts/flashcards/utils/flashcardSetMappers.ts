
import { FlashcardSet } from '@/types/flashcard';

/**
 * Convert raw database data to FlashcardSet type
 */
export const convertToFlashcardSet = (data: any): FlashcardSet => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    subject: data.subject || '',
    topic: data.topic || '',
    category_id: data.category_id,
    country_id: data.country_id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    card_count: data.card_count || 0,
    is_built_in: data.is_built_in || false,
    subject_categories: data.subject_categories
  };
};
