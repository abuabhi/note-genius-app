
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
    subject_id: data.subject_id,
    country_id: data.country_id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    card_count: data.card_count || 0,
    is_built_in: data.is_built_in || false,
    academic_subjects: data.academic_subjects
  };
};
