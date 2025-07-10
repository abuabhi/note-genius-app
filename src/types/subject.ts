
export const PREDEFINED_SUBJECTS = [
  "English",
  "Mathematics",
  "Science",
  "Humanities and Social Sciences",
  "Arts",
  "Technology", // Changed from "Technologies"
  "Health and Physical Education (HPE)",
  "Languages"
] as const;

export type PredefinedSubject = typeof PREDEFINED_SUBJECTS[number];

export interface UserSubject {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type GradeLevel = 
  | "Grade 5" | "Grade 6" | "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10"
  | "Grade 11" | "Grade 12"
  | "Undergraduate" | "Graduate" | "PhD";

export const GRADE_LEVELS: GradeLevel[] = [
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12",
  "Undergraduate", "Graduate", "PhD"
];
