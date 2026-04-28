import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, MapPin, GraduationCap, Pencil, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useExam, useExams, useExamTopics } from '@/hooks/exams';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { ReadinessRing } from '@/components/exam-prep/ReadinessRing';
import { TopicRow } from '@/components/exam-prep/TopicRow';
import { ExamRemindersPanel } from '@/components/exam-prep/ExamRemindersPanel';
import { ExamFormDialog } from '@/components/exam-prep/ExamFormDialog';
import { calculateReadiness, getExamPhase } from '@/types/exam';
import { confirmDialog } from '@/components/ui/confirm-dialog';

const advancedKey = (id: string) => `examPrep:advanced:${id}`;

const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExam(id);
  const { deleteExam } = useExams();
  const { topics, addTopic } = useExamTopics(id);
  const { subjects } = useUserSubjects();
  const [newTopic, setNewTopic] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  // Persist advanced toggle per exam.
  useEffect(() => {
    if (!id) return;
    try {
      setAdvanced(localStorage.getItem(advancedKey(id)) === '1');
    } catch {
      // ignore
    }
  }, [id]);

  const toggleAdvanced = (next: boolean) => {
    setAdvanced(next);
    if (!id) return;
    try {
      localStorage.setItem(advancedKey(id), next ? '1' : '0');
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this exam?',
      description: 'This removes the exam, its topics, and the matching calendar event. Linked notes, flashcards, quizzes and goals are not deleted.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await deleteExam(exam!);
    navigate('/exam-prep');
  };

  const subjectName = useMemo(
    () => exam?.subject_id ? subjects.find(s => s.id === exam.subject_id)?.name : undefined,
    [subjects, exam?.subject_id],
  );

  const readiness = useMemo(() => calculateReadiness(topics), [topics]);

  if (isLoading || !exam) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  const phase = getExamPhase(exam.exam_date);

  const handleAdd = async () => {
    const name = newTopic.trim();
    if (!name) return;
    await addTopic({ name });
    setNewTopic('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <Helmet>
        <title>{exam.title} — Exam Prep</title>
      </Helmet>
      <div className="container mx-auto px-6 py-6 max-w-4xl space-y-6">
        <Button variant="ghost" onClick={() => navigate('/exam-prep')} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> All exams
        </Button>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex-1 min-w-[240px] space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-semibold">{exam.title}</h1>
                  {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
                  {exam.status === 'upcoming' && (
                    <Badge className={phase.pillClass}>{phase.label}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <CalIcon className="h-4 w-4" />
                    {format(new Date(exam.exam_date), 'PPP')}
                  </span>
                  {exam.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {exam.location}
                    </span>
                  )}
                </div>
                {exam.notes && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{exam.notes}</p>}

                <div className="pt-1">
                  <div className="text-3xl font-bold tracking-tight">
                    {phase.countdown}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="advanced-toggle" className="text-sm font-medium cursor-pointer">
                  Advanced tracking
                </Label>
                <span className="text-xs text-muted-foreground">
                  Break the exam into topics and track your confidence per topic.
                </span>
              </div>
              <Switch id="advanced-toggle" checked={advanced} onCheckedChange={toggleAdvanced} />
            </div>
          </CardContent>
        </Card>

        {advanced && (
          <>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-6 flex-wrap">
                  <ReadinessRing value={readiness} size={88} stroke={8} label="ready" />
                  <div className="flex-1 min-w-[200px] text-sm text-muted-foreground">
                    Readiness is the weighted average of your topic confidence below. Mark topics as
                    Learning, Reviewing or Confident to update it.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Topics</h2>
                  <span className="text-xs text-muted-foreground">{topics.length} total</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="Add a topic (e.g. Calculus — limits)"
                  />
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {topics.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      No topics yet. Add the first one above.
                    </p>
                  ) : (
                    topics.map(t => (
                      <TopicRow key={t.id} topic={t} examId={exam.id} examSubjectName={subjectName} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <ExamRemindersPanel exam={exam} />
      </div>

      <ExamFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        exam={exam}
      />
    </div>
  );
};

export default ExamDetailPage;
