import { useEffect, useMemo, useState } from 'react';
import { addDays, formatISO } from 'date-fns';
import { ViewMode } from 'gantt-task-react';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { GanttChartSquare, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useExams, useExamTopics } from '@/hooks/exams';
import { useGanttPlans } from '@/hooks/gantt/useGanttPlans';
import { useGanttTasks } from '@/hooks/gantt/useGanttTasks';
import { useLocalToCloudMigration } from '@/hooks/gantt/useLocalToCloudMigration';
import { autoSeedFromExam } from '@/hooks/gantt/useAutoSeed';
import { GanttBoard } from '@/components/gantt/GanttBoard';
import { PlanSwitcher } from '@/components/gantt/PlanSwitcher';
import { TaskEditSheet } from '@/components/gantt/TaskEditSheet';
import { PlanSummary } from '@/components/gantt/PlanSummary';
import { computePlanStats } from '@/utils/ganttRollup';
import { toast } from 'sonner';

const PLAN_STORAGE_KEY = 'gantt:lastPlanId';

const GanttPage = () => {
  const { user, loading } = useRequireAuth();
  const { exams } = useExams();
  useLocalToCloudMigration();

  const { plans, isLoading: plansLoading, createPlan, renamePlan, deletePlan } = useGanttPlans();
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Restore last-used plan / pick first available
  useEffect(() => {
    if (currentPlanId || plansLoading || plans.length === 0) return;
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    const found = stored && plans.find((p) => p.id === stored);
    setCurrentPlanId(found ? stored : plans[0].id);
  }, [plans, plansLoading, currentPlanId]);

  useEffect(() => {
    if (currentPlanId) localStorage.setItem(PLAN_STORAGE_KEY, currentPlanId);
  }, [currentPlanId]);

  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? null;
  const linkedExamId = currentPlan?.examId ?? null;
  const { topics } = useExamTopics(linkedExamId ?? undefined);
  const linkedExam = useMemo(
    () => exams.find((e) => e.id === linkedExamId) ?? null,
    [exams, linkedExamId],
  );

  const { tasks, updateTask, addTask, removeTask, clearPlan, replaceAll } =
    useGanttTasks(currentPlanId);

  const handleAutoSeed = async () => {
    if (!linkedExam) {
      toast.error('Link this plan to an exam first to auto-seed');
      return;
    }
    const seeded = autoSeedFromExam(linkedExam, topics);
    await replaceAll(seeded);
    toast.success(`Seeded ${seeded.length} tasks for ${linkedExam.title}`);
  };

  const handleAddTask = async () => {
    const today = new Date();
    await addTask({
      name: 'New task',
      start: formatISO(today, { representation: 'date' }),
      end: formatISO(addDays(today, 3), { representation: 'date' }),
      progress: 0,
      type: 'task',
    });
  };

  const handleClear = async () => {
    if (confirm('Clear all tasks for this plan?')) {
      await clearPlan();
      toast.success('Plan cleared');
    }
  };

  const handleRename = (id: string, name: string) => {
    updateTask(id, { name });
  };

  const handleCreatePlan = async (input: { title: string; examId: string | null }) => {
    return await createPlan(input);
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
        title="Planner"
        description="Plan study workloads as Gantt charts. Drag bars to reschedule, link them to set dependencies, and track progress as you go."
        icon={<GanttChartSquare className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: 'Planner' }]}
      />
      <div className="container mx-auto px-6 py-6 space-y-4">
        {/* Plan switcher + actions */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
          <PlanSwitcher
            plans={plans}
            currentPlanId={currentPlanId}
            exams={exams}
            onSelect={setCurrentPlanId}
            onCreate={handleCreatePlan}
            onRename={(id, title) => renamePlan({ id, title })}
            onDelete={async (id) => {
              await deletePlan(id);
              if (id === currentPlanId) setCurrentPlanId(null);
            }}
          />

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-md border border-border bg-background p-0.5">
              {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSeed}
              disabled={!currentPlanId || !linkedExamId}
              title={
                !currentPlanId
                  ? 'Pick a plan first'
                  : !linkedExamId
                    ? 'Link this plan to an exam to auto-seed'
                    : 'Auto-generate tasks from exam topics'
              }
            >
              <Sparkles className="h-4 w-4 mr-1.5" /> Auto-seed
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddTask} disabled={!currentPlanId}>
              <Plus className="h-4 w-4 mr-1.5" /> Task
            </Button>
            {tasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {!currentPlanId && !plansLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
            <GanttChartSquare className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No plan selected</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Create a Gantt plan to map out your study workload. You can have one per exam plus standalone plans.
            </p>
          </div>
        )}

        {currentPlanId && tasks.length > 0 && <PlanSummary stats={computePlanStats(tasks)} />}

        {currentPlanId && (
          <GanttBoard
            tasks={tasks}
            viewMode={viewMode}
            onChange={updateTask}
            onDelete={removeTask}
            onEdit={setEditingId}
            onRename={handleRename}
          />
        )}

        {currentPlanId && (
          <p className="text-xs text-muted-foreground">
            Tip: <strong>double-click a task name</strong> on the left to rename it inline.
            Drag bars to reschedule, drag the right edge to resize, drag the round handle to set % complete.
            Click a bar to open the full editor.
          </p>
        )}

        <TaskEditSheet
          task={tasks.find((t) => t.id === editingId) ?? null}
          allTasks={tasks}
          examId={linkedExamId}
          open={!!editingId}
          onOpenChange={(o) => !o && setEditingId(null)}
          onSave={updateTask}
          onDelete={removeTask}
        />
      </div>
    </div>
  );
};

export default GanttPage;
