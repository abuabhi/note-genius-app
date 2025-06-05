
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

export const TodaysFocusEmptyState = () => {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">All caught up!</h3>
        <p className="text-green-600 mb-4">No due items for today. Great job staying on top of things!</p>
        <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
          <Link to="/flashcards">
            Continue Studying
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
