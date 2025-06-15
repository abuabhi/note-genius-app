
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const GoalsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mb-4">
            <Target className="h-12 w-12 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
          <p className="text-gray-500 mb-4">
            Set your first study goal to track your progress and stay motivated.
          </p>
          <Button asChild>
            <Link to="/goals">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
