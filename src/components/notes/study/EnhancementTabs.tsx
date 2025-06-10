
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
    <Tabs defaultValue="original" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="original">Original</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="keyPoints">Key Points</TabsTrigger>
        <TabsTrigger value="improved">Improved</TabsTrigger>
      </TabsList>
      
      <TabsContent value="original" className="mt-4">
        <UnifiedContentRenderer
          content={note.content || note.description || ''}
          fontSize={fontSize}
          textAlign={textAlign}
          isMarkdown={true}
        />
      </TabsContent>
      
      <TabsContent value="summary" className="mt-4">
        <UnifiedContentRenderer
          content={note.summary || 'No summary available'}
          fontSize={fontSize}
          textAlign={textAlign}
          isMarkdown={true}
        />
      </TabsContent>
      
      <TabsContent value="keyPoints" className="mt-4">
        <UnifiedContentRenderer
          content={note.key_points || 'No key points available'}
          fontSize={fontSize}
          textAlign={textAlign}
          isMarkdown={true}
        />
      </TabsContent>
      
      <TabsContent value="improved" className="mt-4">
        <UnifiedContentRenderer
          content={note.improved_content || 'No improved content available'}
          fontSize={fontSize}
          textAlign={textAlign}
          isMarkdown={true}
        />
      </TabsContent>
    </Tabs>
  );
};
