
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const TodosSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          Today's Todos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mb-4">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first todo to get started with task management.
          </p>
          <Button asChild>
            <Link to="/todos">
              <Plus className="h-4 w-4 mr-2" />
              Create Todo
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
