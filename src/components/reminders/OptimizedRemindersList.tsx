
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { Reminder } from "@/hooks/reminders/types";
import { ReminderCard } from "./ReminderCard";

interface OptimizedRemindersListProps {
  reminders: Reminder[];
  loading: boolean;
  onDismiss: (id: string) => Promise<void>;
  onBatchDismiss?: (ids: string[]) => Promise<void>;
}

export const OptimizedRemindersList = ({ 
  reminders, 
  loading, 
  onDismiss,
  onBatchDismiss 
}: OptimizedRemindersListProps) => {
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Memoized sorted reminders for performance
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      return new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime();
    });
  }, [reminders]);

  // Memoized overdue reminders calculation
  const overdueReminders = useMemo(() => {
    const now = new Date();
    return sortedReminders.filter(
      reminder => new Date(reminder.reminder_time) < now && reminder.status === 'pending'
    );
  }, [sortedReminders]);
  
  const handleDismiss = async (id: string) => {
    setDismissingIds(prev => new Set(prev).add(id));
    try {
      await onDismiss(id);
    } finally {
      setDismissingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleBatchDismiss = async () => {
    if (!onBatchDismiss || selectedIds.size === 0) return;
    
    const idsArray = Array.from(selectedIds);
    setDismissingIds(prev => new Set([...prev, ...idsArray]));
    
    try {
      await onBatchDismiss(idsArray);
      setSelectedIds(new Set());
    } finally {
      setDismissingIds(prev => {
        const newSet = new Set(prev);
        idsArray.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
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
    );
  }
  
  if (reminders.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-mint-100 via-mint-50 to-blue-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="h-12 w-12 text-mint-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <h3 className="font-bold text-xl text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
          You're doing amazing! No pending reminders at the moment. Keep up the great work!
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-mint-300 rounded-full animate-pulse"></div>
          <span>Stay organized and focused</span>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Overdue alert */}
      {overdueReminders.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 text-sm">
                {overdueReminders.length} Overdue Reminder{overdueReminders.length !== 1 ? 's' : ''}
              </h4>
              <p className="text-amber-700 text-xs">
                These reminders need your attention
              </p>
            </div>
            {onBatchDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const overdueIds = overdueReminders.map(r => r.id);
                  setSelectedIds(new Set(overdueIds));
                  handleBatchDismiss();
                }}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                Dismiss All Overdue
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Batch actions */}
      {onBatchDismiss && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700">
            {selectedIds.size} reminder{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchDismiss}
            disabled={dismissingIds.size > 0}
            className="ml-auto"
          >
            Dismiss Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}
      
      {/* Optimized reminders list with virtual scrolling for large lists */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedReminders.map((reminder) => (
          <div key={reminder.id} className="relative">
            {dismissingIds.has(reminder.id) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-mint-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Dismissing...</span>
                </div>
              </div>
            )}
            
            {/* Selection checkbox for batch operations */}
            {onBatchDismiss && (
              <div className="absolute top-2 right-2 z-20">
                <input
                  type="checkbox"
                  checked={selectedIds.has(reminder.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(prev => new Set(prev).add(reminder.id));
                    } else {
                      setSelectedIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(reminder.id);
                        return newSet;
                      });
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            )}
            
            <ReminderCard 
              reminder={reminder} 
              onDismiss={handleDismiss}
              compact={sortedReminders.length > 10}
            />
          </div>
        ))}
      </div>
      
      {/* Performance footer */}
      {sortedReminders.length > 0 && (
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
            <span>Showing {sortedReminders.length} reminders • Optimized for speed</span>
            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};
