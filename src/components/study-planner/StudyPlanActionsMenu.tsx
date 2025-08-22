import React from "react";
import { MoreVertical, Clock, Target, Settings, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudyPlan } from '@/types/studyPlanner';

interface StudyPlanActionsMenuProps {
  studyPlan: StudyPlan;
  isConverting: boolean;
  isDeleting: boolean;
  onConvertToGoal: () => void;
  onSettings: () => void;
  onDelete: () => void;
}

export const StudyPlanActionsMenu = ({
  studyPlan,
  isConverting,
  isDeleting,
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!studyPlan.is_converted_to_goals && !isConverting) {
                      onConvertToGoal();
                    }
                  }}
                  disabled={isConverting || studyPlan.is_converted_to_goals}
                  className={`cursor-pointer ${
                    studyPlan.is_converted_to_goals 
                      ? 'hover:bg-green-50 hover:text-green-700 text-green-600 disabled:opacity-100 disabled:cursor-default' 
                      : 'hover:bg-mint-50 hover:text-mint-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {studyPlan.is_converted_to_goals ? (
                    <CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />
                  ) : (
                    <Target className="h-4 w-4 mr-3 text-mint-600" />
                  )}
                  {isConverting 
                    ? 'Converting...' 
                    : studyPlan.is_converted_to_goals 
                      ? 'Already Converted' 
                      : 'Convert to Goal'}
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {studyPlan.is_converted_to_goals && (
              <TooltipContent>
                <p>This study plan has already been converted to a goal</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
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