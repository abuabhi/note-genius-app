
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Highlighter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface RichTextToolbarProps {
  editor: Editor;
}

const highlightColors = [
  { name: 'Yellow', color: '#FEF7CD' },
  { name: 'Green', color: '#F2FCE2' },
  { name: 'Blue', color: '#D3E4FD' },
  { name: 'Pink', color: '#FFDEE2' },
  { name: 'Purple', color: '#E5DEFF' },
  { name: 'Orange', color: '#FDE1D3' },
];

export const RichTextToolbar = ({ editor }: RichTextToolbarProps) => {
  if (!editor) return null;

  const isHighlightActive = () => {
    return editor.isActive('highlight') || highlightColors.some(({ color }) => 
      editor.isActive('highlight', { color })
    );
  };

  const toggleHighlight = (color?: string) => {
    if (color) {
      editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor.chain().focus().toggleHighlight().run();
    }
  };

  return (
    <div className="border-b border-input bg-background p-1 flex flex-wrap gap-1 items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <div className="h-4 w-px bg-border mx-1" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={isHighlightActive() ? 'bg-accent' : ''}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => toggleHighlight()}>
            <div className="h-4 w-4 bg-yellow-100 rounded mr-2"></div>
            <span>Default</span>
          </DropdownMenuItem>
          {highlightColors.map(({ name, color }) => (
            <DropdownMenuItem key={color} onClick={() => toggleHighlight(color)}>
              <div className="h-4 w-4 rounded mr-2" style={{ backgroundColor: color }}></div>
              <span>{name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
            <div className="h-4 w-4 mr-2 border border-gray-300"></div>
            <span>No Highlight</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
