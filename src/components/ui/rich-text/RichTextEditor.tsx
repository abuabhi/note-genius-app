
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { useState } from 'react';
import { RichTextToolbar } from './RichTextToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  readOnly = false,
  className = '',
  placeholder = 'Start writing...'
}: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Highlight,
      BulletList,
      OrderedList,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none min-h-[200px] ${isFocused ? 'focused' : ''} ${className}`,
        placeholder,
      },
    },
  });
  
  return (
    <div className="border border-input rounded-md overflow-hidden">
      {!readOnly && editor && (
        <RichTextToolbar editor={editor} />
      )}
      <div 
        className={`p-3 min-h-[200px] ${readOnly ? 'bg-muted/30' : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
