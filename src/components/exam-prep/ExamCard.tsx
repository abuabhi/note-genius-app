import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReadinessRing } from './ReadinessRing';
import { format } from 'date-fns';
import type { Exam } from '@/types/exam';
import { daysUntil } from '@/types/exam';

interface ExamCardProps {
  exam: Exam;
  readiness: number;
  subjectName?: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, readiness, subjectName }) => {
  const days = daysUntil(exam.exam_date);
  const overdue = days < 0;

  return (
    <Link to={`/exam-prep/${exam.id}`}>
      <Card className="hover:shadow-md transition-shadow border-border bg-card">
        <CardContent className="p-4 flex items-center gap-4">
          <ReadinessRing value={readiness} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{exam.title}</h3>
              {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
              {exam.status !== 'upcoming' && <Badge variant="outline">{exam.status}</Badge>}
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
            <div className={`text-lg font-semibold ${overdue ? 'text-destructive' : 'text-foreground'}`}>
              {overdue ? `${Math.abs(days)}d ago` : `${days}d`}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {overdue ? 'past' : 'to go'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
