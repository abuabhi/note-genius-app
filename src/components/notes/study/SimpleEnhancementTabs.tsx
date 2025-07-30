import React, { useState, useMemo } from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from './hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, FileText, List, HelpCircle, Code, RefreshCw, Clock } from 'lucide-react';
import { EnhancementType } from '@/types/enhancement';
import { NuclearContentRenderer } from './enhancements/NuclearContentRenderer';
import { useEnhancementManager } from '@/hooks/useEnhancementManager';

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
  const { generatedContent, generateEnhancement, regenerateAll, isLoading, isAnyLoading } = useEnhancementManager(note, onNoteUpdate);

  const hasContent = (content: string) => content && content.trim().length > 0;

  const tabs = useMemo(() => [
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
  ], [note, generatedContent]);

  const handleRegenerateAll = () => {
    const enhanceableItems = tabs.filter(tab => tab.canGenerate && tab.enhancementType)
      .map(tab => ({ 
        enhancementType: tab.enhancementType!, 
        column: tab.column!, 
        statusColumn: tab.statusColumn 
      }));
    regenerateAll(enhanceableItems);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleRegenerateAll}
          disabled={isAnyLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isAnyLoading ? (
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
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EnhancementType)} orientation="vertical" className="flex-1 flex">
        <div className="w-64 flex-shrink-0">
          <TabsList className="flex flex-col h-full w-full p-1 space-y-1 bg-muted">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="w-full justify-start py-4 px-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    {tab.hasContent ? (
                      <div className="w-2 h-2 rounded-full bg-mint-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{tab.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 ml-6">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="h-full mt-0">
              <Card className="h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Header with metadata */}
                  <div className="border-b border-border py-4 px-6 bg-gradient-to-r from-mint-50/30 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center gap-2">
                          {tab.hasContent ? (
                            <div className="w-3 h-3 rounded-full bg-mint-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          )}
                          <tab.icon className="h-5 w-5 text-mint-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{tab.label}</h2>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
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
                          disabled={isLoading(tab.enhancementType!)}
                          variant="ghost"
                          size="sm"
                          className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
                        >
                          {isLoading(tab.enhancementType!) ? (
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
        </div>
      </Tabs>
    </div>
  );
};