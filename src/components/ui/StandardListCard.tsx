
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StandardListCardProps {
  // Primary information (Row 1)
  title: string;
  description?: string;
  menuActions?: React.ReactNode;
  
  // Secondary information (Row 2)
  subjectName: string;
  subjectBadgeColor?: string;
  metadata?: Array<{
    icon?: React.ReactNode;
    label: string;
    className?: string;
  }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
  };
  
  // Card behavior
  onClick?: () => void;
  className?: string;
  isPinned?: boolean;
}

export const StandardListCard = ({
  title,
  description,
  menuActions,
  subjectName,
  subjectBadgeColor = "bg-mint-100 text-mint-700",
  metadata = [],
  primaryAction,
  onClick,
  className = "",
  isPinned = false
}: StandardListCardProps) => {
  return (
    <Card 
      className={`
        group relative cursor-pointer bg-white border border-gray-200 
        hover:border-gray-300 hover:shadow-sm transition-all duration-200 rounded-lg
        ${isPinned ? 'ring-1 ring-yellow-300 border-yellow-300' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Row 1: Title + Description + Menu */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm truncate flex-shrink-0">
              {title}
            </h3>
            
            {/* Description */}
            {description && (
              <span className="text-xs text-gray-500 truncate flex-1 min-w-0">
                {description}
              </span>
            )}
          </div>
          
          {/* Menu Actions */}
          {menuActions && (
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {menuActions}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Row 2: Subject Badge + Metadata + Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Subject Badge */}
            <Badge className={`${subjectBadgeColor} border-0 text-xs font-medium flex-shrink-0`}>
              <Book className="h-3 w-3 mr-1" />
              {subjectName}
            </Badge>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 min-w-0">
              {metadata.map((item, index) => (
                <div key={index} className={`flex items-center gap-1 text-xs text-gray-500 ${item.className || ''}`}>
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Button (bottom right) */}
          {primaryAction && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              className={primaryAction.className || "bg-mint-600 hover:bg-mint-700 text-white px-3 py-1 h-7 text-xs"}
              size="sm"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
