
import { z } from "zod";

const QuizOptionSchema = z.object({
  content: z.string().min(1, "Option content is required"),
  isCorrect: z.boolean(),
});

const QuizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(1),
  options: z.array(QuizOptionSchema).min(2, "At least 2 options are required")
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length === 1,
      "Exactly one option must be marked as correct"
    ),
});

export const quizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  countryId: z.string().min(1, "Country is required"),
  educationSystem: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"), // Changed from categoryId to subjectId
  gradeId: z.string().optional(),
  sectionId: z.string().optional(),
  isPublic: z.boolean().default(false),
  questions: z.array(QuizQuestionSchema).min(1, "At least one question is required"),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
