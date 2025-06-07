
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  progress?: number;
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  progress, 
  icon: Icon, 
  subtitle,
  trend,
  className 
}: MetricCardProps) => {
  return (
    <Card className={cn("h-full border-mint-200 bg-white shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-mint-700">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-mint-500" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-mint-800">{value}</p>
            {trend && (
              <div className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-mint-600">{progress}% complete</p>
            </div>
          )}
          {subtitle && <p className="text-xs text-mint-600">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
