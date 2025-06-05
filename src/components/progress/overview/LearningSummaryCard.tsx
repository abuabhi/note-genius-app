
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface LearningSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tooltip: string;
}

const LearningSummaryCard = ({ title, value, icon: Icon, tooltip }: LearningSummaryCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="cursor-help hover:shadow-md transition-shadow">
            <CardHeader className="pb-1">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LearningSummaryCard;
