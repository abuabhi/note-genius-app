
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
