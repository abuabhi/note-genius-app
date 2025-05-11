
import React from 'react';
import { Award, FileText, Calendar, Hash, Star, Layers, Book, Check, Gift, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AchievementItemProps {
  name: string;
  description: string;
  icon: string;
  type: string;
  date?: string;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({
  name,
  description,
  icon,
  type,
  date
}) => {
  // Map achievement types to colors
  const typeColor = {
    'note': 'bg-blue-100 text-blue-800',
    'flashcard': 'bg-green-100 text-green-800',
    'quiz': 'bg-purple-100 text-purple-800',
    'study': 'bg-amber-100 text-amber-800',
    'streak': 'bg-red-100 text-red-800',
    'general': 'bg-gray-100 text-gray-800',
  };
  
  // Map icon strings to actual Lucide icon components
  const iconMap: Record<string, React.ReactNode> = {
    'Award': <Award className="h-5 w-5" />,
    'FileText': <FileText className="h-5 w-5" />,
    'CalendarDays': <Calendar className="h-5 w-5" />,
    'Hash': <Hash className="h-5 w-5" />,
    'Star': <Star className="h-5 w-5" />,
    'Layers': <Layers className="h-5 w-5" />,
    'Book': <Book className="h-5 w-5" />,
    'Check': <Check className="h-5 w-5" />,
    'Gift': <Gift className="h-5 w-5" />,
    'Target': <Target className="h-5 w-5" />,
  };

  // Generate a date string if a date is provided
  const dateString = date 
    ? formatDistanceToNow(new Date(date), { addSuffix: true }) 
    : '';

  const selectedType = type in typeColor ? type : 'general';
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <div className={cn('flex items-center justify-center p-2 rounded-full', typeColor[selectedType])}>
        {icon in iconMap ? iconMap[icon] : <Award className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {dateString && (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {dateString}
        </div>
      )}
    </div>
  );
};
