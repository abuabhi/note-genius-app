import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Trash2, GraduationCap } from 'lucide-react';
import { useExamTopics } from '@/hooks/exams';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { GanttTask, GanttTaskType } from '@/types/gantt';
import { statusOf, statusLabel } from '@/utils/ganttRollup';

interface TaskEditSheetProps {
  task: GanttTask | null;
  allTasks: GanttTask[];
  examId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Partial<GanttTask>) => void;
  onDelete: (id: string) => void;
}

const isoDate = (d: Date) => format(d, 'yyyy-MM-dd');

export const TaskEditSheet = ({
  task,
  allTasks,
  examId,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: TaskEditSheetProps) => {
  const [draft, setDraft] = useState<GanttTask | null>(task);
  const { topics, addTopic } = useExamTopics(examId ?? undefined);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    setDraft(task);
  }, [task]);

  if (!draft) return null;

  const linkedTopic = topics.find((t) => t.id === draft.topicId);

  const linkToTopic = async (topicId: string) => {
    if (topicId === 'none') {
      setDraft({ ...draft, topicId: null });
      return;
    }
    if (topicId === '__new__') {
      setLinking(true);
      try {
        const created = await addTopic({ name: draft.name });
        setDraft({ ...draft, topicId: created.id });
        toast.success(`Added "${created.name}" to Exam Prep`);
      } catch {
        // toast handled in hook
      } finally {
        setLinking(false);
      }
      return;
    }
    setDraft({ ...draft, topicId });
  };

  const isProject = draft.type === 'project';
  const status = statusOf(draft.progress);
  const dependencyCandidates = allTasks.filter((t) => t.id !== draft.id);
  const parentCandidates = allTasks.filter(
    (t) => t.id !== draft.id && t.type === 'project',
  );

  const handleSave = () => {
    if (!draft.name.trim()) return;
    onSave(draft.id, draft);
    // Suggest marking the linked exam topic as confident when task hits 100%
    if (
      draft.progress >= 100 &&
      (task?.progress ?? 0) < 100 &&
      draft.topicId &&
      linkedTopic &&
      linkedTopic.status !== 'confident'
    ) {
      toast(`Mark topic "${linkedTopic.name}" as confident in Exam Prep?`, {
        action: {
          label: 'Apply',
          onClick: async () => {
            try {
              const { useExamTopics: _u } = await import('@/hooks/exams');
              // We don't have direct access to setTopicStatus here without
              // re-instantiating; rely on a custom event the page can wire up.
              window.dispatchEvent(
                new CustomEvent('gantt:set-topic-confident', {
                  detail: { topicId: draft.topicId },
                }),
              );
            } catch {
              // ignore
            }
          },
        },
      });
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${draft.name}"? This also removes its sub-tasks.`)) {
      onDelete(draft.id);
      onOpenChange(false);
    }
  };

  const toggleDep = (depId: string, checked: boolean) => {
    const current = draft.dependencies ?? [];
    setDraft({
      ...draft,
      dependencies: checked
        ? Array.from(new Set([...current, depId]))
        : current.filter((d) => d !== depId),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit task</SheetTitle>
          <SheetDescription>
            Status: <span className="font-medium">{statusLabel[status]}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={draft.type}
                onValueChange={(v) =>
                  setDraft({ ...draft, type: v as GanttTaskType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="project">Project (group)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Parent</Label>
              <Select
                value={draft.parentId ?? 'none'}
                onValueChange={(v) =>
                  setDraft({ ...draft, parentId: v === 'none' ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top level)</SelectItem>
                  {parentCandidates.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(parseISO(draft.start), 'd MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseISO(draft.start)}
                    onSelect={(d) => d && setDraft({ ...draft, start: isoDate(d) })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(parseISO(draft.end), 'd MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseISO(draft.end)}
                    onSelect={(d) => d && setDraft({ ...draft, end: isoDate(d) })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className="text-sm font-medium tabular-nums">{draft.progress}%</span>
            </div>
            <Slider
              value={[draft.progress]}
              min={0}
              max={100}
              step={5}
              disabled={isProject}
              onValueChange={([v]) => setDraft({ ...draft, progress: v })}
            />
            {isProject && (
              <p className="text-xs text-muted-foreground">
                Auto-calculated from sub-tasks.
              </p>
            )}
            {!isProject && (
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, progress: 0 })}>
                  Not started
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, progress: 50 })}>
                  Halfway
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, progress: 100 })}>
                  Done
                </Button>
              </div>
            )}
          </div>

          {dependencyCandidates.length > 0 && (
            <div className="space-y-1.5">
              <Label>Depends on</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2 space-y-1.5">
                {dependencyCandidates.map((c) => {
                  const checked = (draft.dependencies ?? []).includes(c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleDep(c.id, !!v)}
                      />
                      <span className="truncate">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive sm:mr-auto">
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
