
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateTodoData, TodoPriority, RecurrenceType } from "@/hooks/todos/types";
import { SmartDatePicker } from "./SmartDatePicker";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { TemplateSelector } from "./TemplateSelector";
import { DependencySelector } from "./DependencySelector";
import { useSmartSuggestions } from "@/hooks/todos/useSmartSuggestions";
import { useTodos } from "@/hooks/useTodos";
import { Plus, Sparkles, X } from "lucide-react";

interface TodoFormProps {
  onSubmit: (data: CreateTodoData) => Promise<void>;
  isSubmitting: boolean;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [reminderTime, setReminderTime] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();
  const [dependencyId, setDependencyId] = useState<string | undefined>();
  const [autoTags, setAutoTags] = useState<string[]>([]);

  const { getAutoTags } = useSmartSuggestions();
  const { todos } = useTodos();

  // Auto-generate tags when title or description changes
  useEffect(() => {
    if (title.trim()) {
      const suggestedTags = getAutoTags(title, description);
      setAutoTags(suggestedTags);
    }
  }, [title, description, getAutoTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const todoData: CreateTodoData = {
      title,
      description: description || undefined,
      reminder_time: reminderTime,
      due_date: dueDate,
      priority,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      recurrence_end_date: recurrenceEndDate,
      depends_on_todo_id: dependencyId,
    };

    await onSubmit(todoData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setReminderTime(undefined);
    setDueDate(undefined);
    setRecurrence("none");
    setRecurrenceEndDate(undefined);
    setDependencyId(undefined);
    setAutoTags([]);
  };

  const removeTag = (tagToRemove: string) => {
    setAutoTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Todo
          </CardTitle>
          <TemplateSelector />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
            />
          </div>

          {/* Auto Tags */}
          {autoTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Auto-suggested tags</Label>
              </div>
              <div className="flex flex-wrap gap-1">
                {autoTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: TodoPriority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <SmartDatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="When is this due?"
            />
          </div>

          {/* Reminder Time */}
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <SmartDatePicker
              date={reminderTime}
              onDateChange={setReminderTime}
              placeholder="When to remind you?"
            />
          </div>

          {/* Recurrence */}
          <RecurrenceSelector
            value={recurrence}
            onValueChange={setRecurrence}
            endDate={recurrenceEndDate}
            onEndDateChange={setRecurrenceEndDate}
          />

          {/* Dependencies */}
          <DependencySelector
            todos={todos}
            value={dependencyId}
            onValueChange={setDependencyId}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Todo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
