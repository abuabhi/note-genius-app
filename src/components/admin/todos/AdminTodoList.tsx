import React, { useMemo, useState } from 'react';
import { useAdminTodos } from '@/hooks/admin/useAdminTodos';
import { AdminTodoItem } from './AdminTodoItem';
import { AdminTodoFormDialog } from './AdminTodoFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader, ChevronDown, ChevronRight } from 'lucide-react';
import type { AdminTodo, AdminTodoStatus } from '@/types/adminTodo';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const AdminTodoList: React.FC = () => {
  const { todos, isLoading, createTodo, updateTodo, deleteTodo, setStatus } = useAdminTodos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTodo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminTodo | null>(null);
  const [showDone, setShowDone] = useState(false);

  const grouped = useMemo(() => {
    const g: Record<AdminTodoStatus, AdminTodo[]> = { todo: [], in_progress: [], done: [] };
    todos.forEach(t => g[t.status].push(t));
    return g;
  }, [todos]);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (t: AdminTodo) => { setEditing(t); setDialogOpen(true); };

  const handleToggle = (t: AdminTodo) => {
    setStatus(t.id, t.status === 'done' ? 'todo' : 'done');
  };

  const handleSubmit = async (input: any) => {
    if (editing) {
      await updateTodo({ id: editing.id, ...input });
    } else {
      await createTodo(input);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {grouped.todo.length} to do · {grouped.in_progress.length} in progress · {grouped.done.length} done
        </p>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New task
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">In Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {grouped.in_progress.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nothing in progress.</p>
          ) : grouped.in_progress.map(t => (
            <AdminTodoItem key={t.id} todo={t}
              onToggleDone={handleToggle} onChangeStatus={(t, s) => setStatus(t.id, s)}
              onEdit={openEdit} onDelete={setConfirmDelete} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">To Do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {grouped.todo.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No open tasks. Click "New task" to add one.</p>
          ) : grouped.todo.map(t => (
            <AdminTodoItem key={t.id} todo={t}
              onToggleDone={handleToggle} onChangeStatus={(t, s) => setStatus(t.id, s)}
              onEdit={openEdit} onDelete={setConfirmDelete} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowDone(v => !v)}>
          <CardTitle className="text-base flex items-center gap-2">
            {showDone ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Done ({grouped.done.length})
          </CardTitle>
        </CardHeader>
        {showDone && (
          <CardContent className="space-y-2">
            {grouped.done.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No completed tasks yet.</p>
            ) : grouped.done.map(t => (
              <AdminTodoItem key={t.id} todo={t}
                onToggleDone={handleToggle} onChangeStatus={(t, s) => setStatus(t.id, s)}
                onEdit={openEdit} onDelete={setConfirmDelete} />
            ))}
          </CardContent>
        )}
      </Card>

      <AdminTodoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) await deleteTodo(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
