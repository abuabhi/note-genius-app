import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import { DEBUG_CONFIG } from "@/config/debug";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";

interface EnhancementFlowDebuggerProps {
  note: Note;
  isEnhancing: boolean;
  onGenerateEnhancement?: (type: string) => Promise<void>;
}

export const EnhancementFlowDebugger = ({
  note,
  isEnhancing,
  onGenerateEnhancement
}: EnhancementFlowDebuggerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  // Don't render anything if debugging is disabled
  if (!DEBUG_CONFIG.UI_DEBUGGER) {
    return null;
  }

  // Auto-show debugger if there are any issues
  useEffect(() => {
    const hasStuckStatus = [
      note.summary_status,
      note.key_points_status,
      note.markdown_content_status,
      note.questions_status,
      note.enriched_status
    ].includes('generating');

    if (hasStuckStatus) {
      setIsVisible(true);
    }
  }, [note]);

  const testEnhancementFlow = async (type: string) => {
    debugLogger.logFlow(`TESTING_ENHANCEMENT_FLOW`, { type, noteId: note.id });
    setTestResults(prev => ({ ...prev, [type]: 'Testing...' }));
    
    try {
      if (!onGenerateEnhancement) {
        throw new Error('No onGenerateEnhancement function provided');
      }
      
      await onGenerateEnhancement(type);
      setTestResults(prev => ({ ...prev, [type]: '✅ Success' }));
      debugLogger.logFlow(`TEST_SUCCESS`, { type, noteId: note.id });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(prev => ({ 
        ...prev, 
        [type]: `❌ Error: ${errorMsg}` 
      }));
      debugLogger.logError(`Test failed for ${type}`, { error: errorMsg, noteId: note.id });
    }
  };

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-100 hover:bg-red-200 z-50"
      >
        🔧 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Enhancement Flow Debugger</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsVisible(false)}
        >
          ✕
        </Button>
      </div>
      
      {/* Note Status */}
      <div className="mb-4 p-2 bg-gray-50 rounded">
        <div className="text-xs font-medium mb-2">Note Status</div>
        <div className="space-y-1 text-xs">
          <div>ID: {note.id.substring(0, 8)}...</div>
          <div>Enhancing: <Badge variant={isEnhancing ? "destructive" : "default"}>{isEnhancing ? 'Yes' : 'No'}</Badge></div>
          <div>Summary: <Badge variant="outline">{note.summary_status || 'null'}</Badge></div>
          <div>Key Points: <Badge variant="outline">{note.key_points_status || 'null'}</Badge></div>
          <div>Questions: <Badge variant="outline">{note.questions_status || 'null'}</Badge></div>
          <div>Enriched: <Badge variant="outline">{note.enriched_status || 'null'}</Badge></div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-medium">Test Enhancement Types:</div>
        {[
          { type: 'summarize', label: 'Summary' },
          { type: 'extract-key-points', label: 'Key Points' },
          { type: 'generate-questions', label: 'Questions' },
          { type: 'enrich-note', label: 'Enrich' }
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => testEnhancementFlow(type)}
              disabled={isEnhancing}
              className="text-xs"
            >
              Test {label}
            </Button>
            <span className="text-xs text-gray-600">
              {testResults[type] || 'Not tested'}
            </span>
          </div>
        ))}
      </div>

      {/* Function Availability */}
      <div className="mt-4 p-2 bg-gray-50 rounded">
        <div className="text-xs font-medium mb-2">Function Availability</div>
        <div className="text-xs">
          onGenerateEnhancement: <Badge variant={onGenerateEnhancement ? "default" : "destructive"}>
            {onGenerateEnhancement ? 'Available' : 'Missing'}
          </Badge>
        </div>
      </div>
    </div>
  );
};