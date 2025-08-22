import React from "react";
import { MoreVertical, Clock, Target, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StudyPlan } from '@/types/studyPlanner';

interface StudyPlanActionsMenuProps {
  studyPlan: StudyPlan;
  isConverting: boolean;
  isDeleting: boolean;
  onAddOfflineStudy: () => void;
  onConvertToGoal: () => void;
  onSettings: () => void;
  onDelete: () => void;
}

export const StudyPlanActionsMenu = ({
  studyPlan,
  isConverting,
  isDeleting,
  onAddOfflineStudy,
  onConvertToGoal,
  onSettings,
  onDelete
}: StudyPlanActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background shadow-xl border-gray-200/60 z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAddOfflineStudy();
          }}
          className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
        >
          <Clock className="h-4 w-4 mr-3 text-blue-600" />
          Add Offline Study Time
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onConvertToGoal();
          }}
          disabled={isConverting || studyPlan.is_converted_to_goals}
          className="cursor-pointer hover:bg-mint-50 hover:text-mint-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="h-4 w-4 mr-3 text-mint-600" />
          {isConverting ? 'Converting...' : 'Convert to Goal'}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
          className="cursor-pointer hover:bg-gray-50 hover:text-gray-700"
        >
          <Settings className="h-4 w-4 mr-3 text-gray-600" />
          Session Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="cursor-pointer hover:bg-red-50 hover:text-red-700 text-red-600 focus:bg-red-50 focus:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4 mr-3" />
          {isDeleting ? 'Deleting...' : 'Delete Plan'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};