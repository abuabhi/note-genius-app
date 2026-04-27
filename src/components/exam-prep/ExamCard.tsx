import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReadinessRing } from './ReadinessRing';
import { format } from 'date-fns';
import type { Exam } from '@/types/exam';
import { daysUntil } from '@/types/exam';
import { getExamUrgency } from '@/utils/examUrgency';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: Exam;
  readiness: number;
  subjectName?: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, readiness, subjectName }) => {
  const days = daysUntil(exam.exam_date);
  const urgency = getExamUrgency(days);
  const isUpcoming = exam.status === 'upcoming';

  return (
    <Link to={`/exam-prep/${exam.id}`}>
      <Card
        className={cn(
          'hover:shadow-md transition-shadow border-border bg-card',
          isUpcoming && urgency.borderClass,
        )}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <ReadinessRing value={readiness} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{exam.title}</h3>
              {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
              {isUpcoming && urgency.emphasise && (
                <Badge className={urgency.badgeClass}>{urgency.label}</Badge>
              )}
              {!isUpcoming && <Badge variant="outline">{exam.status}</Badge>}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(exam.exam_date), 'PPP')}
              </span>
              {exam.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {exam.location}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                'text-lg font-semibold',
                urgency.tone === 'overdue' && 'text-destructive',
                urgency.tone === 'critical' && 'text-red-600',
                urgency.tone === 'soon' && 'text-orange-600',
                urgency.tone === 'upcoming' && 'text-amber-700',
                urgency.tone === 'later' && 'text-foreground',
              )}
            >
              {urgency.tone === 'overdue' ? `${Math.abs(days)}d ago` : `${days}d`}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {urgency.tone === 'overdue' ? 'past' : 'to go'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
