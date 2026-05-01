import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import type { GanttPlan } from '@/types/gantt';
import type { Exam } from '@/types/exam';
import { toast } from 'sonner';

interface Props {
  plans: GanttPlan[];
  currentPlanId: string | null;
  exams: Exam[];
  onSelect: (id: string) => void;
  onCreate: (input: { title: string; examId: string | null }) => Promise<GanttPlan | void>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const PlanSwitcher = ({
  plans,
  currentPlanId,
  exams,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) => {
  const current = plans.find((p) => p.id === currentPlanId) ?? null;
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [examId, setExamId] = useState<string>('none');

  const openCreate = () => {
    setTitle('');
    setExamId('none');
    setCreateOpen(true);
  };

  const openRename = () => {
    if (!current) return;
    setTitle(current.title);
    setRenameOpen(true);
  };

  const submitCreate = async () => {
    const t = title.trim();
    if (!t) return;
    const created = await onCreate({
      title: t,
      examId: examId === 'none' ? null : examId,
    });
    setCreateOpen(false);
    if (created) onSelect(created.id);
  };

  const submitRename = async () => {
    if (!current) return;
    const t = title.trim();
    if (!t) return;
    await onRename(current.id, t);
    setRenameOpen(false);
  };

  const handleDelete = async () => {
    if (!current) return;
    if (!confirm(`Delete plan "${current.title}"? All its tasks will be removed.`)) return;
    await onDelete(current.id);
    toast.success('Plan deleted');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[240px] justify-between">
              <span className="truncate">{current?.title ?? 'Select a plan'}</span>
              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            <DropdownMenuLabel>Your plans</DropdownMenuLabel>
            {plans.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No plans yet</div>
            )}
            {plans.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={p.id === currentPlanId ? 'bg-accent' : ''}
              >
                <span className="truncate">{p.title}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New plan…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {current && (
          <>
            <Button variant="ghost" size="icon" onClick={openRename} title="Rename plan">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete plan"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> New plan
        </Button>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Gantt plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-title">Title</Label>
              <Input
                id="plan-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Methods — Oct exam"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Link to exam (optional)</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (standalone)</SelectItem>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={submitCreate} disabled={!title.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename plan</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={submitRename} disabled={!title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
