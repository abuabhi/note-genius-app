
interface DonutProgressProps {
  current: number;
  total: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const DonutProgress = ({ 
  current, 
  total, 
  size = 'medium',
  className = "" 
}: DonutProgressProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const sizeConfig = {
    small: { radius: 16, strokeWidth: 3, textSize: 'text-xs', containerSize: 'w-10 h-10' },
    medium: { radius: 20, strokeWidth: 4, textSize: 'text-sm', containerSize: 'w-12 h-12' },
    large: { radius: 24, strokeWidth: 5, textSize: 'text-base', containerSize: 'w-16 h-16' }
  };
  
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${config.containerSize} ${className}`}>
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${(config.radius + config.strokeWidth) * 2} ${(config.radius + config.strokeWidth) * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-mint-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-medium text-mint-700 ${config.textSize}`}>
          {current}/{total}
        </span>
      </div>
    </div>
  );
};
