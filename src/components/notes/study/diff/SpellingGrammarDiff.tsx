
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { UnifiedContentRenderer } from '@/components/notes/study/enhancements/UnifiedContentRenderer';
import { TextAlignType } from '../hooks/useStudyViewState';

interface SpellingGrammarDiffProps {
  originalContent: string;
  fixedContent: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

interface DiffChange {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

const generateWordDiff = (original: string, fixed: string): DiffChange[] => {
  const originalWords = original.split(/(\s+)/);
  const fixedWords = fixed.split(/(\s+)/);
  
  const changes: DiffChange[] = [];
  let originalIndex = 0;
  let fixedIndex = 0;
  
  while (originalIndex < originalWords.length || fixedIndex < fixedWords.length) {
    const originalWord = originalWords[originalIndex];
    const fixedWord = fixedWords[fixedIndex];
    
    if (originalWord === fixedWord) {
      changes.push({ type: 'unchanged', text: originalWord });
      originalIndex++;
      fixedIndex++;
    } else if (!originalWord) {
      changes.push({ type: 'added', text: fixedWord });
      fixedIndex++;
    } else if (!fixedWord) {
      changes.push({ type: 'removed', text: originalWord });
      originalIndex++;
    } else {
      // Look ahead to find the best match
      const nextOriginalMatch = originalWords.slice(originalIndex + 1).findIndex(w => w === fixedWord);
      const nextFixedMatch = fixedWords.slice(fixedIndex + 1).findIndex(w => w === originalWord);
      
      if (nextOriginalMatch !== -1 && (nextFixedMatch === -1 || nextOriginalMatch < nextFixedMatch)) {
        changes.push({ type: 'removed', text: originalWord });
        originalIndex++;
      } else if (nextFixedMatch !== -1) {
        changes.push({ type: 'added', text: fixedWord });
        fixedIndex++;
      } else {
        // Direct replacement
        changes.push({ type: 'removed', text: originalWord });
        changes.push({ type: 'added', text: fixedWord });
        originalIndex++;
        fixedIndex++;
      }
    }
  }
  
  return changes;
};

export const SpellingGrammarDiff = ({
  originalContent,
  fixedContent,
  fontSize,
  textAlign,
  className
}: SpellingGrammarDiffProps) => {
  const [showDiff, setShowDiff] = useState(true);
  
  if (!originalContent || !fixedContent) {
    return (
      <UnifiedContentRenderer
        content={fixedContent || originalContent}
        fontSize={fontSize}
        textAlign={textAlign}
        className={className}
        isMarkdown={true}
      />
    );
  }
  
  const diffChanges = generateWordDiff(originalContent, fixedContent);
  
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Spelling & Grammar Fixes Applied</span>
          <div className="flex items-center gap-4 mt-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Removed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Added</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDiff(!showDiff)}
          className="text-xs"
        >
          {showDiff ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide Changes
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Show Changes
            </>
          )}
        </Button>
      </div>
      
      {showDiff ? (
        <div 
          className="prose prose-gray max-w-none leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {diffChanges.map((change, index) => {
            if (change.type === 'unchanged') {
              return <span key={index}>{change.text}</span>;
            } else if (change.type === 'removed') {
              return (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 line-through px-1 rounded"
                  title="Removed text"
                >
                  {change.text}
                </span>
              );
            } else {
              return (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-1 rounded"
                  title="Added text"
                >
                  {change.text}
                </span>
              );
            }
          })}
        </div>
      ) : (
        <UnifiedContentRenderer
          content={fixedContent}
          fontSize={fontSize}
          textAlign={textAlign}
          isMarkdown={true}
        />
      )}
    </div>
  );
};
