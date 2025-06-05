
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Target } from "lucide-react";

export const TodaysFocusQuickActions = () => {
  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t">
      <Button asChild variant="outline">
        <Link to="/reminders">
          <Calendar className="h-4 w-4 mr-2" />
          View All Reminders
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/goals">
          <Target className="h-4 w-4 mr-2" />
          Manage Goals
        </Link>
      </Button>
    </div>
  );
};
