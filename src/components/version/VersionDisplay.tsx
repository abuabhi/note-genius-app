import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getVersionInfo } from '@/utils/version';

interface VersionDisplayProps {
  variant?: 'badge' | 'text' | 'full';
  className?: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  variant = 'badge', 
  className = '' 
}) => {
  const versionInfo = getVersionInfo();

  if (variant === 'text') {
    return (
      <span className={`text-xs text-muted-foreground ${className}`}>
        v{versionInfo.version}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Version</span>
          <span className="text-sm text-muted-foreground">{versionInfo.fullVersion}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Build Time</span>
          <span className="text-sm text-muted-foreground">
            {new Date(versionInfo.buildTime).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Environment</span>
          <Badge variant={versionInfo.environment === 'production' ? 'default' : 'secondary'}>
            {versionInfo.environment}
          </Badge>
        </div>
        {versionInfo.gitCommit && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Git Commit</span>
            <span className="text-sm text-muted-foreground font-mono">
              {versionInfo.gitCommit.substring(0, 7)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs cursor-help border-primary/30 text-primary hover:bg-primary/5 ${className}`}
          >
            v{versionInfo.version}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>Version: {versionInfo.fullVersion}</div>
            <div>Built: {new Date(versionInfo.buildTime).toLocaleString()}</div>
            <div>Environment: {versionInfo.environment}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};