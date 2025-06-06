
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Highlighter,
  Palette,
} from 'lucide-react';

interface RichTextToolbarProps {
  editor: Editor;
}

export const RichTextToolbar = ({ editor }: RichTextToolbarProps) => {
  if (!editor) {
    return null;
  }

  const setFontSize = (size: string) => {
    // Safer font size implementation
    const { from, to } = editor.state.selection;
    
    if (from === to) return; // No selection
    
    editor.chain()
      .focus()
      .setMark('textStyle', { fontSize: size })
      .run();
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  // Prevent event bubbling that might trigger form submission
  const handleButtonClick = (callback: () => void) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      callback();
    };
  };

  return (
    <div className="border-b border-input p-2 flex flex-wrap items-center gap-1">
      {/* Font Size Selector */}
      <Select onValueChange={setFontSize}>
        <SelectTrigger className="w-20 h-8">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12px">12px</SelectItem>
          <SelectItem value="14px">14px</SelectItem>
          <SelectItem value="16px">16px</SelectItem>
          <SelectItem value="18px">18px</SelectItem>
          <SelectItem value="20px">20px</SelectItem>
          <SelectItem value="24px">24px</SelectItem>
          <SelectItem value="28px">28px</SelectItem>
          <SelectItem value="32px">32px</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color Selector */}
      <Select onValueChange={setTextColor}>
        <SelectTrigger className="w-20 h-8">
          <Palette className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="#000000">Black</SelectItem>
          <SelectItem value="#ef4444">Red</SelectItem>
          <SelectItem value="#22c55e">Green</SelectItem>
          <SelectItem value="#3b82f6">Blue</SelectItem>
          <SelectItem value="#a855f7">Purple</SelectItem>
          <SelectItem value="#f59e0b">Orange</SelectItem>
          <SelectItem value="#14b8a6">Teal</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleUnderline().run())}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        type="button"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleStrike().run())}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        type="button"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('highlight') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleHighlight().run())}
        type="button"
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('left').run())}
        type="button"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('center').run())}
        type="button"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('right').run())}
        type="button"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('justify').run())}
        type="button"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};
