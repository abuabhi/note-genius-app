
import { z } from "zod";

export const quizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  gradeId: z.string().optional(),
  sectionId: z.string().optional(),
  isPublic: z.boolean().default(false),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      explanation: z.string().optional(),
      difficulty: z.number().min(1).max(5).default(1),
      options: z.array(
        z.object({
          content: z.string().min(1, "Option content is required"),
          isCorrect: z.boolean().default(false),
        })
      ).min(2, "At least 2 options are required"),
    })
  ).min(1, "At least one question is required"),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
