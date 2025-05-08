
import { z } from "zod";

const optionSchema = z.object({
  content: z.string().min(1, { message: "Option content is required" }),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(1),
  options: z.array(optionSchema).min(2, { message: "At least 2 options are required" }),
}).refine((data) => {
  return data.options.some(option => option.isCorrect);
}, {
  message: "At least one option must be marked as correct",
  path: ["options"],
});

export const quizFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  gradeId: z.string().optional(),
  sectionId: z.string().optional(),
  countryId: z.string().optional(),
  educationSystem: z.string().optional(),
  isPublic: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, { message: "At least 1 question is required" }),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
