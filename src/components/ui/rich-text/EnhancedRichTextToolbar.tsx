import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Highlighter, 
  AlignLeft,
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Image,
  Link,
  Unlink,
  Quote,
  Code,
  Minus,
  Type,
  Palette,
  Upload
} from 'lucide-react';

interface EnhancedRichTextToolbarProps {
  editor: Editor;
}

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
];

const FONT_SIZES = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px (Default)' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '32px', label: '32px' },
  { value: '48px', label: '48px' },
];

const COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#374151', label: 'Gray' },
  { value: '#DC2626', label: 'Red' },
  { value: '#059669', label: 'Green' },
  { value: '#2563EB', label: 'Blue' },
  { value: '#7C3AED', label: 'Purple' },
  { value: '#D97706', label: 'Orange' },
  { value: '#DC2626', label: 'Pink' },
];

export const EnhancedRichTextToolbar = ({ editor }: EnhancedRichTextToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const setFontFamily = (fontFamily: string) => {
    if (fontFamily === 'Inter') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  };

  const setFontSize = (fontSize: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize }).run();
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        editor.chain().focus().setImage({ src: result }).run();
        setIsImageDialogOpen(false);
        setImageFile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsImageDialogOpen(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="border-b border-border p-3 flex flex-wrap items-center gap-1 bg-background">
      {/* Font Controls */}
      <div className="flex items-center gap-1">
        <Select onValueChange={setFontFamily}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setFontSize}>
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setTextColor}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <Palette className="h-3 w-3" />
          </SelectTrigger>
          <SelectContent>
            {COLORS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border" 
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Text Formatting */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleBold().run();
          }}
          data-active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleItalic().run();
          }}
          data-active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleUnderline().run();
          }}
          data-active={editor.isActive('underline')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleStrike().run();
          }}
          data-active={editor.isActive('strike')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleHighlight().run();
          }}
          data-active={editor.isActive('highlight')}
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleCode().run();
          }}
          data-active={editor.isActive('code')}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Text Alignment */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().setTextAlign('left').run();
          }}
          data-active={editor.isActive({ textAlign: 'left' })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().setTextAlign('center').run();
          }}
          data-active={editor.isActive({ textAlign: 'center' })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().setTextAlign('right').run();
          }}
          data-active={editor.isActive({ textAlign: 'right' })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().setTextAlign('justify').run();
          }}
          data-active={editor.isActive({ textAlign: 'justify' })}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Lists and Structure */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleBulletList().run();
          }}
          data-active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleOrderedList().run();
          }}
          data-active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().toggleBlockquote().run();
          }}
          data-active={editor.isActive('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            insertTable();
          }}
        >
          <Table className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            editor.chain().focus().setHorizontalRule().run();
          }}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Media and Links */}
      <div className="flex items-center">
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              data-active={editor.isActive('link')}
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addLink}>Add Link</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            handleButtonClick(e);
            removeLink();
          }}
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button onClick={addImageFromUrl} variant="outline">
                  Add from URL
                </Button>
              </div>
              <div className="relative">
                <Label htmlFor="image-file">Or upload file</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};