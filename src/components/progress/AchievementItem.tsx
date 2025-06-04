
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
  points?: number;
  isEarned?: boolean;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({
  name,
  description,
  icon,
  type,
  date,
  points = 0,
  isEarned = false
}) => {
  // Map achievement types to colors
  const typeColor = {
    'note': 'bg-blue-100 text-blue-800 border-blue-200',
    'flashcard': 'bg-green-100 text-green-800 border-green-200',
    'quiz': 'bg-purple-100 text-purple-800 border-purple-200',
    'study': 'bg-amber-100 text-amber-800 border-amber-200',
    'streak': 'bg-red-100 text-red-800 border-red-200',
    'goal': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'general': 'bg-gray-100 text-gray-800 border-gray-200',
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
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200",
      isEarned 
        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-md" 
        : "bg-white border-gray-200 hover:bg-gray-50"
    )}>
      <div className={cn(
        'flex items-center justify-center p-3 rounded-full border-2', 
        isEarned ? 'bg-yellow-200 border-yellow-300' : typeColor[selectedType]
      )}>
        {icon in iconMap ? iconMap[icon] : <Award className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{name}</h4>
          <div className="flex items-center gap-2">
            {points > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                <Star className="h-3 w-3" />
                {points}
              </div>
            )}
            {isEarned && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <Check className="h-3 w-3" />
                Earned
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {dateString && (
          <div className="text-xs text-muted-foreground mt-2">
            {dateString}
          </div>
        )}
      </div>
    </div>
  );
};
