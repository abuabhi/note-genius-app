
import React from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface NoteSummaryProps {
  summary?: string;
  description: string;
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  onGenerateSummary?: () => Promise<void>;
}

export const NoteSummary: React.FC<NoteSummaryProps> = ({
  summary,
  description,
  status,
  onGenerateSummary
}) => {
  const displayText = summary || description;
  
  const renderContent = () => {
    if (status === 'generating') {
      return (
        <div className="flex items-center space-x-2 text-mint-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Generating summary...</span>
        </div>
      );
    }
    
    if (status === 'failed') {
      return (
        <div className="flex flex-col space-y-1">
          <p className="text-sm line-clamp-2 text-gray-600">{displayText}</p>
          {onGenerateSummary && (
            <button 
              onClick={onGenerateSummary}
              className="text-xs text-mint-600 hover:text-mint-800 underline self-start"
            >
              Try generating summary again
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col space-y-1">
        {summary ? (
          <div className="prose prose-sm max-w-none text-gray-600">
            <ReactMarkdown>
              {displayText}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm line-clamp-2 text-gray-600">{displayText}</p>
        )}
        
        {!summary && onGenerateSummary && status !== 'pending' && status !== 'generating' && (
          <button 
            onClick={onGenerateSummary}
            className="text-xs text-mint-600 hover:text-mint-800 underline self-start"
          >
            Generate summary
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-2">
      {renderContent()}
    </div>
  );
};
