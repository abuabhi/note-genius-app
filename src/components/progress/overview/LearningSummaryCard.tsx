
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface LearningSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  changeText: string;
}

const LearningSummaryCard = ({ title, value, icon: Icon, changeText }: LearningSummaryCardProps) => {
  return (
    <Card>
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
        <p className="text-xs text-muted-foreground">{changeText}</p>
      </CardContent>
    </Card>
  );
};

export default LearningSummaryCard;
