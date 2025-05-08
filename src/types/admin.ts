
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
  set_name: string;
  front_content: string;
  back_content: string;
  subject_name: string;
  grade_name: string;
  section_name?: string;
  difficulty?: number;
}

export interface CSVUploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}
