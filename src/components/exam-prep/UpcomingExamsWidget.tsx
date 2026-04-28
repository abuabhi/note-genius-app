import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Plus, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useExams } from '@/hooks/exams';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { daysUntil, getExamPhase } from '@/types/exam';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const UpcomingExamsWidget: React.FC = () => {
  const { exams, isLoading } = useExams();
  const { subjects } = useUserSubjects();

  const upcoming = useMemo(
    () => exams.filter(e => e.status === 'upcoming').slice(0, 3),
    [exams],
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map(s => [s.id, s.name])),
    [subjects],
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          Upcoming Exams
        </CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link to="/exam-prep">
            View all
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">No exams scheduled yet.</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/exam-prep">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add an exam
              </Link>
            </Button>
          </div>
        ) : (
          upcoming.map(exam => {
            const days = daysUntil(exam.exam_date);
            const phase = getExamPhase(exam.exam_date);
            const subjectName = exam.subject_id ? subjectMap.get(exam.subject_id) : undefined;
            return (
              <Link
                key={exam.id}
                to={`/exam-prep/${exam.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition border-l-4',
                  phase.phase === 'today' && 'border-l-red-500',
                  phase.phase === 'tomorrow' && 'border-l-orange-500',
                  phase.phase === 'this-week' && 'border-l-amber-400',
                  phase.phase === 'coming-up' && 'border-l-blue-500',
                  phase.phase === 'scheduled' && 'border-l-border',
                )}
              >
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <CalIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{exam.title}</div>
                    <Badge className={cn('shrink-0 text-[10px] px-1.5 py-0', phase.pillClass)}>
                      {phase.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {subjectName ? `${subjectName} • ` : ''}
                    {format(new Date(exam.exam_date), 'PPP')}
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-semibold shrink-0',
                    phase.phase === 'today' && 'text-red-600',
                    phase.phase === 'tomorrow' && 'text-orange-600',
                    phase.phase === 'this-week' && 'text-amber-700',
                  )}
                >
                  {phase.phase === 'today' ? 'Today' : `${days}d`}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
