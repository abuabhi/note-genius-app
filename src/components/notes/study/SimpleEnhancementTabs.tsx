import React, { useState } from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from './hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Sparkles, FileText, List, HelpCircle, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancementType } from '@/types/enhancement';

// Simple content renderer component
const SimpleContentRenderer = ({ content, fontSize, textAlign }: { content: string; fontSize: number; textAlign: TextAlignType }) => {
  if (!content) return <div className="text-muted-foreground">No content available</div>;
  
  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign === 'left' ? 'left' as const : 
              textAlign === 'center' ? 'center' as const : 
              'justify' as const
  };

  return (
    <div style={containerStyle} className="prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
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

  const generateEnhancement = async (enhancementType: string, column: string, statusColumn?: string) => {
    const loadingKey = enhancementType;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Set status to generating if status column exists
      if (statusColumn) {
        await updateNote({
          [statusColumn]: 'generating'
        });
      }

      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: {
          text: note.content || note.description || '',
          enhancementType
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const content = data.result;
      let processedContent = '';

      // Process different enhancement types
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

      // Update the note with the generated content
      const timestampColumnMap: { [key: string]: string } = {
        'summary': 'summary_generated_at',
        'key_points': 'key_points_generated_at',
        'markdown_content': 'markdown_content_generated_at',
        'enriched_content': 'enriched_content_generated_at',
        'questions_content': 'questions_generated_at'
      };

      const updates: any = {
        [column]: processedContent,
        [timestampColumnMap[column] || `${column}_generated_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (statusColumn) {
        updates[statusColumn] = 'completed';
      }

      await updateNote(updates);

      toast.success(`${enhancementType.replace('-', ' ')} generated successfully!`);
      
    } catch (error) {
      console.error(`Error generating ${enhancementType}:`, error);
      toast.error(`Failed to generate ${enhancementType.replace('-', ' ')}`);
      
      // Set status to failed if status column exists
      if (statusColumn) {
        await updateNote({
          [statusColumn]: 'failed'
        });
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const tabs = [
    {
      value: 'original',
      label: 'Original',
      icon: FileText,
      content: note.content || note.description || '',
      canGenerate: false
    },
    {
      value: 'markdown',
      label: 'Original++',
      icon: Code,
      content: note.markdown_content || '',
      canGenerate: true,
      enhancementType: 'convert-to-markdown',
      column: 'markdown_content',
      statusColumn: 'markdown_content_status'
    },
    {
      value: 'summary',
      label: 'Summary',
      icon: FileText,
      content: note.summary || '',
      canGenerate: true,
      enhancementType: 'summary',
      column: 'summary',
      statusColumn: 'summary_status'
    },
    {
      value: 'keyPoints',
      label: 'Key Points',
      icon: List,
      content: note.key_points || '',
      canGenerate: true,
      enhancementType: 'extract-key-points',
      column: 'key_points',
      statusColumn: 'key_points_status'
    },
    {
      value: 'enriched',
      label: 'Enriched Note',
      icon: Sparkles,
      content: note.enriched_content || '',
      canGenerate: true,
      enhancementType: 'enrich-note',
      column: 'enriched_content',
      statusColumn: 'enriched_status'
    },
    {
      value: 'questions',
      label: 'Top 10 Questions',
      icon: HelpCircle,
      content: note.questions_content || '',
      canGenerate: true,
      enhancementType: 'generate-questions',
      column: 'questions_content',
      statusColumn: 'questions_status'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EnhancementType)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-6 w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                {tab.canGenerate && (
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{tab.label}</h3>
                    <Button
                      onClick={() => generateEnhancement(tab.enhancementType!, tab.column!, tab.statusColumn)}
                      disabled={loadingStates[tab.enhancementType!]}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {loadingStates[tab.enhancementType!] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {tab.content ? 'Regenerate' : 'Generate'}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  {tab.content ? (
                    <SimpleContentRenderer
                      content={tab.content}
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
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};