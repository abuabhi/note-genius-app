
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
  category: string;
  source_type: string;
  tags: string;
  user_email: string;
}
