import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Exam } from '@/types/exam';
import { daysUntil, getExamPhase } from '@/types/exam';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ExamCardProps {
  exam: Exam;
  /** Optional — only used when caller wants to surface readiness badge inline. */
  readiness?: number;
  subjectName?: string;
  onEdit?: (exam: Exam) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, subjectName, onEdit }) => {
  const days = daysUntil(exam.exam_date);
  const phase = getExamPhase(exam.exam_date);
  const isUpcoming = exam.status === 'upcoming';

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow border-border bg-card',
        isUpcoming && phase.phase !== 'scheduled' && 'border-l-4',
        phase.phase === 'today' && 'border-l-red-500',
        phase.phase === 'tomorrow' && 'border-l-orange-500',
        phase.phase === 'this-week' && 'border-l-amber-400',
        phase.phase === 'coming-up' && 'border-l-blue-500',
        phase.phase === 'past' && 'border-l-muted',
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Link to={`/exam-prep/${exam.id}`} className="flex-1 min-w-0 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{exam.title}</h3>
              {subjectName && <Badge variant="secondary">{subjectName}</Badge>}
              {isUpcoming ? (
                <Badge className={phase.pillClass}>{phase.label}</Badge>
              ) : (
                <Badge variant="outline">{exam.status}</Badge>
              )}
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
          <div className="text-right shrink-0">
            <div
              className={cn(
                'text-lg font-semibold',
                phase.phase === 'past' && 'text-muted-foreground',
                phase.phase === 'today' && 'text-red-600',
                phase.phase === 'tomorrow' && 'text-orange-600',
                phase.phase === 'this-week' && 'text-amber-700',
                phase.phase === 'coming-up' && 'text-foreground',
              )}
            >
              {phase.phase === 'past'
                ? `${Math.abs(days)}d ago`
                : phase.phase === 'today'
                  ? 'Today'
                  : `${days}d`}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {phase.phase === 'past' ? 'past' : phase.phase === 'today' ? '' : 'to go'}
            </div>
          </div>
        </Link>
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(exam);
            }}
            aria-label="Edit exam"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
