
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { useState, useEffect } from 'react';
import { RichTextToolbar } from './RichTextToolbar';
import { EnhancedRichTextToolbar } from './EnhancedRichTextToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  defaultAlignment?: 'left' | 'center' | 'right' | 'justify';
  enhanced?: boolean;
}

export const RichTextEditor = ({
  content,
  onChange,
  readOnly = false,
  className = '',
  placeholder = 'Start writing...',
  defaultAlignment = 'left',
  enhanced = false
}: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit to ensure bold works properly
        bold: {
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment,
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200 px-1 rounded',
        },
      }),
      Underline,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      BulletList,
      OrderedList,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
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
      // Prevent form submission on text selection
      handleDOMEvents: {
        mouseup: (view, event) => {
          event.stopPropagation();
          return false;
        },
        keydown: (view, event) => {
          // Prevent Enter from submitting form when in editor
          if (event.key === 'Enter' && !event.shiftKey) {
            event.stopPropagation();
          }
          return false;
        },
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });
  
  // Set default alignment when editor is initialized
  useEffect(() => {
    if (editor && !content && defaultAlignment) {
      editor.commands.setTextAlign(defaultAlignment);
    }
  }, [editor, content, defaultAlignment]);
  
  return (
    <div className="border border-input rounded-md overflow-hidden">
      {!readOnly && editor && (
        enhanced ? (
          <EnhancedRichTextToolbar editor={editor} />
        ) : (
          <RichTextToolbar editor={editor} />
        )
      )}
      <div 
        className={`p-3 min-h-[200px] ${readOnly ? 'bg-muted/30' : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
