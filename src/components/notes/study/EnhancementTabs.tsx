
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Note } from '@/types/note';
import { UnifiedContentRenderer } from './enhancements/UnifiedContentRenderer';

interface EnhancementTabsProps {
  note: Note;
  fontSize: number;
  textAlign: 'left' | 'center' | 'justify';
}

export const EnhancementTabs = ({ note, fontSize, textAlign }: EnhancementTabsProps) => {
  return (
    <Tabs defaultValue="original" orientation="vertical" className="flex h-full">
      <TabsList className="flex-col items-start h-auto w-48">
        <TabsTrigger value="original" className="w-full justify-start">Original</TabsTrigger>
        <TabsTrigger value="summary" className="w-full justify-start">Summary</TabsTrigger>
        <TabsTrigger value="keyPoints" className="w-full justify-start">Key Points</TabsTrigger>
        <TabsTrigger value="improved" className="w-full justify-start">Improved</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 ml-4">
        <TabsContent value="original">
          <UnifiedContentRenderer
            content={note.content || note.description || ''}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={true}
          />
        </TabsContent>
        
        <TabsContent value="summary">
          <UnifiedContentRenderer
            content={note.summary || 'No summary available'}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={true}
          />
        </TabsContent>
        
        <TabsContent value="keyPoints">
          <UnifiedContentRenderer
            content={note.key_points || 'No key points available'}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={true}
          />
        </TabsContent>
        
        <TabsContent value="improved">
          <UnifiedContentRenderer
            content={note.questions_content || 'No questions available'}
            fontSize={fontSize}
            textAlign={textAlign}
            isMarkdown={true}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
