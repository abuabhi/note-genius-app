
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  description?: string;
}

export const ProgressCard = ({ 
  title, 
  icon: Icon, 
  className, 
  children,
  headerAction,
  description
}: ProgressCardProps) => {
  return (
    <Card className={cn("h-full border-mint-200 bg-white shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-mint-800 flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-mint-600" />}
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-mint-600">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
