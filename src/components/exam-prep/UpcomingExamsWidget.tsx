import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useExams } from '@/hooks/exams';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { calculateReadiness, daysUntil, type ExamTopic } from '@/types/exam';
import { ReadinessRing } from './ReadinessRing';
import { format } from 'date-fns';
import { getExamUrgency } from '@/utils/examUrgency';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const UpcomingExamsWidget: React.FC = () => {
  const { user } = useAuth();
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

  const { data: topicsByExam = {} } = useQuery({
    queryKey: ['exam-topics-widget', user?.id, upcoming.map(e => e.id).join(',')],
    enabled: !!user?.id && upcoming.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_topics')
        .select('exam_id, weight, status')
        .in('exam_id', upcoming.map(e => e.id));
      if (error) throw error;
      const grouped: Record<string, Pick<ExamTopic, 'weight' | 'status'>[]> = {};
      (data || []).forEach((t: any) => {
        (grouped[t.exam_id] ||= []).push({ weight: t.weight, status: t.status });
      });
      return grouped;
    },
  });

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
            const urgency = getExamUrgency(days);
            const readiness = calculateReadiness(topicsByExam[exam.id] ?? []);
            const subjectName = exam.subject_id ? subjectMap.get(exam.subject_id) : undefined;
            return (
              <Link
                key={exam.id}
                to={`/exam-prep/${exam.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition',
                  urgency.borderClass,
                )}
              >
                <ReadinessRing value={readiness} size={48} stroke={5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{exam.title}</div>
                    {urgency.emphasise && (
                      <Badge className={cn('shrink-0 text-[10px] px-1.5 py-0', urgency.badgeClass)}>
                        {urgency.label}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {subjectName ? `${subjectName} • ` : ''}
                    {format(new Date(exam.exam_date), 'PPP')}
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-semibold',
                    urgency.tone === 'overdue' && 'text-destructive',
                    urgency.tone === 'critical' && 'text-red-600',
                    urgency.tone === 'soon' && 'text-orange-600',
                    urgency.tone === 'upcoming' && 'text-amber-700',
                  )}
                >
                  {urgency.tone === 'overdue' ? `${Math.abs(days)}d ago` : `${days}d`}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
