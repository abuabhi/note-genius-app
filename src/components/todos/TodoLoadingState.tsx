
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const TodoLoadingState = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
