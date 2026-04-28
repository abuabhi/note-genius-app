import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { GraduationCap } from 'lucide-react';
import { useExams } from '@/hooks/exams';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { ExamFormDialog } from '@/components/exam-prep/ExamFormDialog';
import { ExamCard } from '@/components/exam-prep/ExamCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet';
import type { Exam } from '@/types/exam';

const ExamPrepPage: React.FC = () => {
  const { exams, isLoading } = useExams();
  const { subjects } = useUserSubjects();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);

  const subjectMap = useMemo(
    () => new Map(subjects.map(s => [s.id, s.name])),
    [subjects],
  );

  const upcoming = exams.filter(e => e.status === 'upcoming');
  const past = exams.filter(e => e.status !== 'upcoming');

  const renderCard = (exam: Exam) => (
    <ExamCard
      key={exam.id}
      exam={exam}
      subjectName={exam.subject_id ? subjectMap.get(exam.subject_id) : undefined}
      onEdit={(e) => setEditing(e)}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <Helmet>
        <title>Exam Prep — Track topics, notes, flashcards & quizzes</title>
        <meta name="description" content="Plan upcoming exams, track topic readiness, and link your notes, flashcards, quizzes, and goals." />
      </Helmet>
      <StandardPageHeader
        title="Exam Prep"
        description="Track exam dates and link notes, flashcards, quizzes and goals. Add topics from inside an exam if you want detailed tracking."
        icon={<GraduationCap className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: 'Exam Prep' }]}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add exam
          </Button>
        }
      />

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading exams…</div>
        ) : exams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center bg-card/50">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No exams yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first exam. Subjects come from your settings.
            </p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add your first exam
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past / Archived ({past.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="grid gap-3">
              {upcoming.map(renderCard)}
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming exams.</p>}
            </TabsContent>
            <TabsContent value="past" className="grid gap-3">
              {past.map(renderCard)}
              {past.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ExamFormDialog open={showCreate} onOpenChange={setShowCreate} />
      <ExamFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        exam={editing}
      />
    </div>
  );
};

export default ExamPrepPage;
