
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, Sparkles, ChevronDown } from "lucide-react";
import { Reminder } from "@/hooks/reminders/types";
import { ReminderCard } from "./ReminderCard";

interface ScalableRemindersListProps {
  reminders: Reminder[];
  loading: boolean;
  hasMore: boolean;
  onDismiss: (id: string) => void;
  onLoadMore: () => void;
  isReminderDismissing: (id: string) => boolean;
}

export const ScalableRemindersList = ({ 
  reminders, 
  loading, 
  hasMore,
  onDismiss, 
  onLoadMore,
  isReminderDismissing
}: ScalableRemindersListProps) => {
  const [expandedView, setExpandedView] = useState(false);

  const handleDismiss = useCallback(async (id: string) => {
    if (isReminderDismissing(id)) return;
    onDismiss(id);
  }, [onDismiss, isReminderDismissing]);

  if (loading && reminders.length === 0) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-mint-100 via-mint-50 to-mint-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="h-10 w-10 text-mint-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
          You're doing amazing! No pending reminders at the moment. Keep up the great work!
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-mint-300 rounded-full animate-pulse"></div>
          <span>Stay organized and focused</span>
          <div className="w-2 h-2 bg-mint-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  // Sort reminders by urgency and time
  const sortedReminders = [...reminders].sort((a, b) => {
    const now = new Date();
    const aOverdue = a.reminder_time && new Date(a.reminder_time) < now;
    const bOverdue = b.reminder_time && new Date(b.reminder_time) < now;
    
    // Overdue reminders first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then by reminder time
    if (a.reminder_time && b.reminder_time) {
      return new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime();
    }
    
    return 0;
  });
  
  // Show limited reminders initially for performance
  const displayedReminders = expandedView ? sortedReminders : sortedReminders.slice(0, 5);
  const remainingCount = sortedReminders.length - displayedReminders.length;
  
  // Check for overdue reminders
  const now = new Date();
  const overdueReminders = sortedReminders.filter(
    reminder => new Date(reminder.reminder_time) < now && reminder.status === 'pending'
  );
  
  return (
    <div className="space-y-4 p-4">
      {/* Overdue alert */}
      {overdueReminders.length > 0 && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 via-red-50 to-orange-50 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-100 rounded-full">
              <AlertTriangle className="h-3 w-3 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 text-sm">
                {overdueReminders.length} Overdue Reminder{overdueReminders.length !== 1 ? 's' : ''}
              </h4>
              <p className="text-red-700 text-xs">
                These reminders need your attention
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Reminders list */}
      <div className="space-y-3">
        {displayedReminders.map((reminder) => (
          <div key={reminder.id} className="relative">
            {isReminderDismissing(reminder.id) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-mint-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Dismissing...</span>
                </div>
              </div>
            )}
            <ReminderCard 
              reminder={reminder} 
              onDismiss={handleDismiss}
              compact={true}
            />
          </div>
        ))}
      </div>
      
      {/* Expand/Collapse button */}
      {remainingCount > 0 && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
            className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${expandedView ? 'rotate-180' : ''}`} />
            {expandedView ? 'Show Less' : `Show ${remainingCount} More`}
          </Button>
        </div>
      )}

      {/* Load More button for pagination */}
      {hasMore && expandedView && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={loading}
            className="text-xs"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                Loading...
              </>
            ) : (
              'Load More Reminders'
            )}
          </Button>
        </div>
      )}
      
      {/* Performance footer */}
      {sortedReminders.length > 10 && (
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <div className="w-1 h-1 bg-mint-400 rounded-full animate-pulse"></div>
            <span>Showing {displayedReminders.length} of {sortedReminders.length} reminders</span>
            <div className="w-1 h-1 bg-mint-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};
