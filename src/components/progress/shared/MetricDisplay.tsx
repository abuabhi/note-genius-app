
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricDisplayProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'mint' | 'blue' | 'green' | 'yellow' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricDisplay = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'mint',
  size = 'md',
  className
}: MetricDisplayProps) => {
  const colorClasses = {
    mint: 'text-mint-600 bg-mint-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            <Icon className={iconSizeClasses[size]} />
          </div>
        )}
        <div className="flex-1">
          <div className={cn("font-bold", sizeClasses[size], `text-${color}-800`)}>
            {value}
          </div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
};
