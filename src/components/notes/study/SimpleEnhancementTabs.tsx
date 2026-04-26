import React, { useState, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from './hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, FileText, List, HelpCircle, Code, RefreshCw, Clock, Palette, PaletteIcon } from 'lucide-react';
import { EnhancementType } from '@/types/enhancement';
import { ExpandableContentRenderer } from './expansion/ExpandableContentRenderer';
import { useEnhancementManager } from '@/hooks/useEnhancementManager';
import { UsageIndicator } from '@/components/notes/enrichment/UsageIndicator';
import { useAiEnrichmentUsage } from '@/hooks/usage/useAiEnrichmentUsage';
import { ReportAIContentButton } from '@/components/feedback/ReportAIContentButton';

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
  activeContentType?: EnhancementType;
  onActiveContentTypeChange?: (value: EnhancementType) => void;
}

export const SimpleEnhancementTabs = React.memo(({
  note,
  fontSize,
  textAlign,
  onNoteUpdate,
  activeContentType,
  onActiveContentTypeChange
}: SimpleEnhancementTabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState<EnhancementType>(activeContentType ?? 'original');
  const activeTab = activeContentType ?? internalActiveTab;
  const setActiveTab = (value: EnhancementType) => {
    if (onActiveContentTypeChange) {
      onActiveContentTypeChange(value);
    } else {
      setInternalActiveTab(value);
    }
  };
  const [hideColoring, setHideColoring] = useState(false);
  const { generatedContent, generateEnhancement, regenerateAll, isLoading, isAnyLoading } = useEnhancementManager(note, onNoteUpdate);
  const { usageCount, monthlyLimit, isLoading: statsLoading, refetch: refetchUsage } = useAiEnrichmentUsage();

  const hasContent = useCallback((content: string) => content && content.trim().length > 0, []);

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
  return (
    <div className="h-full flex flex-col">
      
      {/* NUCLEAR FIX: Remove conflicting flex layouts and let Radix handle orientation */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as EnhancementType)} 
        orientation="vertical" 
        className="h-full"
      >
        <div className="flex gap-6 h-full items-start">
          {/* FIXED: Use flexbox with items-start to align tabs to top */}
          <TabsList className="w-[280px] h-full p-2 bg-muted/30 self-start data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:space-y-1 data-[orientation=vertical]:items-start">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="w-full justify-start py-4 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    {tab.hasContent ? (
                      <div className="w-2 h-2 rounded-full bg-mint-500 data-[state=active]:bg-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    )}
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-medium block">{tab.label}</span>
                    <span className="text-xs text-muted-foreground block truncate">{tab.subtitle}</span>
                  </div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content area - fixed width and height */}
          <div className="flex-1 min-w-0">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="h-full min-h-[600px] m-0 data-[state=active]:block data-[state=inactive]:hidden">
                <Card className="h-full w-full">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Header with metadata */}
                    <div className="border-b border-border py-4 px-6 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center gap-2">
                            {tab.hasContent ? (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                            )}
                            <tab.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">{tab.label}</h2>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
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
                        
                        <div className="flex items-center gap-2">
                          {tab.value !== 'original' && tab.hasContent && (
                            <ReportAIContentButton
                              contentType="note_enrichment"
                              contentId={note.id}
                              contentSample={(generatedContent[tab.column!] || tab.content || '').slice(0, 300)}
                              label="Report"
                            />
                          )}
                          {tab.value === 'enriched' && (
                            <Button
                              onClick={() => setHideColoring(!hideColoring)}
                              variant="ghost"
                              size="sm"
                              className={`transition-all duration-200 ${
                                hideColoring 
                                  ? 'text-muted-foreground hover:text-foreground' 
                                  : 'text-mint-600 hover:text-mint-700 bg-mint-50/50 hover:bg-mint-100/50'
                              }`}
                              title={hideColoring ? 'Show enhanced content coloring' : 'Hide enhanced content coloring'}
                            >
                              {hideColoring ? (
                                <PaletteIcon className="h-4 w-4" />
                              ) : (
                                <Palette className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {tab.canGenerate && (
                            <Button
                              onClick={() => generateEnhancement(tab.enhancementType!, tab.column!, tab.statusColumn)}
                              disabled={isLoading(tab.enhancementType!)}
                              variant="outline"
                              size="sm"
                              className={`bg-white hover:bg-mint-50 text-mint-700 hover:text-mint-800 ${
                                !tab.hasContent && !isLoading(tab.enhancementType!)
                                  ? 'gen-animated-border'
                                  : 'border-mint-200'
                              }`}
                            >
                              {isLoading(tab.enhancementType!) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  {tab.hasContent ? 'ReGenerate' : 'Generate'}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Usage indicator for Enriched tab */}
                    {tab.value === 'enriched' && (
                      <div className="px-6 pt-4">
                        <UsageIndicator currentUsage={usageCount} monthlyLimit={monthlyLimit} isLoading={statsLoading} />
                      </div>
                    )}
                    {/* Content area */}
                    <div className="flex-1 overflow-auto p-6">
                      {(() => {
                        const displayContent = generatedContent[tab.column!] || tab.content;
                        
                        return displayContent ? (
                          <ExpandableContentRenderer
                            content={displayContent}
                            fontSize={fontSize}
                            textAlign={textAlign}
                            contentType={tab.value}
                            noteTitle={note.title}
                            noteId={note.id}
                            hideColoring={hideColoring}
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
        </div>
      </Tabs>
    </div>
  );
});