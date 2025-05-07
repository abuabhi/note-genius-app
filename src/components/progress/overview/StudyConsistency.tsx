
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudyConsistency = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Your Study Consistency</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="flex flex-wrap">
          {Array(30).fill(0).map((_, i) => {
            // Generate some fake data for the heatmap
            const intensity = Math.random();
            let bgColor = "bg-gray-100";
            
            if (intensity > 0.9) bgColor = "bg-green-500";
            else if (intensity > 0.7) bgColor = "bg-green-400";
            else if (intensity > 0.5) bgColor = "bg-green-300";
            else if (intensity > 0.3) bgColor = "bg-green-200";
            
            return (
              <div key={i} className="m-0.5 w-6 h-6 rounded-sm tooltip-container group relative cursor-pointer">
                <div className={`w-full h-full ${bgColor} rounded-sm`}></div>
                <div className="absolute invisible group-hover:visible bottom-7 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString()}:
                  {intensity > 0.5 ? " Studied" : " No activity"}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyConsistency;
