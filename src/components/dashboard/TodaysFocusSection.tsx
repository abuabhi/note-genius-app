
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, BookOpen, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const TodaysFocusSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="mb-6">
            <Target className="h-16 w-16 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">Ready for a fresh start!</h3>
          <p className="text-gray-500 mb-6">
            Your workspace has been cleared. Start building your study routine with notes, goals, and todos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/notes">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Note
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/goals">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/todos">
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Todo
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
