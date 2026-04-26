import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useExams } from '@/hooks/exams';

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (examId: string) => void;
}

export const ExamFormDialog: React.FC<ExamFormDialogProps> = ({ open, onOpenChange, onCreated }) => {
  const { subjects } = useUserSubjects();
  const { createExam } = useExams();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [examDate, setExamDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState(80);
  const [remind7, setRemind7] = useState(true);
  const [remind3, setRemind3] = useState(true);
  const [remind1, setRemind1] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle(''); setSubjectId(''); setExamDate('');
    setLocation(''); setNotes(''); setTarget(80);
    setRemind7(true); setRemind3(true); setRemind1(true);
  };

  const submit = async () => {
    if (!title.trim() || !examDate) return;
    setSubmitting(true);
    try {
      const reminderDaysBefore = [
        remind7 ? 7 : null,
        remind3 ? 3 : null,
        remind1 ? 1 : null,
      ].filter((d): d is number => d !== null);

      const exam = await createExam({
        title: title.trim(),
        subject_id: subjectId || null,
        exam_date: new Date(examDate).toISOString(),
        location: location.trim() || null,
        notes: notes.trim() || null,
        target_readiness: target,
        createCalendarEvent: true,
        reminderDaysBefore,
      });
      reset();
      onOpenChange(false);
      onCreated?.(exam.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an exam</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Title</Label>
            <Input id="exam-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Maths Mid-Term" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Manage subjects in Settings.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-date">Exam date</Label>
              <Input id="exam-date" type="datetime-local" value={examDate} onChange={e => setExamDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exam-loc">Location</Label>
              <Input id="exam-loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="Room 204" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-target">Target readiness (%)</Label>
              <Input id="exam-target" type="number" min={0} max={100} value={target} onChange={e => setTarget(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-notes">Notes</Label>
            <Textarea id="exam-notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Remind me before exam</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={remind7} onCheckedChange={v => setRemind7(!!v)} /> 7 days
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={remind3} onCheckedChange={v => setRemind3(!!v)} /> 3 days
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={remind1} onCheckedChange={v => setRemind1(!!v)} /> 1 day
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !title.trim() || !examDate}>
            {submitting ? 'Adding…' : 'Add exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
