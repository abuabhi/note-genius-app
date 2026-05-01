import { addDays, differenceInDays, formatISO } from 'date-fns';
import type { Exam, ExamTopic } from '@/types/exam';
import type { GanttTask } from '@/types/gantt';

const iso = (d: Date) => formatISO(d, { representation: 'date' });

const DEFAULT_TOPIC_NAMES = [
  'Foundations',
  'Core Topic A',
  'Core Topic B',
  'Practice Set',
];

/**
 * Seed a Gantt task tree from an exam + (optional) topics.
 * Spreads work between today and exam_date − 3 days.
 */
export function autoSeedFromExam(exam: Exam, topics: ExamTopic[]): GanttTask[] {
  const today = new Date();
  const examDate = new Date(exam.exam_date);
  const lastStudyDay = addDays(examDate, -3);
  const totalDays = Math.max(differenceInDays(lastStudyDay, today), 7);

  const sourceTopics: { name: string }[] =
    topics.length > 0
      ? topics.map((t) => ({ name: t.name }))
      : DEFAULT_TOPIC_NAMES.map((n) => ({ name: n }));

  const perTopicDays = Math.max(Math.floor(totalDays / sourceTopics.length), 3);
  const tasks: GanttTask[] = [];
  const reviewIds: string[] = [];

  sourceTopics.forEach((topic, idx) => {
    const parentId = `seed-${idx}`;
    const topicStart = addDays(today, idx * perTopicDays);
    const topicEnd = addDays(topicStart, perTopicDays);

    tasks.push({
      id: parentId,
      name: topic.name,
      start: iso(topicStart),
      end: iso(topicEnd),
      progress: 0,
      type: 'project',
    });

    const learnId = `${parentId}-learn`;
    const practiceId = `${parentId}-practice`;
    const reviewId = `${parentId}-review`;
    const slice = Math.max(Math.floor(perTopicDays / 3), 1);

    tasks.push({
      id: learnId,
      name: `Learn — ${topic.name}`,
      start: iso(topicStart),
      end: iso(addDays(topicStart, slice)),
      progress: 0,
      type: 'task',
      parentId,
    });
    tasks.push({
      id: practiceId,
      name: `Practice — ${topic.name}`,
      start: iso(addDays(topicStart, slice)),
      end: iso(addDays(topicStart, slice * 2)),
      progress: 0,
      type: 'task',
      parentId,
      dependencies: [learnId],
    });
    tasks.push({
      id: reviewId,
      name: `Review — ${topic.name}`,
      start: iso(addDays(topicStart, slice * 2)),
      end: iso(topicEnd),
      progress: 0,
      type: 'task',
      parentId,
      dependencies: [practiceId],
    });
    reviewIds.push(reviewId);
  });

  // Mock exam — 1 week before
  const mockDay = addDays(examDate, -7);
  tasks.push({
    id: 'seed-mock',
    name: 'Mock Exam',
    start: iso(mockDay),
    end: iso(addDays(mockDay, 1)),
    progress: 0,
    type: 'milestone',
    dependencies: reviewIds,
  });

  // Final review — last 3 days
  tasks.push({
    id: 'seed-final',
    name: 'Final Review',
    start: iso(addDays(examDate, -3)),
    end: iso(examDate),
    progress: 0,
    type: 'task',
    dependencies: ['seed-mock'],
  });

  return tasks;
}
