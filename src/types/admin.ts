
import { SubjectCategory } from "./flashcard";

export interface Grade {
  id: string;
  name: string;
  level: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  name: string;
  subject_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subject?: SubjectCategory; // For eager loading
}

export interface CSVUploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface CSVGradeRow {
  name: string;
  level: number;
  description?: string;
}

export interface CSVSubjectRow {
  name: string;
  grade_name: string;
  description?: string;
}

export interface CSVSectionRow {
  name: string;
  subject_name: string;
  grade_name: string;
  description?: string;
}

export interface CSVFlashcardRow {
  front_content: string;
  back_content: string;
  section_name?: string;
  subject_name: string;
  grade_name: string;
  difficulty?: number;
  set_name: string;
}
