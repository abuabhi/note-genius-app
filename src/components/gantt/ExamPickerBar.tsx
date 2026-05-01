import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import type { Exam } from '@/types/exam';
import { ViewMode } from 'gantt-task-react';

interface ExamPickerBarProps {
  exams: Exam[];
  selectedExamId: string | null;
  onSelectExam: (id: string | null) => void;
  onAutoSeed: () => void;
  onAddTask: () => void;
  onClear: () => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  hasTasks: boolean;
}

export const ExamPickerBar = ({
  exams,
  selectedExamId,
  onSelectExam,
  onAutoSeed,
  onAddTask,
  onClear,
  viewMode,
  onViewModeChange,
  hasTasks,
}: ExamPickerBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Plan for:</span>
        <Select
          value={selectedExamId ?? 'standalone'}
          onValueChange={(v) => onSelectExam(v === 'standalone' ? null : v)}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standalone">Standalone plan (no exam)</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} — {format(new Date(e.exam_date), 'd MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex rounded-md border border-border bg-background p-0.5">
          {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
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
          onClick={onAutoSeed}
          disabled={!selectedExamId}
          title={!selectedExamId ? 'Pick an exam first' : 'Auto-generate tasks from exam'}
        >
          <Sparkles className="h-4 w-4 mr-1.5" /> Auto-seed
        </Button>
        <Button variant="outline" size="sm" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-1.5" /> Task
        </Button>
        {hasTasks && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
};
