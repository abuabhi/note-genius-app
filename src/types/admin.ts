
export interface CSVUploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  userResults?: Array<{
    email: string;
    successCount: number;
    errorCount: number;
    errors: string[];
  }>;
}

export interface NoteCSVRow {
  title: string;
  description: string;
  content: string;
  subject: string;
  source_type: string;
  tags: string;
  user_email: string;
}

// Academic data types
export interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CSVGradeRow {
  name: string;
  level: number;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  grade_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
  grade?: Grade;
}

export interface CSVSubjectRow {
  name: string;
  grade_name: string;
  description?: string;
}

export interface Section {
  id: string;
  name: string;
  subject_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
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
  country_code?: string;
  country_name?: string;
  education_system?: string;
}
