import { useMemo, useState } from 'react';
import { addDays, formatISO } from 'date-fns';
import { ViewMode } from 'gantt-task-react';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { GanttChartSquare } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useExams, useExamTopics } from '@/hooks/exams';
import { useGanttPlan } from '@/hooks/gantt/useGanttPlan';
import { autoSeedFromExam } from '@/hooks/gantt/useAutoSeed';
import { ExamPickerBar } from '@/components/gantt/ExamPickerBar';
import { GanttBoard } from '@/components/gantt/GanttBoard';
import { toast } from 'sonner';

const GanttPage = () => {
  const { user, loading } = useRequireAuth();
  const { query: examsQuery } = useExams() as any;
  const exams = examsQuery?.data ?? [];

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  const { data: topics = [] } = useExamTopics(selectedExamId ?? undefined) as any;
  const selectedExam = useMemo(
    () => exams.find((e: any) => e.id === selectedExamId) ?? null,
    [exams, selectedExamId],
  );

  const { tasks, setTasks, updateTask, addTask, removeTask, clearPlan } =
    useGanttPlan(selectedExamId);

  const handleAutoSeed = () => {
    if (!selectedExam) return;
    const seeded = autoSeedFromExam(selectedExam, topics);
    setTasks(seeded);
    toast.success(`Seeded ${seeded.length} tasks for ${selectedExam.title}`);
  };

  const handleAddTask = () => {
    const today = new Date();
    addTask({
      id: `task-${Date.now()}`,
      name: 'New task',
      start: formatISO(today, { representation: 'date' }),
      end: formatISO(addDays(today, 3), { representation: 'date' }),
      progress: 0,
      type: 'task',
    });
  };

  const handleClear = () => {
    if (confirm('Clear all tasks for this plan?')) {
      clearPlan();
      toast.success('Plan cleared');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Gantt Planner (beta)"
        description="Drag bars to reschedule, drag edges to resize, link bars to create dependencies. Saved locally in this browser only."
        icon={<GanttChartSquare className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: 'Gantt' }]}
      />
      <div className="container mx-auto px-6 py-6 space-y-4">
        <ExamPickerBar
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          onAutoSeed={handleAutoSeed}
          onAddTask={handleAddTask}
          onClear={handleClear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasTasks={tasks.length > 0}
        />
        <GanttBoard
          tasks={tasks}
          viewMode={viewMode}
          onChange={updateTask}
          onDelete={removeTask}
        />
        <p className="text-xs text-muted-foreground">
          Prototype: data lives in localStorage under key{' '}
          <code className="px-1 py-0.5 rounded bg-muted">{`gantt:plan:${selectedExamId ?? 'standalone'}`}</code>.
        </p>
      </div>
    </div>
  );
};

export default GanttPage;
