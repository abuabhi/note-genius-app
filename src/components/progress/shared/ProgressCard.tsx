
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const ProgressCard = ({ 
  title, 
  icon: Icon, 
  className, 
  children,
  headerAction 
}: ProgressCardProps) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-mint-600" />}
          {title}
        </CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
