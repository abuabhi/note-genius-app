
import { GoalTemplate } from '@/types/study';

export const goalTemplates: GoalTemplate[] = [
  {
    title: "Weekly Study Routine",
    description: "Establish a consistent weekly study schedule",
    target_hours: 10,
    duration_days: 7,
    subject: "General"
  },
  {
    title: "Exam Preparation",
    description: "Intensive preparation for upcoming exams",
    target_hours: 25,
    duration_days: 14,
    subject: "General"
  },
  {
    title: "Subject Mastery",
    description: "Deep dive into a specific subject area",
    target_hours: 30,
    duration_days: 30,
    subject: "General"
  }
];

export const getTemplateByTitle = (title: string): GoalTemplate | undefined => {
  return goalTemplates.find(template => template.title === title);
};
