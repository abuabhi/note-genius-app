import { Zap, Clock, AlertTriangle } from "lucide-react";

interface PerformanceContextBadgeProps {
  processingTime: number;
  isCacheHit?: boolean;
  variant?: 'normal' | 'fast' | 'slow';
}

export const PerformanceContextBadge = ({
  processingTime,
  isCacheHit = false,
  variant
}: PerformanceContextBadgeProps) => {
  const timeInSeconds = processingTime / 1000;
  
  // Auto-detect variant if not provided
  const actualVariant = variant || (() => {
    if (isCacheHit || timeInSeconds < 1) return 'fast';
    if (timeInSeconds <= 15) return 'normal';
    return 'slow';
  })();

  const getStatusConfig = () => {
    switch (actualVariant) {
      case 'fast':
        return {
          icon: Zap,
          text: isCacheHit ? '⚡ Cached' : '⚡ Fast',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'slow':
        return {
          icon: AlertTriangle,
          text: '🐌 Slow',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Normal',
          bgColor: 'bg-mint-100',
          textColor: 'text-mint-700',
          borderColor: 'border-mint-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </div>
  );
};