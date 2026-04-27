import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, MapPin, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { useExam, useExams, useExamTopics } from '@/hooks/exams';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { ReadinessRing } from '@/components/exam-prep/ReadinessRing';
import { TopicRow } from '@/components/exam-prep/TopicRow';
import { ExamRemindersPanel } from '@/components/exam-prep/ExamRemindersPanel';
import { calculateReadiness, daysUntil } from '@/types/exam';
import { confirmDialog } from '@/components/ui/confirm-dialog';
import { getExamUrgency } from '@/utils/examUrgency';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExam(id);
  const { deleteExam } = useExams();
  const { topics, addTopic } = useExamTopics(id);
  const { subjects } = useUserSubjects();
  const [newTopic, setNewTopic] = useState('');

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

  const days = daysUntil(exam.exam_date);
  const urgency = getExamUrgency(days);
  const overdue = days < 0;
  const onTrack = readiness >= exam.target_readiness;

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
              <ReadinessRing value={readiness} size={96} stroke={8} label="ready" />
              <div className="flex-1 min-w-[240px] space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-semibold">{exam.title}</h1>
                  {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <CalIcon className="h-4 w-4" />
                    {format(new Date(exam.exam_date), 'PPPp')}
                  </span>
                  {exam.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {exam.location}
                    </span>
                  )}
                </div>
                {exam.notes && <p className="text-sm text-foreground/80">{exam.notes}</p>}

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Target readiness {exam.target_readiness}%</span>
                    <span className={overdue ? 'text-destructive' : ''}>
                      {overdue ? `${Math.abs(days)} days past` : `${days} days to go`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (readiness / Math.max(1, exam.target_readiness)) * 100)} />
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
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

        <ExamRemindersPanel exam={exam} />
      </div>

    </div>
  );
};

export default ExamDetailPage;
