
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
  }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
  };
  
  // Card behavior
  onClick?: () => void;
  onMouseEnter?: () => void;
  className?: string;
  isPinned?: boolean;
}

export const StandardListCard = ({
  title,
  description,
  menuActions,
  subjectName,
  subjectBadgeColor = "bg-mint-100 text-mint-800 border-mint-200",
  metadata = [],
  primaryAction,
  onClick,
  onMouseEnter,
  className = "",
  isPinned = false
}: StandardListCardProps) => {
  return (
    <Card 
      className={`
        group relative cursor-pointer transition-all duration-300 ease-out
        bg-white border border-gray-200/60 hover:border-mint-300/60
        hover:shadow-lg hover:shadow-mint-500/10 hover:-translate-y-0.5
        rounded-xl overflow-hidden
        ${isPinned ? 'ring-2 ring-yellow-300/50 border-yellow-300/60 bg-yellow-50/30' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-mint-50/20 pointer-events-none" />
      
      <div className="relative p-5 space-y-4">
        {/* Row 1: Title + Description + Menu */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title - Green color */}
            <h3 className="font-semibold text-green-700 text-base leading-tight line-clamp-1">
              {title}
            </h3>
            
            {/* Description - longer and more prominent */}
            {description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 pr-2">
                {description}
              </p>
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
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200/60">
                  {menuActions}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Row 2: Subject Badge + Metadata + Action Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Subject Badge - Enhanced styling */}
            <Badge className={`${subjectBadgeColor} border text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm`}>
              <Book className="h-3 w-3 mr-1.5" />
              {subjectName}
            </Badge>
            
            {/* Metadata - Green color */}
            <div className="flex items-center gap-4 min-w-0 overflow-hidden">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-green-600">
                  {item.icon}
                  <span className="truncate font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Button - Enhanced styling */}
          {primaryAction && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              className={primaryAction.className || "bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"}
              size="sm"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      
      {/* Subtle bottom border for separation */}
      <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
    </Card>
  );
};
