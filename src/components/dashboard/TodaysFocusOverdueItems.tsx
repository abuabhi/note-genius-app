
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';

interface OverdueItem {
  id: string;
  title: string;
  due_date: string;
}

interface TodaysFocusOverdueItemsProps {
  overdueItems: OverdueItem[];
}

export const TodaysFocusOverdueItems = ({ overdueItems }: TodaysFocusOverdueItemsProps) => {
  if (overdueItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="font-medium text-red-800">Overdue Items</span>
      </div>
      <div className="space-y-2">
        {overdueItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white rounded p-2">
            <div>
              <div className="font-medium text-red-800">{item.title}</div>
              <div className="text-xs text-red-600">
                Due {formatDistanceToNow(parseISO(item.due_date), { addSuffix: true })}
              </div>
            </div>
            <Badge variant="destructive">Overdue</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
