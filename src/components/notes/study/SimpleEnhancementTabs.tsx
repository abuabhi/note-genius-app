import React, { useState } from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from './hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, FileText, List, HelpCircle, Code, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancementType } from '@/types/enhancement';
import { NuclearContentRenderer } from './enhancements/NuclearContentRenderer';

// Utility function for content statistics
const getContentStats = (content: string) => {
  const wordCount = content ? content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = content ? content.length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words/minute
  return { wordCount, charCount, readingTime };
};

interface SimpleEnhancementTabsProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  onNoteUpdate?: () => void;
}

export const SimpleEnhancementTabs = ({
  note,
  fontSize,
  textAlign,
  onNoteUpdate
}: SimpleEnhancementTabsProps) => {
  const [activeTab, setActiveTab] = useState<EnhancementType>('original');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  // Local state for immediate display (like TestEnhancementPage)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

  const updateNote = async (updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', note.id);
      
      if (error) throw error;
      
      // Trigger note refresh if callback provided
      if (onNoteUpdate) {
        onNoteUpdate();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  // Background database save function (like TestEnhancementPage pattern)
  const saveToDatabase = async (column: string, content: string, statusColumn?: string) => {
    try {
      console.log('💾 Saving to database...', { column, contentLength: content.length });
      
      const timestampColumnMap: { [key: string]: string } = {
        'summary': 'summary_generated_at',
        'key_points': 'key_points_generated_at',
        'markdown_content': 'markdown_content_generated_at',
        'enriched_content': 'enriched_content_generated_at',
        'questions_content': 'questions_generated_at'
      };

      const updates: any = {
        [column]: content,
        [timestampColumnMap[column] || `${column}_generated_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (statusColumn) {
        updates[statusColumn] = 'completed';
      }

      await updateNote(updates);
      console.log('✅ Database save completed');
      
    } catch (error) {
      console.error('❌ Database save failed:', error);
      // Don't throw - this is background operation
    }
  };

  const generateEnhancement = async (enhancementType: string, column: string, statusColumn?: string) => {
    const loadingKey = enhancementType;
    
    // Exact same pattern as TestEnhancementPage
    console.time('🔥 Total Enhancement Time');
    const start = performance.now();
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      console.log('📤 Sending enhancement request...', {
        enhancementType,
        textLength: (note.content || note.description || '').length,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: {
          text: note.content || note.description || '',
          enhancementType
        }
      });

      const totalTime = performance.now() - start;
      console.timeEnd('🔥 Total Enhancement Time');

      if (error) {
        console.error('❌ Enhancement error:', error);
        toast.error('Enhancement failed: ' + error.message);
        return;
      }

      if (!data.success) {
        console.error('❌ Enhancement failed:', data.error);
        toast.error('Enhancement failed: ' + data.error);
        return;
      }

      console.log('✅ Enhancement completed:', {
        success: data.success,
        processingTime: data.processing_time,
        totalTime: totalTime,
        tokensUsed: data.tokens_used
      });

      const content = data.result;
      let processedContent = '';

      // Process different enhancement types (same as before)
      switch (enhancementType) {
        case 'summary':
          if (content.summary_overview) {
            processedContent = `# ${content.summary_title || 'Summary'}\n\n${content.summary_overview}`;
            if (content.key_points && content.key_points.length > 0) {
              processedContent += '\n\n## Key Points\n\n' + content.key_points.map((point: string) => `- ${point}`).join('\n');
            }
            if (content.quote_or_stat && content.quote_or_stat !== 'N/A') {
              processedContent += `\n\n## Notable Quote\n\n> ${content.quote_or_stat}`;
            }
          } else {
            processedContent = JSON.stringify(content, null, 2);
          }
          break;

        case 'extract-key-points':
          if (content.key_points && Array.isArray(content.key_points)) {
            processedContent = content.key_points.map((point: string) => `• ${point}`).join('\n\n');
          } else {
            processedContent = JSON.stringify(content, null, 2);
          }
          break;

        case 'generate-questions':
          if (content.questions && Array.isArray(content.questions)) {
            processedContent = content.questions.map((question: string, index: number) => `${index + 1}. ${question}`).join('\n\n');
          } else {
            processedContent = JSON.stringify(content, null, 2);
          }
          break;

        case 'convert-to-markdown':
        case 'enrich-note':
        default:
          processedContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
          break;
      }

      // IMMEDIATE DISPLAY (like TestEnhancementPage)
      setGeneratedContent(prev => ({
        ...prev,
        [column]: processedContent
      }));

      // Show success toast immediately
      toast.success(`Enhancement completed in ${(totalTime / 1000).toFixed(1)}s`);

      // BACKGROUND DATABASE SAVE (like TestEnhancementPage pattern)
      // Save to database in background without blocking UI
      setTimeout(() => {
        saveToDatabase(column, processedContent, statusColumn);
      }, 0);
      
    } catch (error) {
      const totalTime = performance.now() - start;
      console.timeEnd('🔥 Total Enhancement Time');
      console.error('💥 Enhancement request failed:', error);
      
      toast.error('Request failed: ' + (error instanceof Error ? error.message : 'Network error'));
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const regenerateAllEnhancements = async () => {
    const regenerableTabsData = tabs.filter(tab => tab.canGenerate && tab.enhancementType);
    
    for (const tab of regenerableTabsData) {
      if (tab.enhancementType && tab.column) {
        await generateEnhancement(tab.enhancementType, tab.column, tab.statusColumn);
        // Small delay between regenerations to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    toast.success('All enhancements regenerated successfully!');
  };

  const isRegeneratingAll = Object.values(loadingStates).some(Boolean);

  // Helper function to check if content is generated
  const hasContent = (content: string) => content && content.trim().length > 0;

  const tabs = [
    {
      value: 'original',
      label: 'Original',
      subtitle: 'Your original note content',
      icon: FileText,
      content: note.content || note.description || '',
      canGenerate: false,
      hasContent: hasContent(note.content || note.description || '')
    },
    {
      value: 'markdown',
      label: 'Original++',
      subtitle: 'Original note formatted',
      icon: Code,
      content: note.markdown_content || '',
      canGenerate: true,
      enhancementType: 'convert-to-markdown',
      column: 'markdown_content',
      statusColumn: 'markdown_content_status',
      hasContent: hasContent(generatedContent['markdown_content'] || note.markdown_content || '')
    },
    {
      value: 'summary',
      label: 'Summary',
      subtitle: 'AI-generated concise summary',
      icon: FileText,
      content: note.summary || '',
      canGenerate: true,
      enhancementType: 'summary',
      column: 'summary',
      statusColumn: 'summary_status',
      hasContent: hasContent(generatedContent['summary'] || note.summary || '')
    },
    {
      value: 'keyPoints',
      label: 'Key Points',
      subtitle: 'Essential highlights extracted',
      icon: List,
      content: note.key_points || '',
      canGenerate: true,
      enhancementType: 'extract-key-points',
      column: 'key_points',
      statusColumn: 'key_points_status',
      hasContent: hasContent(generatedContent['key_points'] || note.key_points || '')
    },
    {
      value: 'enriched',
      label: 'Enriched Note',
      subtitle: '50-70% more detailed content',
      icon: Sparkles,
      content: note.enriched_content || '',
      canGenerate: true,
      enhancementType: 'enrich-note',
      column: 'enriched_content',
      statusColumn: 'enriched_status',
      hasContent: hasContent(generatedContent['enriched_content'] || note.enriched_content || '')
    },
    {
      value: 'questions',
      label: 'Top 10 Questions',
      subtitle: 'Study questions and answers',
      icon: HelpCircle,
      content: note.questions_content || '',
      canGenerate: true,
      enhancementType: 'generate-questions',
      column: 'questions_content',
      statusColumn: 'questions_status',
      hasContent: hasContent(generatedContent['questions_content'] || note.questions_content || '')
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button
          onClick={regenerateAllEnhancements}
          disabled={isRegeneratingAll}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isRegeneratingAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating All...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate All
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EnhancementType)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-6 w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex flex-col items-center gap-1 py-3 px-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {tab.hasContent ? (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                  <tab.icon className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline font-medium">{tab.label}</span>
              </div>
              <span className="text-xs text-muted-foreground hidden md:block text-center leading-tight">
                {tab.subtitle}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header with metadata */}
                <div className="border-b border-border py-3 px-4 bg-gradient-to-r from-mint-50/30 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-2">
                        {tab.hasContent ? (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                        <tab.icon className="h-5 w-5 text-mint-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">{tab.label}</h2>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{tab.subtitle}</span>
                          {(() => {
                            const displayContent = generatedContent[tab.column!] || tab.content;
                            if (displayContent) {
                              const stats = getContentStats(displayContent);
                              return (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <FileText className="h-3 w-3" />
                                    <span>{stats.wordCount} words</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{stats.readingTime} min read</span>
                                  </div>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {tab.canGenerate && (
                      <Button
                        onClick={() => generateEnhancement(tab.enhancementType!, tab.column!, tab.statusColumn)}
                        disabled={loadingStates[tab.enhancementType!]}
                        variant="ghost"
                        size="sm"
                        className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
                      >
                        {loadingStates[tab.enhancementType!] ? (
                          <Loader2 className="h-4 w-4 animate-spin text-mint-600" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-mint-600" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-auto p-6">
                  {(() => {
                    // Prioritize generated content over database content (like TestEnhancementPage)
                    const displayContent = generatedContent[tab.column!] || tab.content;
                    
                    return displayContent ? (
                      <NuclearContentRenderer
                        content={displayContent}
                        fontSize={fontSize}
                        textAlign={textAlign}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {tab.canGenerate ? (
                          <div className="text-center">
                            <p>No {tab.label.toLowerCase()} available</p>
                            <p className="text-sm mt-2">Click "Generate" to create one</p>
                          </div>
                        ) : (
                          <p>No content available</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};